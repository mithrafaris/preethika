'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  LayoutDashboard, Users, ShoppingBag, ShoppingCart, FileSpreadsheet, 
  ShieldAlert, UserCheck, UserMinus, Plus, Trash2, Edit, ChevronRight, LogOut, CheckCircle, Package, Receipt, Tag, Image as ImageIcon, FolderTree, MessageSquare, Star
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
  description?: string;
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
  items?: any[];
}

interface CategoryData {
  _id: string;
  categoryName: string;
  description?: string;
  image?: string;
}

interface CouponData {
  _id: string;
  couponName: string;
  couponValue: number;
  expiryDate: string;
  maxValue: number;
  minValue: number;
  isList: boolean;
}

interface BannerData {
  _id: string;
  bannerName: string;
  image: string;
  title: string;
  subtitle: string;
  isList: boolean;
}

interface ReviewData {
  _id: string;
  productId: string;
  productName: string;
  userName: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface AdminDashboardProps {
  initialUsers: UserData[];
  initialProducts: ProductData[];
  initialOrders: OrderData[];
  initialCategories: CategoryData[];
  initialCoupons: CouponData[];
  initialBanners: BannerData[];
  initialReviews?: ReviewData[];
}

export default function AdminDashboard({
  initialUsers,
  initialProducts,
  initialOrders,
  initialCategories,
  initialCoupons = [],
  initialBanners = [],
  initialReviews = [],
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'reports' | 'categories' | 'coupons' | 'banners' | 'reviews'>('dashboard');
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [coupons, setCoupons] = useState<CouponData[]>(initialCoupons);
  const [banners, setBanners] = useState<BannerData[]>(initialBanners);
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // --- Chart Data Processing ---
  const chartData = useMemo(() => {
    // Process last 7 days of revenue
    const last7Days: { date: string, revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0 });
    }
    
    const categorySales: Record<string, number> = {};

    orders.forEach(order => {
      // Line chart data
      const orderDate = new Date(order.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayData = last7Days.find(d => d.date === orderDate);
      if (dayData && order.status !== 'cancelled') {
        dayData.revenue += order.totalAmount;
      }

      // Pie chart data
      if (order.status !== 'cancelled' && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const cat = item.productId?.category?.categoryName || 'Uncategorized';
          categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
        });
      }
    });

    const pieData = Object.keys(categorySales).map(key => ({
      name: key,
      value: categorySales[key]
    }));

    return { lineData: last7Days, pieData };
  }, [orders]);

  const COLORS = ['#7c3aed', '#db2777', '#0ea5e9', '#10b981', '#f59e0b'];
  const [editReviewData, setEditReviewData] = useState<ReviewData | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReviewData) return;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editReviewData.productId,
          reviewId: editReviewData._id,
          rating: reviewRating,
          comment: reviewComment
        }),
      });

      if (res.ok) {
        setReviews(reviews.map(r => r._id === editReviewData._id ? { ...r, rating: reviewRating, comment: reviewComment } : r));
        setShowReviewForm(false);
        setEditReviewData(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?productId=${productId}&reviewId=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== reviewId));
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  // Product Add Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCat, setProdCat] = useState(initialCategories[0]?._id || '');
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Category Add/Edit Form State
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editCategoryId ? 'PUT' : 'POST';
      const bodyData = { 
        categoryName: catName, 
        description: catDesc, 
        image: catImg, 
        isList: true 
      };
      
      const body = editCategoryId 
        ? JSON.stringify({ _id: editCategoryId, ...bodyData })
        : JSON.stringify(bodyData);
        
      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (editCategoryId) {
          setCategories(categories.map(c => c._id === editCategoryId ? data : c));
        } else {
          setCategories([data, ...categories]);
        }
        setShowCategoryForm(false);
        setCatName('');
        setCatDesc('');
        setCatImg('');
        setEditCategoryId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coupon Add/Edit Form State
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<string | null>(null);
  const [couponName, setCouponName] = useState('');
  const [couponValue, setCouponValue] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponMin, setCouponMin] = useState('');
  const [couponMax, setCouponMax] = useState('');

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editCouponId ? 'PUT' : 'POST';
      const bodyData = {
        couponName,
        couponValue: Number(couponValue),
        expiryDate: couponExpiry,
        minValue: Number(couponMin),
        maxValue: Number(couponMax),
        isList: true,
      };
      
      const body = editCouponId 
        ? JSON.stringify({ _id: editCouponId, ...bodyData })
        : JSON.stringify(bodyData);
        
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (editCouponId) {
          setCoupons(coupons.map(c => c._id === editCouponId ? data : c));
        } else {
          setCoupons([data, ...coupons]);
        }
        setShowCouponForm(false);
        setEditCouponId(null);
        setCouponName('');
        setCouponValue('');
        setCouponExpiry('');
        setCouponMin('');
        setCouponMax('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Banner Add/Edit Form State
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  const [bannerName, setBannerName] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editBannerId ? 'PUT' : 'POST';
      const bodyData = {
        bannerName,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        image: bannerImage,
        isList: true,
      };
      
      const body = editBannerId 
        ? JSON.stringify({ _id: editBannerId, ...bodyData })
        : JSON.stringify(bodyData);
        
      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (editBannerId) {
          setBanners(banners.map(b => b._id === editBannerId ? data : b));
        } else {
          setBanners([data, ...banners]);
        }
        setShowBannerForm(false);
        setEditBannerId(null);
        setBannerName('');
        setBannerTitle('');
        setBannerSubtitle('');
        setBannerImage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  // Add/Edit Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editProductId ? 'PUT' : 'POST';
      const bodyData = {
        productName: prodName,
        price: Number(prodPrice),
        stock: Number(prodStock),
        description: prodDesc,
        images: [prodImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
        category: prodCat,
      };
      const body = editProductId ? JSON.stringify({ _id: editProductId, ...bodyData }) : JSON.stringify(bodyData);

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (editProductId) {
          setProducts(products.map(p => p._id === editProductId ? data.product : p));
        } else {
          setProducts([data.product, ...products]);
        }
        setShowAddForm(false);
        setEditProductId(null);
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

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
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

  // Dynamic Sales Chart Calculation (simulating 5 recent periods based on actual orders)
  const calculateDynamicChart = () => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    if (validOrders.length === 0) return [10, 10, 10, 10, 10]; // Fallback if no valid orders
    
    // Group orders into 5 arbitrary segments to show a dynamic chart based on order amounts
    const segments = [0, 0, 0, 0, 0];
    validOrders.forEach((o, i) => {
      const segmentIndex = i % 5;
      segments[segmentIndex] += o.totalAmount;
    });
    
    const maxSegment = Math.max(...segments) || 1;
    // Calculate heights relative to the max segment, minimum 10%
    return segments.map(val => Math.max(10, Math.round((val / maxSegment) * 100)));
  };
  
  const chartHeights = calculateDynamicChart();

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
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'categories' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FolderTree className="h-4.5 w-4.5" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'coupons' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tag className="h-4.5 w-4.5" />
              <span>Coupons</span>
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'banners' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="h-4.5 w-4.5" />
              <span>Banners</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all text-left cursor-pointer ${
                activeTab === 'reviews' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              <span>Reviews</span>
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
                  {/* Generate 5 styled bars dynamically based on actual order data */}
                  {chartHeights.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                        className="w-full rounded-t-xl bg-gradient-to-t from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/15"
                      />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Part {idx + 1}</span>
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
                  onClick={() => {
                    setEditProductId(null);
                    setProdName('');
                    setProdPrice('');
                    setProdStock('');
                    setProdDesc('');
                    setProdImg('');
                    setProdCat(categories[0]?._id || '');
                    setShowAddForm(true);
                  }}
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
                      onSubmit={handleSaveProduct}
                      className="glass-card max-w-md w-full p-6 rounded-3xl border border-zinc-800 space-y-4"
                    >
                      <div className="pb-2 border-b border-zinc-850 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          {editProductId ? 'Edit Product Item' : 'New Product Item'}
                        </h4>
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
                              {categories.map(c => (
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
                          {editProductId ? 'Update' : 'Add Product'}
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
                      <th className="px-6 py-4 text-right">Actions</th>
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditProductId(p._id);
                                setProdName(p.productName);
                                setProdPrice(p.price.toString());
                                setProdStock(p.stock.toString());
                                setProdDesc(p.description || '');
                                setProdImg(p.images[0] || '');
                                setProdCat(p.category?._id || '');
                                setShowAddForm(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
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
                    href="/api/admin/reports/excel"
                    target="_blank"
                    className="w-full inline-flex items-center justify-center rounded-xl bg-pink-600 hover:bg-pink-500 py-3 text-xs font-semibold text-white transition-colors"
                  >
                    Download XLSX Spreadsheet
                  </a>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Revenue Line Chart */}
                <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850">
                    7-Day Revenue Trend
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                          itemStyle={{ color: '#c4b5fd', fontSize: '12px' }}
                          labelStyle={{ color: '#a1a1aa', fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sales by Category Pie Chart */}
                <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850">
                    Sales by Category
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                          formatter={(value: any) => [`₹${value}`, 'Sales']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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

          {/* TAB 6: CATEGORIES */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Categories</h1>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">MANAGE PRODUCT CLASSIFICATIONS</p>
                </div>
                <button
                  onClick={() => {
                    setEditCategoryId(null);
                    setCatName('');
                    setCatDesc('');
                    setCatImg('');
                    setShowCategoryForm(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Add/Edit Category Modal */}
              <AnimatePresence>
                {showCategoryForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.form
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onSubmit={handleSaveCategory}
                      className="glass-card max-w-sm w-full p-6 rounded-3xl border border-zinc-800 space-y-4"
                    >
                      <div className="pb-2 border-b border-zinc-850 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          {editCategoryId ? 'Edit Category' : 'New Category'}
                        </h4>
                        <button type="button" onClick={() => setShowCategoryForm(false)} className="text-zinc-500 hover:text-white">✕</button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Category Name</label>
                          <input
                            type="text" required value={catName} onChange={(e) => setCatName(e.target.value)}
                            placeholder="e.g. Electronics"
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Description</label>
                          <textarea
                            required value={catDesc} onChange={(e) => setCatDesc(e.target.value)}
                            placeholder="e.g. All electronic gadgets..."
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Image URL</label>
                          <input
                            type="text" required value={catImg} onChange={(e) => setCatImg(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-end pt-2">
                        <button
                          type="button" onClick={() => setShowCategoryForm(false)}
                          className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer"
                        >
                          {editCategoryId ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </motion.form>
                  </div>
                )}
              </AnimatePresence>

              {/* Categories Table */}
              <div className="glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Category Name</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-6 text-zinc-500 text-xs">No categories found.</td></tr>
                    ) : categories.map(c => (
                      <tr key={c._id} className="border-b border-zinc-900 text-xs hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <img
                            src={c.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                            alt="" className="h-8 w-8 object-cover rounded-lg border border-zinc-850"
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-white uppercase">{c.categoryName}</td>
                        <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate" title={c.description}>{c.description || 'No description'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditCategoryId(c._id);
                                setCatName(c.categoryName);
                                setCatDesc(c.description || '');
                                setCatImg(c.image || '');
                                setShowCategoryForm(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <motion.div
              key="coupons"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Coupons</h1>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">MANAGE DISCOUNT CODES AND PROMOTIONS</p>
                </div>
                <button
                  onClick={() => {
                    setEditCouponId(null);
                    setCouponName('');
                    setCouponValue('');
                    setCouponExpiry('');
                    setCouponMin('');
                    setCouponMax('');
                    setShowCouponForm(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Coupon</span>
                </button>
              </div>

              {/* Add/Edit Coupon Modal */}
              <AnimatePresence>
                {showCouponForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.form
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onSubmit={handleSaveCoupon}
                      className="glass-card max-w-md w-full p-6 rounded-3xl border border-zinc-800 space-y-4"
                    >
                      <div className="pb-2 border-b border-zinc-850 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          {editCouponId ? 'Edit Coupon' : 'New Coupon'}
                        </h4>
                        <button type="button" onClick={() => setShowCouponForm(false)} className="text-zinc-500 hover:text-white">✕</button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Coupon Code</label>
                            <input
                              type="text" required value={couponName} onChange={(e) => setCouponName(e.target.value.toUpperCase())}
                              placeholder="e.g. SUMMER10"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none uppercase"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Discount (%)</label>
                            <input
                              type="number" required value={couponValue} onChange={(e) => setCouponValue(e.target.value)}
                              placeholder="e.g. 10"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Min Spend (₹)</label>
                            <input
                              type="number" required value={couponMin} onChange={(e) => setCouponMin(e.target.value)}
                              placeholder="e.g. 1000"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Max Cap (₹)</label>
                            <input
                              type="number" required value={couponMax} onChange={(e) => setCouponMax(e.target.value)}
                              placeholder="e.g. 500"
                              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Expiry Date (DD-MM-YYYY)</label>
                          <input
                            type="text" required value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)}
                            placeholder="e.g. 31-12-2025"
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-end pt-2">
                        <button
                          type="button" onClick={() => setShowCouponForm(false)}
                          className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer"
                        >
                          {editCouponId ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </motion.form>
                  </div>
                )}
              </AnimatePresence>

              <div className="glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                      <th className="px-6 py-4">Coupon Code</th>
                      <th className="px-6 py-4">Discount (%)</th>
                      <th className="px-6 py-4">Min Spend</th>
                      <th className="px-6 py-4">Max Cap</th>
                      <th className="px-6 py-4">Expires</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-6 text-zinc-500 text-xs">No coupons found.</td></tr>
                    ) : coupons.map(c => (
                      <tr key={c._id} className="border-b border-zinc-900 text-xs hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-white uppercase">{c.couponName}</td>
                        <td className="px-6 py-4 text-emerald-400 font-mono">{c.couponValue}%</td>
                        <td className="px-6 py-4 text-zinc-300">₹{c.minValue}</td>
                        <td className="px-6 py-4 text-zinc-300">₹{c.maxValue}</td>
                        <td className="px-6 py-4 text-zinc-400">{c.expiryDate}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setEditCouponId(c._id);
                              setCouponName(c.couponName);
                              setCouponValue(c.couponValue.toString());
                              setCouponExpiry(c.expiryDate);
                              setCouponMin(c.minValue.toString());
                              setCouponMax(c.maxValue.toString());
                              setShowCouponForm(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 8: BANNERS */}
          {activeTab === 'banners' && (
            <motion.div
              key="banners"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Banners</h1>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">MANAGE HOMEPAGE CAROUSEL BANNERS</p>
                </div>
                <button
                  onClick={() => {
                    setEditBannerId(null);
                    setBannerName('');
                    setBannerTitle('');
                    setBannerSubtitle('');
                    setBannerImage('');
                    setShowBannerForm(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Banner</span>
                </button>
              </div>

              {/* Add/Edit Banner Modal */}
              <AnimatePresence>
                {showBannerForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.form
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onSubmit={handleSaveBanner}
                      className="glass-card max-w-md w-full p-6 rounded-3xl border border-zinc-800 space-y-4"
                    >
                      <div className="pb-2 border-b border-zinc-850 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          {editBannerId ? 'Edit Banner' : 'New Banner'}
                        </h4>
                        <button type="button" onClick={() => setShowBannerForm(false)} className="text-zinc-500 hover:text-white">✕</button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Banner Name (Internal)</label>
                          <input
                            type="text" required value={bannerName} onChange={(e) => setBannerName(e.target.value)}
                            placeholder="e.g. Summer Sale 2025"
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Heading Title</label>
                          <input
                            type="text" required value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)}
                            placeholder="e.g. Massive Discounts"
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Subtitle / Description</label>
                          <input
                            type="text" required value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)}
                            placeholder="e.g. Get up to 50% off on all items"
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Image URL</label>
                          <input
                            type="text" required value={bannerImage} onChange={(e) => setBannerImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-end pt-2">
                        <button
                          type="button" onClick={() => setShowBannerForm(false)}
                          className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white cursor-pointer"
                        >
                          {editBannerId ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </motion.form>
                  </div>
                )}
              </AnimatePresence>

              <div className="glass-card rounded-3xl border border-zinc-800/80 bg-zinc-900/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Banner Name</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Subtitle</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-6 text-zinc-500 text-xs">No banners found.</td></tr>
                    ) : banners.map(b => (
                      <tr key={b._id} className="border-b border-zinc-900 text-xs hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <img
                            src={b.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                            alt="" className="h-8 w-16 object-cover rounded-lg border border-zinc-850"
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-white uppercase">{b.bannerName}</td>
                        <td className="px-6 py-4 text-zinc-300">{b.title}</td>
                        <td className="px-6 py-4 text-zinc-400">{b.subtitle}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setEditBannerId(b._id);
                              setBannerName(b.bannerName);
                              setBannerTitle(b.title);
                              setBannerSubtitle(b.subtitle);
                              setBannerImage(b.image);
                              setShowBannerForm(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Customer Reviews</h3>
              </div>
              <div className="glass-card rounded-2xl border border-zinc-800/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-300 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">Product</th>
                        <th className="px-6 py-4 font-bold">User</th>
                        <th className="px-6 py-4 font-bold">Rating</th>
                        <th className="px-6 py-4 font-bold">Comment</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 font-medium">No reviews found</td>
                        </tr>
                      ) : (
                        reviews.map((r) => (
                          <tr key={r._id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-white truncate max-w-[150px]">{r.productName}</td>
                            <td className="px-6 py-4">{r.userName}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-violet-400 text-violet-400" />
                                <span>{r.rating}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-zinc-400 truncate max-w-[200px]">{r.comment}</td>
                            <td className="px-6 py-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => {
                                    setEditReviewData(r);
                                    setReviewRating(r.rating);
                                    setReviewComment(r.comment);
                                    setShowReviewForm(true);
                                  }}
                                  className="text-violet-400 hover:text-violet-300 transition-colors p-1"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(r.productId, r._id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Edit Review Modal */}
          {showReviewForm && editReviewData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
              <div className="glass-card w-full max-w-lg rounded-3xl border border-zinc-800 p-6 md:p-8">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-6">Edit Review</h3>
                <form onSubmit={handleSaveReview} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-zinc-400">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      required
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-zinc-400">Comment</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1 rounded-xl bg-zinc-800 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
