'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, ShoppingBag, ShoppingCart, FileSpreadsheet, 
  ShieldAlert, UserCheck, UserMinus, Plus, Trash2, Edit, ChevronRight, LogOut, CheckCircle, Package, Receipt 
} from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  wallet: number;
  isBlock: boolean;
}

interface ProductData {
  _id: string;
  productName: string;
  price: number;
  stock: number;
  images: string[];
  isList: boolean;
  category?: {
    _id: string;
    categoryName: string;
  };
}

interface OrderData {
  _id: string;
  orderId: string;
  userName: string;
  totalAmount: number;
  purchaseDate: string;
  paymentMethod: string;
  status: string;
}

interface CategoryData {
  _id: string;
  categoryName: string;
}

interface AdminDashboardProps {
  initialUsers: UserData[];
  initialProducts: ProductData[];
  initialOrders: OrderData[];
  initialCategories: CategoryData[];
}

export default function AdminDashboard({
  initialUsers,
  initialProducts,
  initialOrders,
  initialCategories,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'reports'>('dashboard');
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  
  // Product Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCat, setProdCat] = useState(initialCategories[0]?._id || '');

  // Toggle user block status
  const handleToggleBlock = async (userId: string, isBlock: boolean) => {
    try {
      const res = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block: !isBlock }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isBlock: !isBlock } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: prodName,
          price: Number(prodPrice),
          stock: Number(prodStock),
          description: prodDesc,
          images: [prodImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
          category: prodCat,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts([data.product, ...products]);
        setShowAddForm(false);
        // Clear
        setProdName('');
        setProdPrice('');
        setProdStock('');
        setProdDesc('');
        setProdImg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  // Calculations for stats
  const totalSales = orders.reduce((acc, curr) => curr.status !== 'cancelled' ? acc + curr.totalAmount : acc, 0);
  const totalOrdersCount = orders.length;
  const activeCustomers = users.filter(u => !u.isBlock).length;
  const inStockCount = products.reduce((acc, curr) => acc + curr.stock, 0);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between p-6 shrink-0 h-full">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide uppercase">Admin Control</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'users' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Customers</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'products' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Catalog Products</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'orders' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <span>Store Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'reports' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
              <span>Sales Reports</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer text-left"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Exit Dashboard</span>
        </button>
      </div>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 bg-zinc-900/10">
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Overview</h1>
                <p className="text-xs text-zinc-500 font-semibold mt-1">REAL-TIME BUSINESS TELEMETRY</p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                    <span>Total Sales</span>
                    <Receipt className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="text-2xl font-black text-white">₹{totalSales.toLocaleString('en-IN')}</div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                    <span>Orders Placed</span>
                    <ShoppingCart className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-white">{totalOrdersCount}</div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                    <span>Customers</span>
                    <Users className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-white">{activeCustomers}</div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/10 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                    <span>Units in Stock</span>
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-white">{inStockCount}</div>
                </div>
              </div>

              {/* Custom SVG Charts panel */}
              <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850">
                  Sales Analysis (Visual Representation)
                </h3>
                <div className="h-64 flex items-end justify-between gap-4 pt-10 px-4">
                  {/* Generate 5 styled bars representing categories or orders */}
                  {[65, 80, 45, 95, 75].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                        className="w-full rounded-t-xl bg-gradient-to-t from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/15"
                      />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Week {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: CUSTOMERS */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Customers</h1>
                <p className="text-xs text-zinc-500 font-semibold mt-1">MANAGE SYSTEM USERS AND ACCESS STATES</p>
              </div>

              <div className="glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Wallet Balance</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-b border-zinc-900 text-xs hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-white uppercase">{user.name}</td>
                        <td className="px-6 py-4 text-zinc-400 font-mono">{user.email}</td>
                        <td className="px-6 py-4 text-zinc-300">₹{(user.wallet || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            user.isBlock ? 'bg-red-950/40 text-red-400 border border-red-900/60' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                          }`}>
                            {user.isBlock ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleBlock(user._id, user.isBlock)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              user.isBlock 
                                ? 'bg-emerald-950/40 hover:bg-emerald-900/20 text-emerald-400 border border-emerald-900/60' 
                                : 'bg-red-950/40 hover:bg-red-900/20 text-red-400 border border-red-900/60'
                            }`}
                          >
                            {user.isBlock ? (
                              <>
                                <UserCheck className="h-3 w-3" />
                                <span>Unsuspend</span>
                              </>
                            ) : (
                              <>
                                <UserMinus className="h-3 w-3" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Products</h1>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">MANAGE STORE ITEM DEFINITIONS AND STOCKS</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Add Product Modal Overlay */}
              <AnimatePresence>
                {showAddForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.form
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onSubmit={handleAddProduct}
                      className="glass-card max-w-md w-full p-6 rounded-3xl border border-zinc-800 space-y-4"
                    >
                      <div className="pb-2 border-b border-zinc-850 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Product Item</h4>
                        <button type="button" onClick={() => setShowAddForm(false)} className="text-zinc-500 hover:text-white">✕</button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Product Name</label>
                            <input
                              type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)}
                              placeholder="e.g. AeroBuds Pro"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Category</label>
                            <select
                              value={prodCat} onChange={(e) => setProdCat(e.target.value)}
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            >
                              {initialCategories.map(c => (
                                <option key={c._id} value={c._id}>{c.categoryName}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Price (INR)</label>
                            <input
                              type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)}
                              placeholder="₹8999"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Stock Count</label>
                            <input
                              type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)}
                              placeholder="45"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Image URL</label>
                          <input
                            type="text" value={prodImg} onChange={(e) => setProdImg(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Description</label>
                          <textarea
                            required rows={3} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)}
                            placeholder="Provide deep descriptions..."
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-end pt-2">
                        <button
                          type="button" onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
                        >
                          Add Product
                        </button>
                      </div>
                    </motion.form>
                  </div>
                )}
              </AnimatePresence>

              {/* Products Table */}
              <div className="glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} className="border-b border-zinc-900 text-xs hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                            alt="" className="h-8 w-8 object-cover rounded-lg border border-zinc-850"
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-white uppercase">{p.productName}</td>
                        <td className="px-6 py-4 text-zinc-400 uppercase tracking-wide text-[10px]">{p.category?.categoryName || 'General'}</td>
                        <td className="px-6 py-4 text-zinc-300 font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`font-mono ${p.stock <= 5 ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>{p.stock} units</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            p.stock > 0 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60' : 'bg-red-950/40 text-red-400 border border-red-900/60'
                          }`}>
                            {p.stock > 0 ? 'In Stock' : 'Out of stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 4: STORE ORDERS */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Store Orders</h1>
                <p className="text-xs text-zinc-500 font-semibold mt-1">MANAGE CUSTOMER PURCHASES AND LOGISTICS</p>
              </div>

              <div className="glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className="border-b border-zinc-900 text-xs hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-violet-400">#{order.orderId}</td>
                        <td className="px-6 py-4 font-bold text-white uppercase">{order.userName}</td>
                        <td className="px-6 py-4 text-zinc-400">
                          {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-6 py-4 text-zinc-300 font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-zinc-500 font-bold uppercase text-[9px]">{order.paymentMethod}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60' :
                            order.status === 'cancelled' ? 'bg-red-950/40 text-red-400 border border-red-900/60' :
                            'bg-violet-950/40 text-violet-400 border border-violet-900/60'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-300 focus:outline-none"
                            >
                              <option value="placed">Placed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SALES REPORTS */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Sales Reports</h1>
                <p className="text-xs text-zinc-500 font-semibold mt-1">GENERATE AND EXPORT ANALYTICS DOCUMENTS</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PDF Export card */}
                <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 flex flex-col justify-between items-start space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">PDF FORMAT</span>
                    <h3 className="text-lg font-bold text-white uppercase">Sales Statement PDF</h3>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Export a polished, print-ready document containing order lists, date indicators, and cumulative volume.
                    </p>
                  </div>
                  <a
                    href="/api/admin/reports/pdf"
                    target="_blank"
                    className="w-full inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-xs font-semibold text-white transition-colors"
                  >
                    Download PDF Invoice Statement
                  </a>
                </div>

                {/* Excel Export card */}
                <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 flex flex-col justify-between items-start space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">XLSX SHEET</span>
                    <h3 className="text-lg font-bold text-white uppercase">Sales Ledger Excel</h3>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Export structured grid columns ready for audit, containing details such as pricing, items, and tax metrics.
                    </p>
                  </div>
                  <a
                    href="/api/admin/reports/xlsx"
                    className="w-full inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-850 py-3 text-xs font-semibold text-white transition-colors"
                  >
                    Download Excel Spreadsheet
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
