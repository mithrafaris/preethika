import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
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

    const { userId, block } = await request.json();
    if (!userId || typeof block !== 'boolean') {
      return NextResponse.json({ error: 'User ID and block status are required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.isBlock = block;
    await user.save();

    return NextResponse.json({ success: true, isBlock: user.isBlock });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
