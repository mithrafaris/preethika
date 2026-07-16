'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Wallet, LogOut, ShieldAlert, Search, Heart, Menu, X } from 'lucide-react';
import Image from 'next/image';

interface UserSession {
  name: string;
  email: string;
  isadmin: boolean;
  wallet: number;
  cartCount: number;
}

export default function Navbar() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Fetch session details on mount or pathname change
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Do not show the main layout navbar on admin routes to prevent styling conflicts
  const isAdminRoute = pathname.startsWith('/admin');
  if (isAdminRoute) return null;

  return (
    <nav className="glass sticky top-0 z-50 w-full transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="relative h-10 w-10 flex items-center justify-center rounded-xl overflow-hidden shadow-md shadow-violet-900/20"
            >
              <Image src="/logo.png" alt="Samriddhi Logo" fill className="object-cover" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-gradient">Samriddhi</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-zinc-900/60 border border-zinc-800 px-4 py-1.5 pl-10 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-300"
            />
            <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-zinc-500" />
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Shop
            </Link>

            {session ? (
              <>
                {/* Wallet Balance */}
                <Link href="/wallet" className="flex items-center space-x-1 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                  <span>₹{session.wallet.toFixed(2)}</span>
                </Link>

                {/* Cart Icon */}
                <Link href="/cart" className="relative p-2 text-zinc-300 hover:text-white transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {session.cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white"
                    >
                      {session.cartCount}
                    </motion.span>
                  )}
                </Link>

                {/* Wishlist Icon */}
                <Link href="/wishlist" className="p-2 text-zinc-300 hover:text-white transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Profile Icon */}
                <Link href="/profile" className="p-2 text-zinc-300 hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </Link>

                {/* Admin dashboard if admin */}
                {session.isadmin && (
                  <Link href="/admin" className="flex items-center space-x-1 text-xs font-semibold text-violet-400 bg-violet-950/40 border border-violet-800/60 rounded-full px-3 py-1 hover:bg-violet-900/40 transition-colors">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu button */}
          <div className="flex md:hidden items-center gap-2">
            {session && (
              <Link href="/cart" className="relative p-2 text-zinc-300">
                <ShoppingCart className="h-5 w-5" />
                {session.cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                    {session.cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-300 hover:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-4"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-zinc-900 border border-zinc-850 px-4 py-1.5 pl-10 text-sm text-zinc-200"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            </form>

            <div className="flex flex-col space-y-3">
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-300 hover:text-white"
              >
                Shop Catalog
              </Link>

              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-zinc-300 hover:text-white"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-zinc-300 hover:text-white"
                  >
                    My Wishlist
                  </Link>
                  <Link
                    href="/wallet"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 text-sm font-medium text-zinc-300 hover:text-white"
                  >
                    <Wallet className="h-4 w-4 text-emerald-500" />
                    <span>Wallet: ₹{session.wallet.toFixed(2)}</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-zinc-300 hover:text-white"
                  >
                    My Orders
                  </Link>
                  {session.isadmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-violet-400"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 text-sm font-medium text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-violet-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
