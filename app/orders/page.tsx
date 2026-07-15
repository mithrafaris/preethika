'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, X, ArrowLeft, Truck, Check, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  productId: string;
  productName: string;
  images: string[];
  quantity: number;
  status: string;
}

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  purchaseDate: string;
  deliveryDate: string | null;
  address: string;
  orderCancleRequest: boolean;
  orderReturnRequest: boolean;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingId) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: cancellingId, reason: cancelReason }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === cancellingId
              ? {
                  ...order,
                  orderCancleRequest: true,
                  items: order.items.map((item) => ({ ...item, status: 'cancelled' })),
                }
              : order
          )
        );
        setCancellingId(null);
        setCancelReason('');
        // Refresh session wallet balance
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/60';
      case 'cancelled':
        return 'text-red-400 bg-red-950/40 border border-red-900/60';
      case 'shipped':
        return 'text-indigo-400 bg-indigo-950/40 border border-indigo-900/60';
      default:
        return 'text-violet-400 bg-violet-950/40 border border-violet-900/60';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold text-zinc-400">Loading order timeline...</div>
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
          My Orders
        </h1>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6"
            >
              {/* Order Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-850 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">ORDER ID</span>
                  <span className="text-sm font-bold text-white uppercase">#{order.orderId}</span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">PURCHASE DATE</span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">TOTAL AMOUNT</span>
                    <span className="text-xs font-black text-violet-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img
                      src={item.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                      alt={item.productName}
                      className="h-12 w-12 object-cover rounded-xl border border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white uppercase tracking-wide truncate block">
                        {item.productName}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase">Qty: {item.quantity}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-zinc-850 gap-4">
                <div className="text-[11px] text-zinc-400 max-w-sm">
                  <span className="font-bold text-zinc-500 uppercase block tracking-wider mb-0.5">SHIPPING ADDRESS</span>
                  <span className="line-clamp-1">{order.address}</span>
                </div>

                {!order.orderCancleRequest && (
                  <button
                    onClick={() => setCancellingId(order._id)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-950/40 hover:bg-red-950/15 rounded-xl px-4 py-2 cursor-pointer transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900/60 border border-zinc-850">
            <ShoppingBag className="h-7 w-7 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white uppercase font-sans">No orders placed</h2>
            <p className="text-xs text-zinc-500 font-medium max-w-xs">
              You haven't placed any orders yet. Head to the shop catalog to fill your first package!
            </p>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="rounded-full bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Cancel Reason Modal */}
      <AnimatePresence>
        {cancellingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onSubmit={handleCancelOrderSubmit}
              className="glass-card max-w-md w-full p-6 rounded-3xl border border-zinc-800 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cancel Order</h4>
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reason for cancellation</label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed my mind, found better pricing elsewhere, incorrect address details."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
