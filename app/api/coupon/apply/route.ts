import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export async function POST(request: Request) {
  try {
    const { couponName, subtotal } = await request.json();

    if (!couponName || !subtotal) {
      return NextResponse.json({ error: 'Coupon name and subtotal are required' }, { status: 400 });
    }

    await dbConnect();
    const coupon = await Coupon.findOne({ couponName: couponName.toUpperCase(), isList: true });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 404 });
    }

    // Check expiry
    const expiry = new Date(coupon.expiryDate);
    if (expiry < new Date()) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    // Check minimum purchase amount
    if (subtotal < coupon.minValue) {
      return NextResponse.json({
        error: `Minimum purchase of ₹${coupon.minValue} required to use this coupon.`,
      }, { status: 400 });
    }

    // Calculate discount
    const calculatedDiscount = (subtotal * coupon.couponValue) / 100;
    const finalDiscount = Math.min(calculatedDiscount, coupon.maxValue);

    return NextResponse.json({
      success: true,
      couponName: coupon.couponName,
      discount: finalDiscount,
      discountPercentage: coupon.couponValue,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
