import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
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

    const { productName, price, stock, description, images, category } = await request.json();

    if (!productName || !price || typeof stock !== 'number' || !description || !category) {
      return NextResponse.json({ error: 'Missing required product parameters' }, { status: 400 });
    }

    await dbConnect();
    const product = await Product.create({
      productName,
      price,
      stock,
      description,
      images,
      category,
    });

    const populatedProduct = await Product.findById(product._id).populate('category');

    return NextResponse.json({ success: true, product: populatedProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
