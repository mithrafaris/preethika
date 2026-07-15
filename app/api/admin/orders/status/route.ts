import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyToken } from '@/lib/jwt';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return false;
  const decoded = verifyToken(token);
  return decoded && decoded.isadmin;
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Update status for all items in order
    order.orderItems.forEach((item: any) => {
      item.orderStatus = status;
    });

    if (status === 'delivered') {
      order.deliveryDate = new Date();
    }

    await order.save();

    return NextResponse.json({ success: true, message: 'Order status updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
