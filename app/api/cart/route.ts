import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import { verifyToken } from '@/lib/jwt';

// Helper to authenticate user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return decoded.userId;
}

export async function GET() {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(userId).populate({
      path: 'cart.product_id',
      model: Product,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter out items where product was deleted/unlisted
    const cartItems = (user.cart || [])
      .filter((item: any) => item.product_id && item.product_id.isList)
      .map((item: any) => ({
        productId: item.product_id._id.toString(),
        productName: item.product_id.productName,
        price: item.product_id.price,
        images: item.product_id.images || [],
        stock: item.product_id.stock,
        quantity: item.quantity,
      }));

    return NextResponse.json({ cart: cartItems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity, override } = await request.json();

    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 });
    }

    await dbConnect();

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product || !product.isList) {
      return NextResponse.json({ error: 'Product not found or unavailable' }, { status: 404 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cart = user.cart || [];
    const itemIndex = cart.findIndex((item: any) => item.product_id.toString() === productId);

    if (itemIndex > -1) {
      // Product already in cart
      const newQty = override ? quantity : cart[itemIndex].quantity + quantity;
      
      // Ensure quantity doesn't exceed stock
      if (newQty > product.stock) {
        return NextResponse.json({ error: `Only ${product.stock} items left in stock` }, { status: 400 });
      }

      cart[itemIndex].quantity = newQty;
    } else {
      // Add new product
      if (quantity > product.stock) {
        return NextResponse.json({ error: `Only ${product.stock} items left in stock` }, { status: 400 });
      }
      cart.push({ product_id: productId, quantity });
    }

    user.cart = cart;
    await user.save();

    return NextResponse.json({ success: true, cart: user.cart });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.cart = (user.cart || []).filter((item: any) => item.product_id.toString() !== productId);
    await user.save();

    return NextResponse.json({ success: true, cart: user.cart });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
