'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface ProductDetailsClientProps {
  product: {
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
  };
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        // Dispatch event to sync navbar
        window.dispatchEvent(new Event('popstate'));
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error(err);
    }
  };

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass border border-zinc-800 bg-zinc-900/10">
            {product.discount && product.discount !== '0%' && (
              <span className="absolute top-4 left-4 z-10 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                {product.discount} OFF
              </span>
            )}
            <img
              src={images[activeImage]}
              alt={product.productName}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square w-20 rounded-xl overflow-hidden glass border transition-all ${
                    activeImage === idx ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-violet-500 uppercase">
              {product.category?.categoryName || 'General'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wide">
              {product.productName}
            </h1>
            <div className="flex items-center gap-4 text-sm mt-2">
              <div className="flex items-center text-violet-400 gap-1 font-bold">
                <Star className="h-4 w-4 fill-violet-400" />
                <span>4.8</span>
                <span className="text-zinc-500 font-normal">(128 customer reviews)</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                product.stock > 0 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60' : 'bg-red-950/40 text-red-400 border border-red-900/60'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <p className="text-base text-zinc-300 leading-relaxed">
            {product.description}
          </p>

          <div className="border-t border-zinc-900 pt-6">
            <span className="text-3xl font-black text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Quantity Selector & Action Button */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center border-t border-zinc-900 pt-6">
              <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-950 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-500 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold text-zinc-200 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-zinc-500 hover:text-white font-bold"
                >
                  +
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all shadow-lg cursor-pointer ${
                  added
                    ? 'bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Product Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-900 pt-6">
            <div className="flex items-center gap-2.5 text-zinc-400">
              <Truck className="h-5 w-5 text-violet-400 shrink-0" />
              <span className="text-xs font-semibold">Free Express Shipping</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-400">
              <ShieldCheck className="h-5 w-5 text-violet-400 shrink-0" />
              <span className="text-xs font-semibold">1 Year Genuine Warranty</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-400">
              <RefreshCw className="h-5 w-5 text-violet-400 shrink-0" />
              <span className="text-xs font-semibold">7 Days Easy Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
