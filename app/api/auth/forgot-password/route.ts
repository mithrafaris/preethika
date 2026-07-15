import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json({ message: 'If an account exists, a reset code was generated.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    await user.save();

    // Print to server console (since we don't have email set up)
    console.log(`\n\n========================================`);
    console.log(` PASSWORD RESET REQUESTED FOR: ${email}`);
    console.log(` YOUR OTP IS: ${otp}`);
    console.log(`========================================\n\n`);

    // For testing purposes locally, we return the OTP to the client so it's easy for the user
    return NextResponse.json({
      message: 'OTP generated successfully. Check your terminal or the response below.',
      test_otp: otp
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
