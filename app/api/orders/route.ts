import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'orderItems.product_id',
        model: Product,
      })
      .sort({ purchaseDate: -1 });

    const formattedOrders = orders.map((order: any) => ({
      _id: order._id.toString(),
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      purchaseDate: order.purchaseDate,
      deliveryDate: order.deliveryDate,
      address: order.address,
      orderCancleRequest: order.orderCancleRequest,
      orderReturnRequest: order.orderReturnRequest,
      items: order.orderItems.map((item: any) => ({
        productId: item.product_id?._id?.toString() || '',
        productName: item.product_id?.productName || 'Unlisted Product',
        images: item.product_id?.images || [],
        quantity: item.quantity,
        status: item.orderStatus || 'placed',
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Cancel Order Route
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, reason } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    await dbConnect();
    const order = await Order.findById(orderId).populate('orderItems.product_id');
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.user.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized action' }, { status: 401 });
    }

    // Update order cancellation details
    order.orderCancleRequest = true;
    order.orderCancelReason = reason || 'No reason specified';

    // Update all item statuses to cancelled
    order.orderItems.forEach((item: any) => {
      item.orderStatus = 'cancelled';
    });

    await order.save();

    // Refund to user wallet if paid with wallet
    if (order.paymentMethod === 'wallet') {
      const user = await User.findById(userId);
      if (user) {
        user.wallet = (user.wallet || 0) + order.totalAmount;
        await user.save();
      }
    }

    // Add stock back to products
    for (const item of order.orderItems) {
      if (item.product_id) {
        item.product_id.stock += item.quantity;
        await item.product_id.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Order cancelled successfully and refund processed.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
