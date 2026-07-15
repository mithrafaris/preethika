import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select('name email isadmin wallet cart');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total quantity of items in cart
    const cartCount = user.cart ? user.cart.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        isadmin: user.isadmin,
        wallet: user.wallet || 0,
        cartCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
