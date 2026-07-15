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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(userId).select('address');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ addresses: user.address?.items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, phone, houseNumber, pincode, address, city, state, landmark, alternatePhone } = body;

    if (!name || !phone || !houseNumber || !pincode || !address || !city || !state) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!user.address) user.address = { items: [] };
    
    user.address.items.push({
      name,
      phone,
      houseNumber,
      pincode,
      address,
      city,
      state,
      landmark: landmark || '',
      alternatePhone: alternatePhone || null,
    });

    await user.save();

    return NextResponse.json({ success: true, addresses: user.address.items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { addressId } = await request.json();
    if (!addressId) return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.address && user.address.items) {
      user.address.items = user.address.items.filter((item: any) => item._id.toString() !== addressId);
      await user.save();
    }

    return NextResponse.json({ success: true, addresses: user.address?.items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
