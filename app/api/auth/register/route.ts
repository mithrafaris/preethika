import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { name, email, password, mobile } = await request.json();

    if (!name || !email || !password || !mobile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!mobile.match(/^[6789]\d{9}$/)) {
      return NextResponse.json({ error: 'Invalid mobile number. Must be 10 digits starting with 6-9.' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or mobile already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (default wallet set to 100)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      wallet: 100, // pre-funded wallet as in original database schema
    });

    // Sign session token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      isadmin: user.isadmin || false,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        isadmin: user.isadmin || false,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
