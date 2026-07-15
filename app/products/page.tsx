import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import ProductsClient from '@/components/ProductsClient';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  await dbConnect();
  
  const params = await searchParams;
  const categoryName = params.category || '';
  const search = params.search || '';
  const sort = params.sort || '';

  // Get active categories list
  const rawCategories = await Category.find({ isList: true }).select('categoryName').lean();
  const categories = rawCategories.map((c: any) => ({
    _id: c._id.toString(),
    categoryName: c.categoryName,
  }));

  // Build MongoDB query
  const query: any = { isList: true };

  // Category filter
  if (categoryName) {
    const categoryDoc = await Category.findOne({ categoryName: categoryName.toLowerCase() });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
  }

  // Search filter
  if (search) {
    query.productName = { $regex: search, $options: 'i' };
  }

  // Sorting setup
  let sortOption: any = {};
  if (sort === 'price_asc') {
    sortOption = { price: 1 };
  } else if (sort === 'price_desc') {
    sortOption = { price: -1 };
  }

  const rawProducts = await Product.find(query)
    .populate('category')
    .sort(sortOption)
    .lean();

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
          _id: p.category._id.toString(),
          categoryName: p.category.categoryName,
        }
      : undefined,
  }));

  return (
    <ProductsClient
      products={products}
      categories={categories}
      currentCategory={categoryName}
      currentSearch={search}
      currentSort={sort}
    />
  );
}
