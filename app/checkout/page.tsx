'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Wallet, CreditCard, Tag, Plus, CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

interface Address {
  _id: string;
  name: string;
  phone: number;
  houseNumber: string;
  pincode: number;
  address: string;
  city: string;
  state: string;
}

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cod' | 'razorpay'>('cod');
  
  // Wallet balance
  const [walletBalance, setWalletBalance] = useState(0);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Coupon State
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Statuses
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session & wallet
        const sessionRes = await fetch('/api/auth/me');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setWalletBalance(sessionData.user.wallet);
        } else {
          router.push('/login');
          return;
        }

        // Fetch Cart
        const cartRes = await fetch('/api/cart');
        const cartData = await cartRes.json();
        setCart(cartData.cart || []);

        if (!cartData.cart || cartData.cart.length === 0) {
          router.push('/cart');
          return;
        }

        // Fetch Addresses
        const addressRes = await fetch('/api/profile/address');
        const addressData = await addressRes.json();
        setAddresses(addressData.addresses || []);
        if (addressData.addresses?.length > 0) {
          setSelectedAddress(addressData.addresses[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: Number(phone),
          houseNumber,
          pincode: Number(pincode),
          address: addressLine,
          city,
          state,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[data.addresses.length - 1]._id);
        }
        setShowAddressForm(false);
        // Clear inputs
        setName('');
        setPhone('');
        setHouseNumber('');
        setPincode('');
        setAddressLine('');
        setCity('');
        setState('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      const res = await fetch('/api/coupon/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponName: coupon, subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discount);
        setAppliedCoupon(data.couponName);
        setCoupon('');
      } else {
        setCouponError(data.error || 'Failed to apply coupon');
      }
    } catch {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setCheckoutError('Please select a delivery address');
      return;
    }

    setCheckoutError('');
    setPlacingOrder(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          couponName: appliedCoupon,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.orderId);
        // Sync Navbar cart count
        window.dispatchEvent(new Event('popstate'));
      } else {
        setCheckoutError(data.error || 'Failed to place order');
      }
    } catch {
      setCheckoutError('An unexpected error occurred. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold text-zinc-400">Preparing checkout window...</div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass-card p-8 rounded-3xl text-center flex flex-col items-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-500 text-emerald-400"
          >
            <CheckCircle className="h-10 w-10" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Order Confirmed</h2>
            <p className="text-xs text-zinc-500 font-semibold tracking-wide">
              YOUR ORDER ID IS <span className="text-violet-400 font-bold">#{orderSuccess}</span>
            </p>
          </div>
          <p className="text-sm text-zinc-400">
            Thank you for shopping with Preethika. We have received your order and are preparing it for delivery.
          </p>
          <button
            onClick={() => router.push('/orders')}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-sm font-semibold text-white transition-colors"
          >
            Track My Orders
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center w-full">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-violet-500" />
                <span>Delivery Address</span>
              </h3>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Address Add Form */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddAddress}
                  className="space-y-4 bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Receiver's Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Receiver's Phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Flat/House No."
                      required
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Address Line"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none sm:col-span-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Pincode"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
                    >
                      Save Address
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List addresses */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr._id)}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      selectedAddress === addr._id
                        ? 'border-violet-500 bg-violet-950/15'
                        : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white uppercase">{addr.name}</span>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {addr.houseNumber}, {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 mt-3">Phone: {addr.phone}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                No addresses saved. Add an address to place your order.
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850 flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-violet-500" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cash on Delivery */}
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-violet-500 bg-violet-950/15'
                    : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                }`}
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                  <CreditCard className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-white uppercase">COD</span>
                  <span className="text-[10px] text-zinc-500">Pay on Delivery</span>
                </div>
              </button>

              {/* Wallet */}
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === 'wallet'
                    ? 'border-violet-500 bg-violet-950/15'
                    : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                }`}
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                  <Wallet className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-white uppercase">Wallet</span>
                  <span className="text-[10px] text-emerald-500 font-bold">₹{walletBalance.toFixed(2)}</span>
                </div>
              </button>

              {/* Razorpay (Simulated/Mock) */}
              <button
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === 'razorpay'
                    ? 'border-violet-500 bg-violet-950/15'
                    : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                }`}
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-white uppercase">Online Card</span>
                  <span className="text-[10px] text-zinc-500">Fast Checkout</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Coupon Module */}
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4.5 w-4.5 text-violet-500" />
              <span>Apply Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-violet-950/20 border border-violet-850 px-4 py-2.5 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-violet-300 uppercase block">{appliedCoupon}</span>
                  <span className="text-[10px] text-zinc-400">Coupon discount: -₹{discount}</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. PREETHIKA10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 px-4 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] font-medium text-red-400 mt-1">{couponError}</p>
                )}
                <p className="text-[10px] text-zinc-500 font-medium">Use code <span className="text-violet-400 font-bold">PREETHIKA10</span> for 10% off orders above ₹1,000.</p>
              </div>
            )}
          </div>

          {/* Checkout Details */}
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-850">
              Checkout details
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                <span>Subtotal</span>
                <span className="text-zinc-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="text-violet-400">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-zinc-400 font-semibold">
                <span>Shipping</span>
                <span className="text-emerald-500">FREE</span>
              </div>
              <div className="border-t border-zinc-900 pt-4 flex justify-between text-base font-extrabold text-white">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-2.5 text-xs text-red-400 font-medium">
                {checkoutError}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50 cursor-pointer"
            >
              {placingOrder ? 'Processing...' : paymentMethod === 'wallet' ? 'Pay & Place Order' : 'Place Order'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
