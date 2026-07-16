import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import crypto from 'crypto';

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return NextResponse.json({ error: 'Payment details missing' }, { status: 400 });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.wallet = (user.wallet || 0) + amount;
    await user.save();

    return NextResponse.json({ success: true, wallet: user.wallet });
  } catch (err: any) {
    console.error('Wallet Verify Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
