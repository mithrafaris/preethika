'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  images: string[];
  stock: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart || []);
      } else {
        throw new Error('Failed to load cart items');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId: string, newQty: number, maxStock: number) => {
    if (newQty < 1 || newQty > maxStock) return;

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQty, override: true }),
      });

      if (res.ok) {
        setCart((prev) =>
          prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item))
        );
        // Sync Navbar cart count
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
        // Sync Navbar cart count
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold text-zinc-400">Loading your shopping cart...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center w-full">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-6 w-6 text-violet-500" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Shopping Cart
        </h1>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items Column */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/10"
                >
                  <img
                    src={item.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                    alt={item.productName}
                    className="h-20 w-20 object-cover rounded-xl bg-zinc-950 border border-zinc-850 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide truncate">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-3.5">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.stock)}
                        disabled={item.quantity <= 1}
                        className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-zinc-200 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock}
                        className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/20 cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                    <span className="text-sm sm:text-base font-extrabold text-white">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout/Summary Column */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850">
                Order Summary
              </h3>

              <div className="space-y-3.5">
                <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                  <span>Shipping</span>
                  <span className="text-emerald-500">FREE</span>
                </div>
                <div className="border-t border-zinc-900 pt-4 flex justify-between text-base font-extrabold text-white">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900/60 border border-zinc-850">
            <ShoppingBag className="h-7 w-7 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white uppercase">Your cart is empty</h2>
            <p className="text-xs text-zinc-500 font-medium max-w-xs">
              Looks like you haven't added anything to your cart yet. Explore our latest items!
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-full bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
