'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingCart, Check, Heart, Star, Sparkles } from 'lucide-react';

interface CategoryType {
  _id: string;
  categoryName: string;
  image: string;
  description: string;
}

interface ProductType {
  _id: string;
  productName: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  discount?: string;
  category?: {
    categoryName: string;
  };
}

interface BannerType {
  _id: string;
  bannerName: string;
  image: string;
  title: string;
  subtitle: string;
}

interface HomeClientProps {
  initialBanners: BannerType[];
  initialCategories: CategoryType[];
  initialProducts: ProductType[];
}

export default function HomeClient({
  initialBanners,
  initialCategories,
  initialProducts,
}: HomeClientProps) {
  const [banners] = useState<BannerType[]>(initialBanners);
  const [categories] = useState<CategoryType[]>(initialCategories);
  const [products, setProducts] = useState<ProductType[]>(initialProducts);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  // Autoplay banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation to details page
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setAddedToCart((prev) => ({ ...prev, [productId]: true }));
        setTimeout(() => {
          setAddedToCart((prev) => ({ ...prev, [productId]: false }));
        }, 2000);
        // Refresh Navbar layout state
        window.dispatchEvent(new Event('popstate'));
      } else {
        // Redirect to login if unauthorized
        if (res.status === 401) {
          window.location.href = '/login';
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full pb-20 overflow-x-hidden">
      {/* Hero Banner Slider */}
      <div className="relative h-[65vh] w-full bg-zinc-950 overflow-hidden">
        {banners.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background image with glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent z-10" />
              <img
                src={banners[currentBanner].image}
                alt={banners[currentBanner].title}
                className="absolute inset-0 object-cover w-full h-full opacity-60 scale-105"
              />

              {/* Banner content */}
              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-950/20 text-xs font-semibold text-violet-300">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                    <span>Special Launch Offer</span>
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight uppercase">
                    {banners[currentBanner].title}
                  </h1>
                  <p className="text-base sm:text-lg text-zinc-300 font-medium">
                    {banners[currentBanner].subtitle}
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-violet-500/25 cursor-pointer"
                    >
                      <span>Explore Shop</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
            No active banners found. Run seed script.
          </div>
        )}

        {/* Carousel indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentBanner === index ? 'w-8 bg-violet-500' : 'w-2.5 bg-zinc-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-xs font-bold tracking-wider text-violet-500 uppercase">Curated Catalog</h2>
            <h3 className="text-3xl font-extrabold text-white mt-1">Shop by Category</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/products?category=${cat.categoryName}`}
                className="group relative block aspect-[16/10] rounded-2xl overflow-hidden glass border border-zinc-800"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
                <img
                  src={cat.image}
                  alt={cat.categoryName}
                  className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 opacity-70"
                />
                <div className="absolute inset-x-6 bottom-6 z-20 flex flex-col justify-end">
                  <h4 className="text-lg font-bold text-white uppercase tracking-wide group-hover:text-violet-400 transition-colors">
                    {cat.categoryName}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[90%] font-medium">
                    {cat.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-xs font-bold tracking-wider text-violet-500 uppercase">Handpicked Items</h2>
            <h3 className="text-3xl font-extrabold text-white mt-1">Featured Products</h3>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>See All Products</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="glass-card group relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/10 flex flex-col h-full"
            >
              <Link href={`/products/${product._id}`} className="block flex-1">
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                  {product.discount && product.discount !== '0%' && (
                    <span className="absolute top-3.5 left-3.5 z-10 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      {product.discount} OFF
                    </span>
                  )}
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                    alt={product.productName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Info Section */}
                <div className="p-5 flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    <span>{product.category?.categoryName || 'General'}</span>
                    <div className="flex items-center text-violet-400 gap-0.5">
                      <Star className="h-3 w-3 fill-violet-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white truncate uppercase tracking-wide group-hover:text-violet-400 transition-colors">
                    {product.productName}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
                    {product.description}
                  </p>
                </div>
              </Link>

              {/* Pricing & Add to Cart */}
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-zinc-800/60 mt-auto">
                <span className="text-lg font-black text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleAddToCart(product._id, e)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shadow-md cursor-pointer ${
                    addedToCart[product._id]
                      ? 'bg-emerald-600 text-white'
                      : 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-violet-500/20'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart[product._id] ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-4.5 w-4.5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cart"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <ShoppingCart className="h-4.5 w-4.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
