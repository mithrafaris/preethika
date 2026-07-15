'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 py-12 relative overflow-hidden bg-zinc-950">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 mb-3">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Create Account</h2>
          <p className="text-xs text-zinc-500 font-semibold mt-1">START YOUR PREETHIKA SHOPPING JOURNEY</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-2.5 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500 font-semibold uppercase tracking-wider">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
