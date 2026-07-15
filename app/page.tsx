import dbConnect from '@/lib/db';
import Banner from '@/lib/models/Banner';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import HomeClient from '@/components/HomeClient';

// Ensure this page is dynamically rendered to reflect live DB changes
export const revalidate = 0;

export default async function HomePage() {
  await dbConnect();

  const rawBanners = await Banner.find({ isList: true }).lean();
  const rawCategories = await Category.find({ isList: true }).lean();
  const rawProducts = await Product.find({ isList: true })
    .populate('category')
    .limit(8)
    .lean();

  // Map mongoose models to plain objects for client component serialization
  const banners = rawBanners.map((b: any) => ({
    _id: b._id.toString(),
    bannerName: b.bannerName,
    image: b.image || '',
    title: b.title,
    subtitle: b.subtitle,
  }));

  const categories = rawCategories.map((c: any) => ({
    _id: c._id.toString(),
    categoryName: c.categoryName,
    image: c.image,
    description: c.description,
  }));

  const products = rawProducts.map((p: any) => ({
    _id: p._id.toString(),
    productName: p.productName,
    price: p.price,
    stock: p.stock,
    description: p.description,
    images: p.images || [],
    discount: p.discount || '',
    category: p.category
      ? {
          categoryName: p.category.categoryName,
        }
      : undefined,
  }));

  return (
    <HomeClient
      initialBanners={banners}
      initialCategories={categories}
      initialProducts={products}
    />
  );
}
