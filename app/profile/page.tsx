'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface UserProfile {
  name: string;
  email: string;
  mobile: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Address add form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile || 'N/A',
        });

        // Fetch address book
        const addrRes = await fetch('/api/profile/address');
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(addrData.addresses || []);
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
        setShowForm(false);
        // Clear
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

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await fetch('/api/profile/address', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });

      if (res.ok) {
        setAddresses((prev) => prev.filter((item) => item._id !== addressId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold text-zinc-400">Loading user profile...</div>
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
          Profile Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-zinc-950">
              <div className="h-16 w-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/15">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">{profile?.name}</h3>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Store Customer</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <Mail className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                <span className="text-xs text-zinc-400 font-mono truncate">{profile?.email}</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                <span className="text-xs text-zinc-400 font-mono">{profile?.mobile}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Addresses Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/10 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-violet-500" />
                <span>Saved Address Book</span>
              </h3>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Address Add form */}
            <AnimatePresence>
              {showForm && (
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
                      onClick={() => setShowForm(false)}
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
            <div className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/20 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white uppercase block">{addr.name}</span>
                      <p className="text-xs text-zinc-450 leading-relaxed max-w-md">
                        {addr.houseNumber}, {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <span className="text-[10px] font-semibold text-zinc-500 block">Phone: {addr.phone}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors hover:bg-red-950/20 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-850 rounded-2xl">
                  No addresses saved in address book.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
