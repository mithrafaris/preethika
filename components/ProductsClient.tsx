'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart, Check, Star } from 'lucide-react';

interface CategoryType {
  _id: string;
  categoryName: string;
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
    _id: string;
    categoryName: string;
  };
}

interface ProductsClientProps {
  products: ProductType[];
  categories: CategoryType[];
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
}

export default function ProductsClient({
  products: initialProducts,
  categories,
  currentCategory,
  currentSearch,
  currentSort,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(currentSearch);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', search);
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
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
        // Sync Navbar cart count
        window.dispatchEvent(new Event('popstate'));
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Search & Sort Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl mb-8 glass">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-4 py-2 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        </form>

        <div className="flex w-full md:w-auto items-center gap-4 shrink-0 justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-bold uppercase">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-2xl glass space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-850">
              <SlidersHorizontal className="h-4 w-4 text-violet-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Filter Catalog</h4>
            </div>

            {/* Categories filter */}
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Categories</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => updateFilters('category', '')}
                  className={`text-left text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                    !currentCategory
                      ? 'bg-violet-950/30 text-violet-300 border border-violet-850'
                      : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateFilters('category', cat.categoryName)}
                    className={`text-left text-sm px-3 py-2 rounded-xl transition-all font-medium uppercase tracking-wide ${
                      currentCategory === cat.categoryName
                        ? 'bg-violet-950/30 text-violet-300 border border-violet-850'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {cat.categoryName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {initialProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {initialProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card group relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/10 flex flex-col h-full"
                  >
                    <Link href={`/products/${product._id}`} className="block flex-1">
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
                            : 'bg-violet-600 text-white hover:bg-violet-500'
                        }`}
                      >
                        {addedToCart[product._id] ? (
                          <Check className="h-4.5 w-4.5" />
                        ) : (
                          <ShoppingCart className="h-4.5 w-4.5" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="text-zinc-600 text-lg">No products found matching your search filters.</div>
                <button
                  onClick={() => {
                    router.push('/products');
                    setSearch('');
                  }}
                  className="rounded-full bg-zinc-800 hover:bg-zinc-700 px-6 py-2 text-sm font-semibold text-white transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
