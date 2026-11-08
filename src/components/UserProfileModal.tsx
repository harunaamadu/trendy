import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Shield,
  Phone,
  Mail,
  Edit2,
  X,
} from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useShop } from '../context/ShopContext';
import { SavedAddress, Order } from '../types/ecommerce';
import { validateAddressInput, validateUserProfile } from '../lib/user-profile-utils';

interface UserProfileModalProps {
  onOpenOrderTracking?: (orderId?: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  onOpenOrderTracking,
}) => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    userProfile,
    updateProfile,
    savedAddresses,
    saveAddress,
    updateAddress,
    deleteAddress,
    setDefaultShippingAddress,
    orders,
    addToCart,
    setIsCartOpen,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'details'>('orders');

  // Account details form state
  const [profileForm, setProfileForm] = useState(userProfile);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, 'id'>>({
    label: 'Home',
    fullName: userProfile.fullName || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: userProfile.phone || '',
    isDefault: false,
  });
  const [addressError, setAddressError] = useState<string | null>(null);

  // Sync profile form when userProfile changes
  React.useEffect(() => {
    setProfileForm(userProfile);
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUserProfile(profileForm);
    if (!validation.valid) {
      showToast(validation.error || 'Please fill in valid profile information.');
      return;
    }

    setProfileSaving(true);
    await updateProfile(profileForm);
    setProfileSaving(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    const validation = validateAddressInput(addressForm);
    if (!validation.valid) {
      setAddressError(validation.error || 'Please enter complete address details.');
      return;
    }

    if (editingAddressId) {
      await updateAddress(editingAddressId, addressForm);
      setEditingAddressId(null);
    } else {
      await saveAddress(addressForm);
    }

    setIsAddingAddress(false);
    setAddressForm({
      label: 'Home',
      fullName: userProfile.fullName || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: userProfile.phone || '',
      isDefault: false,
    });
  };

  const handleEditAddressClick = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      fullName: addr.fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone || '',
      isDefault: addr.isDefault,
    });
    setIsAddingAddress(true);
  };

  const handleReorder = (order: Order) => {
    let addedCount = 0;
    for (const item of order.items) {
      addToCart(
        {
          id: item.productId,
          sku: 'TRN-ORD',
          name: item.name,
          category: 'All',
          price: item.price,
          originalPrice: item.originalPrice,
          rating: 5,
          reviewCount: 1,
          description: '',
          details: [],
          fabric: '',
          care: '',
          sustainability: '',
          images: [item.image],
          colors: [{ name: item.color, hex: item.colorHex }],
          sizes: [item.size as any],
          stock: 99,
          lowStockThreshold: 5,
        },
        item.size,
        item.color,
        item.colorHex,
        item.quantity
      );
      addedCount++;
    }
    if (addedCount > 0) {
      showToast(`Added ${addedCount} items from order ${order.id} back to your shopping bag.`);
      setIsProfileOpen(false);
      setIsCartOpen(true);
    }
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <Truck className="h-3 w-3" />
            In Transit
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
            Confirmed
          </span>
        );
    }
  };

  return (
    <Dialog
      open={isProfileOpen}
      onOpenChange={setIsProfileOpen}
      title="Member Profile & Account"
      description="Manage your order records, saved shipping addresses, and bespoke preferences"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Profile Card Header Banner */}
        <div className="bg-[#f7f5f2] rounded-2xl p-4 sm:p-5 border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-stone-900 text-white font-serif font-bold text-lg flex items-center justify-center uppercase shadow-sm">
              {userProfile.fullName ? userProfile.fullName.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base">{userProfile.fullName}</h3>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full uppercase">
                  VIP Member
                </span>
              </div>
              <p className="text-xs text-stone-500">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-600">
            <div className="text-center">
              <span className="block font-bold text-stone-900 text-sm">{orders.length}</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">Orders</span>
            </div>
            <div className="h-6 w-px bg-stone-300" />
            <div className="text-center">
              <span className="block font-bold text-stone-900 text-sm">{savedAddresses.length}</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">Addresses</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === 'orders'
                ? 'text-stone-900 border-b-2 border-stone-900 -mb-[1px]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Order History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-semibold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === 'addresses'
                ? 'text-stone-900 border-b-2 border-stone-900 -mb-[1px]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Saved Addresses</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-semibold">
              {savedAddresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === 'details'
                ? 'text-stone-900 border-b-2 border-stone-900 -mb-[1px]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
                <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
                  <Package className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-stone-800">No orders placed yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  When you check out and complete an order, your tracking details and purchase receipts will appear here.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-full text-xs uppercase tracking-wider px-5 bg-stone-900 text-white"
                >
                  Explore Collection
                </Button>
              </div>
            ) : (
              orders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-4 shadow-2xs"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            {order.id}
                          </span>
                          {getOrderStatusBadge(order.status)}
                        </div>
                        <span className="text-[11px] text-stone-400 mt-0.5 block">
                          Placed on {dateStr} • {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Total</span>
                        <span className="text-base font-extrabold text-stone-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Purchased Item Thumbnails */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-10 object-cover rounded-lg bg-stone-100 shrink-0"
                            />
                            <div>
                              <h5 className="font-semibold text-stone-900">{item.name}</h5>
                              <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                                <span>Size: {item.size}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <span
                                    className="h-2 w-2 rounded-full border border-stone-300"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                  <span>{item.color}</span>
                                </div>
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-stone-800">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Details & Actions */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                        <Truck className="h-3.5 w-3.5 text-stone-400" />
                        <span>
                          Tracking: <span className="font-mono font-semibold text-stone-800">{order.trackingNumber}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenOrderTracking && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsProfileOpen(false);
                              onOpenOrderTracking(order.id);
                            }}
                            className="text-xs rounded-full h-8 px-3"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Track Order
                          </Button>
                        )}

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="text-xs rounded-full h-8 px-3 bg-stone-900 hover:bg-black text-white flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Buy Again</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Delivery Addresses</h4>
                <p className="text-xs text-stone-500">Speed up checkout with pre-verified shipping destinations.</p>
              </div>

              {!isAddingAddress && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      label: 'Home',
                      fullName: userProfile.fullName || '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: 'United States',
                      phone: userProfile.phone || '',
                      isDefault: savedAddresses.length === 0,
                    });
                    setIsAddingAddress(true);
                  }}
                  className="rounded-full text-xs font-semibold px-3.5 py-1.5 bg-stone-900 text-white flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Address</span>
                </Button>
              )}
            </div>

            {/* Inline Add / Edit Address Form */}
            {isAddingAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="p-5 rounded-2xl bg-white border border-stone-300 shadow-sm space-y-4 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h5 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                    {editingAddressId ? 'Edit Address' : 'New Delivery Address'}
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setEditingAddressId(null);
                    }}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {addressError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {addressError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Address Label *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      placeholder="e.g. Home, Studio, Office"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Full recipient name"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      placeholder="Street number and name"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">Apt, Suite, Unit (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      placeholder="Apartment, suite, or unit number"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="WA"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Zip *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        placeholder="98101"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs select-none pt-1">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-stone-700">Set as my default shipping address</span>
                </label>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setEditingAddressId(null);
                    }}
                    className="rounded-full text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-full text-xs px-5 bg-stone-900 text-white"
                  >
                    {editingAddressId ? 'Update Address' : 'Save Address'}
                  </Button>
                </div>
              </form>
            )}

            {/* Address Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    addr.isDefault
                      ? 'border-stone-900 bg-stone-50/60 shadow-xs ring-1 ring-stone-900/10'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-800 font-medium">{addr.fullName}</div>
                    <div className="text-xs text-stone-500 leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      <br />
                      {addr.city}, {addr.state} {addr.zipCode}
                      <br />
                      {addr.country}
                      {addr.phone && <div className="text-[11px] text-stone-400 mt-1">{addr.phone}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => setDefaultShippingAddress(addr.id)}
                        className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                      >
                        Make Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400">Primary destination</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAddressClick(addr)}
                        className="p-1 rounded text-stone-400 hover:text-stone-800"
                        title="Edit address"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600"
                        title="Delete address"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT & PERSONAL DETAILS */}
        {activeTab === 'details' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Your profile details have been saved successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Preferred Garment Size
                </label>
                <div className="flex gap-2">
                  {(['XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, preferredSize: sz })}
                      className={`h-9 flex-1 rounded-xl font-bold border transition-all cursor-pointer ${
                        profileForm.preferredSize === sz
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 font-semibold mb-1">
                  Capsule Style Preference
                </label>
                <input
                  type="text"
                  value={profileForm.stylePreference}
                  onChange={(e) => setProfileForm({ ...profileForm, stylePreference: e.target.value })}
                  placeholder="e.g. Modern Minimalist, Tailored Knitwear, Effortless Layers"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-1 focus:ring-stone-900 bg-stone-50/50"
                />
              </div>
            </div>

            {/* Notification & Communication Preferences */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="block font-semibold text-stone-800 text-xs">
                Communication & Notifications
              </span>
              <label className="flex items-center gap-2.5 cursor-pointer text-stone-600 select-none">
                <input
                  type="checkbox"
                  checked={profileForm.marketingEmails}
                  onChange={(e) => setProfileForm({ ...profileForm, marketingEmails: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>Receive early access invitations to new seasonal capsule drops</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-stone-600 select-none">
                <input
                  type="checkbox"
                  checked={profileForm.smsUpdates}
                  onChange={(e) => setProfileForm({ ...profileForm, smsUpdates: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>Receive live SMS dispatch and delivery milestone tracking</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={profileSaving}
                className="rounded-full text-xs font-semibold px-6 py-2 bg-stone-900 hover:bg-black text-white cursor-pointer"
              >
                {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};
