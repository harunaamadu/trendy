import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  DollarSign,
  TrendingDown,
  Layers,
  Save,
} from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useShop } from '../context/ShopContext';
import { Product } from '../types/ecommerce';

export const InventoryManagerModal: React.FC = () => {
  const {
    isInventoryManagerOpen,
    setIsInventoryManagerOpen,
    products,
    updateInventoryStock,
    resetInventory,
    showToast,
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [editingPrice, setEditingPrice] = useState<Record<string, number>>({});

  // Sync state with product props
  useEffect(() => {
    const stockMap: Record<string, number> = {};
    const priceMap: Record<string, number> = {};
    products.forEach((p) => {
      stockMap[p.id] = p.stock;
      priceMap[p.id] = p.price;
    });
    setEditingStock(stockMap);
    setEditingPrice(priceMap);
  }, [products]);

  // Overall inventory stats
  const totalSkus = products.length;
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  );
  const outOfStockProducts = products.filter((p) => p.stock <= 0);
  const totalValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'low') return p.stock > 0 && p.stock <= p.lowStockThreshold;
    if (filterStatus === 'out') return p.stock <= 0;
    return true;
  });

  const handleStockChange = (productId: string, val: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handlePriceChange = (productId: string, val: number) => {
    setEditingPrice((prev) => ({
      ...prev,
      [productId]: Math.max(1, val),
    }));
  };

  const handleSaveItem = async (product: Product) => {
    const newStock = editingStock[product.id] ?? product.stock;
    const newPrice = editingPrice[product.id] ?? product.price;
    const ok = await updateInventoryStock(product.id, newStock, product.lowStockThreshold, newPrice);
    if (ok) {
      showToast(`Updated ${product.name} (Stock: ${newStock}, Price: $${newPrice})`);
    }
  };

  const handleQuickSet = async (product: Product, targetStock: number) => {
    handleStockChange(product.id, targetStock);
    await updateInventoryStock(product.id, targetStock);
  };

  return (
    <Dialog
      open={isInventoryManagerOpen}
      onOpenChange={setIsInventoryManagerOpen}
      title="Store Inventory & Stock Management"
      description="Real-time stock controls, low-stock threshold triggers, and SKU catalog management"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
              <Layers className="h-3.5 w-3.5" />
              <span>Total SKUs</span>
            </div>
            <div className="text-xl font-bold text-stone-900 mt-1">{totalSkus}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
              <Package className="h-3.5 w-3.5" />
              <span>Total Units</span>
            </div>
            <div className="text-xl font-bold text-stone-900 mt-1">{totalUnits}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Low Stock Alerts</span>
            </div>
            <div className="text-xl font-bold text-amber-900 mt-1">
              {lowStockProducts.length}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80">
            <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-medium">
              <XCircle className="h-3.5 w-3.5 text-rose-600" />
              <span>Out of Stock</span>
            </div>
            <div className="text-xl font-bold text-rose-900 mt-1">
              {outOfStockProducts.length}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span>Inventory Value</span>
            </div>
            <div className="text-xl font-bold text-emerald-950 mt-1">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters, and Factory Reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search SKU or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center rounded-xl border border-stone-200 p-0.5 bg-stone-50 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-600'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'low' ? 'bg-white shadow-xs text-amber-800 font-semibold' : 'text-stone-600'
                }`}
              >
                Low ({lowStockProducts.length})
              </button>
              <button
                onClick={() => setFilterStatus('out')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'out' ? 'bg-white shadow-xs text-rose-800 font-semibold' : 'text-stone-600'
                }`}
              >
                Sold Out ({outOfStockProducts.length})
              </button>
            </div>

            {/* Reset Defaults */}
            <button
              onClick={resetInventory}
              title="Reset stock to demo defaults"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price ($)</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredProducts.map((p) => {
                const stockVal = editingStock[p.id] ?? p.stock;
                const priceVal = editingPrice[p.id] ?? p.price;
                const isLow = stockVal > 0 && stockVal <= p.lowStockThreshold;
                const isOut = stockVal <= 0;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-10 w-9 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-900">{p.name}</div>
                          <span className="font-mono text-[10px] text-stone-400">
                            {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-600">{p.category}</td>

                    {/* Price editor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400">$</span>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={priceVal}
                          onChange={(e) => handlePriceChange(p.id, parseFloat(e.target.value) || 0)}
                          className="w-16 h-7 px-2 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>
                    </td>

                    {/* Stock editor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockChange(p.id, stockVal - 1)}
                          className="h-6 w-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={stockVal}
                          onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                          className="w-14 h-7 text-center border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                        <button
                          onClick={() => handleStockChange(p.id, stockVal + 1)}
                          className="h-6 w-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isOut ? (
                        <Badge variant="danger">Sold Out (0)</Badge>
                      ) : isLow ? (
                        <Badge variant="warning">Low Stock ({stockVal})</Badge>
                      ) : (
                        <Badge variant="success">Healthy ({stockVal})</Badge>
                      )}
                    </td>

                    {/* Quick Test Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickSet(p, 0)}
                          title="Set stock to 0 to test out-of-stock behavior in product grid"
                          className="px-2 py-1 text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                        >
                          Set Out (0)
                        </button>
                        <button
                          onClick={() => handleQuickSet(p, 2)}
                          title="Set stock to 2 to test low stock urgency badge"
                          className="px-2 py-1 text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                        >
                          Set Low (2)
                        </button>
                        <button
                          onClick={() => handleQuickSet(p, 20)}
                          title="Restock 20 units"
                          className="px-2 py-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                        >
                          +20 Units
                        </button>
                        <button
                          onClick={() => handleSaveItem(p)}
                          title="Save custom changes"
                          className="p-1 rounded-lg bg-stone-900 text-white hover:bg-black transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Dialog>
  );
};
