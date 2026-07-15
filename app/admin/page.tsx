import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Category from '@/lib/models/Category';
import Coupon from '@/lib/models/Coupon';
import Banner from '@/lib/models/Banner';
import AdminDashboard from '@/components/AdminDashboard';

export const revalidate = 0;

export default async function AdminPage() {
  await dbConnect();

  // Retrieve raw data
  const rawUsers = await User.find({ isadmin: false }).select('name email wallet isBlock').lean();
  const rawProducts = await Product.find({}).populate('category').lean();
  const rawOrders = await Order.find({}).populate({ path: 'user', model: User, select: 'name' }).lean();
  const rawCategories = await Category.find({}).select('categoryName description image').lean();
  const rawCoupons = await Coupon.find({}).lean();
  const rawBanners = await Banner.find({}).lean();

  // Mappers
  const users = rawUsers.map((u: any) => ({
    ...u,
    _id: u._id.toString(),
    wallet: u.wallet || 0,
  }));

  const products = rawProducts.map((p: any) => ({
    _id: p._id.toString(),
    productName: p.productName,
    price: p.price,
    stock: p.stock,
    images: p.images || [],
    isList: p.isList ?? true,
    category: p.category
      ? {
          _id: p.category._id.toString(),
          categoryName: p.category.categoryName,
        }
      : undefined,
  }));

  const orders = rawOrders.map((o: any) => ({
    _id: o._id.toString(),
    orderId: o.orderId,
    userName: o.user?.name || 'Unregistered User',
    totalAmount: o.totalAmount,
    purchaseDate: o.purchaseDate,
    paymentMethod: o.paymentMethod || 'cod',
    status: o.orderItems[0]?.orderStatus || 'placed',
  }));

  const categories = rawCategories.map((c: any) => ({
    _id: c._id.toString(),
    categoryName: c.categoryName,
    description: c.description,
    image: c.image,
  }));

  const coupons = rawCoupons.map((c: any) => ({
    _id: c._id.toString(),
    couponName: c.couponName,
    couponValue: c.couponValue,
    expiryDate: c.expiryDate,
    maxValue: c.maxValue,
    minValue: c.minValue,
    isList: c.isList ?? true,
  }));

  const banners = rawBanners.map((b: any) => ({
    _id: b._id.toString(),
    bannerName: b.bannerName,
    image: b.image,
    title: b.title,
    subtitle: b.subtitle,
    isList: b.isList ?? true,
  }));

  return (
    <AdminDashboard
      initialUsers={users}
      initialProducts={products}
      initialOrders={orders}
      initialCategories={categories}
      initialCoupons={coupons}
      initialBanners={banners}
    />
  );
}
