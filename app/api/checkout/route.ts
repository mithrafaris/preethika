import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Coupon from '@/lib/models/Coupon';
import { verifyToken } from '@/lib/jwt';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { addressId, paymentMethod, couponName } = body;

    if (!addressId || !paymentMethod) {
      return NextResponse.json({ error: 'Address and payment method are required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId).populate({
      path: 'cart.product_id',
      model: Product,
    });

    if (!user || !user.cart || user.cart.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    // Resolve address string
    const addressItem = user.address.items.id(addressId);
    if (!addressItem) {
      return NextResponse.json({ error: 'Selected address was not found' }, { status: 400 });
    }
    const addressStr = `${addressItem.name}, ${addressItem.phone}. House: ${addressItem.houseNumber}, ${addressItem.address}, ${addressItem.city}, ${addressItem.state} - ${addressItem.pincode}`;

    // Verify stock and calculate subtotal
    let subtotal = 0;
    const orderItemsList = [];

    for (const item of user.cart) {
      const prod = item.product_id;
      if (!prod || !prod.isList) {
        return NextResponse.json({ error: 'Some items in your cart are no longer available' }, { status: 400 });
      }
      if (prod.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${prod.productName}. Only ${prod.stock} items left.` }, { status: 400 });
      }
      subtotal += prod.price * item.quantity;
      orderItemsList.push({
        product_id: prod._id,
        quantity: item.quantity,
        orderStatus: 'placed',
      });
    }

    // Process Coupon discount
    let discount = 0;
    if (couponName) {
      const coupon = await Coupon.findOne({ couponName: couponName.toUpperCase(), isList: true });
      if (coupon) {
        // Validate min purchase
        if (subtotal >= coupon.minValue) {
          const discountPct = coupon.couponValue; // e.g. 10 for 10%
          const disc = (subtotal * discountPct) / 100;
          discount = Math.min(disc, coupon.maxValue);
        }
      }
    }

    const finalAmount = Math.max(0, subtotal - discount);

    // Wallet transaction check
    if (paymentMethod === 'wallet') {
      if ((user.wallet || 0) < finalAmount) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
      }
      user.wallet -= finalAmount;
    }

    // Deduct stock from products
    for (const item of user.cart) {
      const prod = item.product_id;
      prod.stock -= item.quantity;
      await prod.save();
    }

    // Generate numeric order ID
    const generatedId = 'FLB' + Math.floor(100000 + Math.random() * 900000);

    // Create Order document
    const newOrder = await Order.create({
      orderId: generatedId,
      user: userId,
      orderItems: orderItemsList,
      totalAmount: finalAmount,
      paymentMethod,
      address: addressStr,
      purchaseDate: new Date(),
    });

    // Clear cart and save user
    user.cart = [];
    await user.save();

    return NextResponse.json({ success: true, orderId: newOrder.orderId, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
