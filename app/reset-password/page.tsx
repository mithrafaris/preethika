'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, KeySquare } from 'lucide-react';

function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      setMessage('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 py-12 relative overflow-hidden bg-zinc-950">
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
            <KeySquare className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">New Password</h2>
          <p className="text-xs text-zinc-500 font-semibold mt-1 text-center">
            ENTER YOUR RESET CODE AND NEW PASSWORD
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-2.5 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-950/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-xs text-green-400 font-medium">
              {message}
            </div>
          )}

          <div className="space-y-1.5">
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
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reset Code (OTP)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <KeyRound className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-500" />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Resetting...' : 'Set New Password'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500 font-semibold uppercase tracking-wider">
          Remember your password?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[80vh] text-zinc-400">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
