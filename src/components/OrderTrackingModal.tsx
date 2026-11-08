import React, { useState } from 'react';
import { PackageCheck, Search, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { useShop } from '../context/ShopContext';
import { Order } from '../types/ecommerce';

interface OrderTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ open, onOpenChange }) => {
  const { orders } = useShop();
  const [orderQuery, setOrderQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const clean = orderQuery.trim().toUpperCase();
    if (!clean) return;

    const found = orders.find((o) => o.id.toUpperCase() === clean || o.trackingNumber.toUpperCase() === clean);
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchError(`Order '${clean}' not found. Make sure to enter your TRND-XXXXX order code.`);
      setSearchedOrder(null);
    }
  };

  const steps = [
    { title: 'Order Confirmed', icon: CheckCircle2, done: true },
    { title: 'Tailoring & Packaging', icon: Clock, done: true },
    { title: 'In Transit with Courier', icon: Truck, done: searchedOrder?.status === 'shipped' || searchedOrder?.status === 'delivered' },
    { title: 'Delivered to Door', icon: Home, done: searchedOrder?.status === 'delivered' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Track Order & Shipment"
      description="Enter your Trendy order confirmation ID (e.g. TRND-84920) or tracking number"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="e.g. TRND-84920 or TRK-..."
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-200 text-xs text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>
          <Button type="submit" variant="default" size="sm" className="px-5 text-xs font-semibold uppercase">
            Track
          </Button>
        </form>

        {searchError && <p className="text-xs text-rose-500">{searchError}</p>}

        {/* Recent orders quick picker */}
        {orders.length > 0 && !searchedOrder && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Your Recent Orders:
            </span>
            <div className="space-y-1.5">
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setOrderQuery(o.id);
                    setSearchedOrder(o);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-stone-900">{o.id}</span>
                    <span className="text-stone-400 ml-2">
                      ({o.items.length} items • ${o.total.toFixed(2)})
                    </span>
                  </div>
                  <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                    {o.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order tracking timeline */}
        {searchedOrder && (
          <div className="space-y-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-xs">
              <div>
                <span className="text-stone-500">Order ID: </span>
                <strong className="font-mono text-stone-900">{searchedOrder.id}</strong>
              </div>
              <div>
                <span className="text-stone-500">Tracking: </span>
                <strong className="font-mono text-stone-900">{searchedOrder.trackingNumber}</strong>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="space-y-4">
              {steps.map((st, i) => {
                const Icon = st.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        st.done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className={`font-semibold ${st.done ? 'text-stone-900' : 'text-stone-400'}`}>
                        {st.title}
                      </div>
                      {i === 0 && (
                        <div className="text-[11px] text-stone-500">
                          Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      {i === 3 && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          Estimated by {searchedOrder.estimatedDelivery}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recipient info */}
            <div className="pt-3 border-t border-stone-200 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Delivering to:</span>{' '}
              {searchedOrder.shippingAddress.fullName}, {searchedOrder.shippingAddress.addressLine1},{' '}
              {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.state}{' '}
              {searchedOrder.shippingAddress.zipCode}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
