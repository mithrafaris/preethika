import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import WishlistClient from '@/components/WishlistClient';

export const revalidate = 0;

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  await dbConnect();
  
  // Populate wishlist
  const user = await User.findById(decoded.userId)
    .populate({
      path: 'wishlist',
      model: Product,
      populate: {
        path: 'category',
        model: Category,
      }
    })
    .lean();

  if (!user) {
    redirect('/login');
  }

  const wishlistProducts = (user.wishlist || []).map((p: any) => ({
    _id: p._id.toString(),
    productName: p.productName,
    price: p.price,
    stock: p.stock,
    description: p.description,
    images: p.images || [],
    discount: p.discount || '',
    category: p.category
      ? {
          _id: p.category._id.toString(),
          categoryName: p.category.categoryName,
        }
      : undefined,
    rating: p.rating || 0,
  }));

  return <WishlistClient products={wishlistProducts} />;
}
