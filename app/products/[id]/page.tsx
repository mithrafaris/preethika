import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import ProductDetailsClient from '@/components/ProductDetailsClient';

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  await dbConnect();
  
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return notFound();
  }

  const rawProduct = await Product.findById(id).populate('category').lean();

  if (!rawProduct || !rawProduct.isList) {
    return notFound();
  }

  const product = {
    _id: rawProduct._id.toString(),
    productName: rawProduct.productName,
    price: rawProduct.price,
    stock: rawProduct.stock,
    description: rawProduct.description,
    images: rawProduct.images || [],
    discount: rawProduct.discount || '',
    category: rawProduct.category
      ? {
          categoryName: rawProduct.category.categoryName,
        }
      : undefined,
  };

  return <ProductDetailsClient product={product} />;
}
