import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import { verifyToken } from '@/lib/jwt';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
});

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `wallet_${userId}_${Date.now()}`.substring(0, 40),
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: options.amount,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
    });

  } catch (err: any) {
    console.error('Razorpay Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
