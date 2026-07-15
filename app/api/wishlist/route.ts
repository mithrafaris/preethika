import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import { verifyToken } from '@/lib/jwt';

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/wishlist - Get the user's wishlist
export async function GET() {
  try {
    const decoded = await getUserFromToken();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).populate('wishlist').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ wishlist: user.wishlist || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/wishlist - Toggle product in wishlist
export async function POST(request: Request) {
  try {
    const decoded = await getUserFromToken();
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const wishlist = user.wishlist || [];
    const index = wishlist.indexOf(productId);

    let added = false;
    if (index === -1) {
      // Add to wishlist
      wishlist.push(productId);
      added = true;
    } else {
      // Remove from wishlist
      wishlist.splice(index, 1);
    }

    user.wishlist = wishlist;
    await user.save();

    return NextResponse.json({ success: true, added, wishlist: user.wishlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
