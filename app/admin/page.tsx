import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Category from '@/lib/models/Category';
import AdminDashboard from '@/components/AdminDashboard';

export const revalidate = 0;

export default async function AdminPage() {
  await dbConnect();

  // Retrieve raw data
  const rawUsers = await User.find({ isadmin: false }).select('name email wallet isBlock').lean();
  const rawProducts = await Product.find({}).populate('category').lean();
  const rawOrders = await Order.find({}).populate({ path: 'user', model: User, select: 'name' }).lean();
  const rawCategories = await Category.find({}).select('categoryName').lean();

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
  }));

  return (
    <AdminDashboard
      initialUsers={users}
      initialProducts={products}
      initialOrders={orders}
      initialCategories={categories}
    />
  );
}
