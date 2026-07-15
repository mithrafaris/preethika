'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  description: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.user.wallet || 0);

        // Fetch user orders to compile wallet transactions
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const txs: Transaction[] = [];

          // Add a default credit for account setup
          txs.push({
            id: 'TX-INIT',
            type: 'credit',
            amount: 100,
            date: new Date().toLocaleDateString('en-IN'),
            description: 'Welcome Account Credit',
          });

          // Extract wallet orders
          ordersData.orders.forEach((order: any) => {
            if (order.paymentMethod === 'wallet') {
              txs.push({
                id: `TX-${order.orderId}`,
                type: 'debit',
                amount: order.totalAmount,
                date: new Date(order.purchaseDate).toLocaleDateString('en-IN'),
                description: `Payment for Order #${order.orderId}`,
              });

              // If order was cancelled, represent the refund credit
              const isCancelled = order.items.every((item: any) => item.status === 'cancelled');
              if (isCancelled) {
                txs.push({
                  id: `TX-${order.orderId}-RFND`,
                  type: 'credit',
                  amount: order.totalAmount,
                  date: new Date(order.purchaseDate).toLocaleDateString('en-IN'),
                  description: `Refund for Order #${order.orderId}`,
                });
              }
            }
          });

          setTransactions(txs.reverse());
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(addAmount);
    if (isNaN(amount) || amount <= 0) return;

    setAdding(true);
    try {
      const res = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        setBalance((prev) => prev + amount);
        setAddAmount('');
        // Add fund transaction visually
        setTransactions([
          {
            id: 'TX-' + Math.floor(Math.random() * 100000),
            type: 'credit',
            amount,
            date: new Date().toLocaleDateString('en-IN'),
            description: 'Added funds to wallet',
          },
          ...transactions,
        ]);
        // Trigger Navbar layout state update
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold text-zinc-400">Loading wallet statement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center w-full">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/')} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          My Wallet
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Wallet Balance Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <div className="flex items-center gap-3 text-violet-400">
              <Wallet className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
            </div>
            <div className="text-3xl font-black text-white">₹{balance.toLocaleString('en-IN')}</div>

            {/* Quick add funds */}
            <form onSubmit={handleAddFunds} className="space-y-3 pt-4 border-t border-zinc-950">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Add Funds</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="Amount (INR)"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Ledger Transactions */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850">
              Transaction Ledger
            </h3>

            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-zinc-900/60 last:border-0 last:pb-0">
                  <div className="flex gap-3 items-center">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60' : 'bg-red-950/40 text-red-400 border border-red-900/60'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{tx.description}</span>
                      <span className="text-[10px] text-zinc-500 font-semibold">{tx.date} • {tx.id}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
