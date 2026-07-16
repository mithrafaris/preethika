import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

// UPDATE Address
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: addressId } = await context.params;
    const body = await request.json();

    const { name, phone, houseNumber, pincode, address, city, state } = body;
    if (!name || !phone || !houseNumber || !pincode || !address || !city || !state) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { _id: userId, 'address.items._id': addressId },
      {
        $set: {
          'address.items.$.name': name,
          'address.items.$.phone': phone,
          'address.items.$.houseNumber': houseNumber,
          'address.items.$.pincode': pincode,
          'address.items.$.address': address,
          'address.items.$.city': city,
          'address.items.$.state': state,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, addresses: user.address?.items || [] });
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE Address
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: addressId } = await context.params;

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { 'address.items': { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, addresses: user.address?.items || [] });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
