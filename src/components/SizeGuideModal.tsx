import React, { useState } from 'react';
import {
  Ruler,
  Check,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Calculator,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import {
  ClothingSize,
  MeasurementUnit,
  FitPreference,
  calculateRecommendedSize,
  getSizeChart,
  inchesToCm,
  cmToInches,
} from '../lib/size-guide-utils';
import { useShop } from '../context/ShopContext';

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  category: string;
  currentSize: string;
  onSelectSize: (size: ClothingSize) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  open,
  onOpenChange,
  productName,
  category,
  currentSize,
  onSelectSize,
}) => {
  const { showToast } = useShop();

  const [activeTab, setActiveTab] = useState<'calculator' | 'chart'>('calculator');
  const [unit, setUnit] = useState<MeasurementUnit>('in');

  // Calculator inputs
  const [chest, setChest] = useState<number>(38);
  const [waist, setWaist] = useState<number>(31);
  const [hips, setHips] = useState<number>(39);
  const [fitPreference, setFitPreference] = useState<FitPreference>('regular');

  // Handle unit switch with conversion
  const handleToggleUnit = (newUnit: MeasurementUnit) => {
    if (newUnit === unit) return;
    if (newUnit === 'cm') {
      setChest((c) => (c ? inchesToCm(c) : c));
      setWaist((w) => (w ? inchesToCm(w) : w));
      setHips((h) => (h ? inchesToCm(h) : h));
    } else {
      setChest((c) => (c ? cmToInches(c) : c));
      setWaist((w) => (w ? cmToInches(w) : w));
      setHips((h) => (h ? cmToInches(h) : h));
    }
    setUnit(newUnit);
  };

  const recommendation = calculateRecommendedSize({
    chest,
    waist,
    hips,
    unit,
    fitPreference,
    category,
  });

  const chartRows = getSizeChart(unit);

  const handleApplySize = (size: ClothingSize) => {
    onSelectSize(size);
    onOpenChange(false);
    showToast(`Size ${size} applied to ${productName}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Size Guide & Fit Finder"
      description={`Find your ideal cut and size for ${productName}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Header Tabs & Unit Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                activeTab === 'calculator'
                  ? 'text-stone-900 border-b-2 border-stone-900 -mb-[13px]'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Smart Fit Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                activeTab === 'chart'
                  ? 'text-stone-900 border-b-2 border-stone-900 -mb-[13px]'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <TableIcon className="h-4 w-4" />
              <span>Measurement Table</span>
            </button>
          </div>

          {/* Unit Toggle Pill */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleToggleUnit('in')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                unit === 'in'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Inches (")
            </button>
            <button
              type="button"
              onClick={() => handleToggleUnit('cm')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                unit === 'cm'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* TAB 1: SMART FIT CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Chest / Bust ({unit === 'in' ? 'inches' : 'cm'}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="160"
                  value={chest || ''}
                  onChange={(e) => setChest(parseFloat(e.target.value) || 0)}
                  placeholder={unit === 'in' ? 'e.g. 38' : 'e.g. 96'}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Measure around the fullest part of your chest.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Natural Waist ({unit === 'in' ? 'inches' : 'cm'})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="15"
                  max="140"
                  value={waist || ''}
                  onChange={(e) => setWaist(parseFloat(e.target.value) || 0)}
                  placeholder={unit === 'in' ? 'e.g. 31' : 'e.g. 79'}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Measure around your natural waistline.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hips ({unit === 'in' ? 'inches' : 'cm'})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="160"
                  value={hips || ''}
                  onChange={(e) => setHips(parseFloat(e.target.value) || 0)}
                  placeholder={unit === 'in' ? 'e.g. 39' : 'e.g. 99'}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Stand with feet together and measure fullest hip part.
                </span>
              </div>
            </div>

            {/* Fit Preference Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Silhouette & Fit Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'snug' as FitPreference,
                    label: 'Tailored / Snug',
                    desc: 'Closer to body contour',
                  },
                  {
                    id: 'regular' as FitPreference,
                    label: 'Standard / Regular',
                    desc: 'Classic intended drape',
                  },
                  {
                    id: 'relaxed' as FitPreference,
                    label: 'Oversized / Relaxed',
                    desc: 'Generous, effortless ease',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFitPreference(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      fitPreference === item.id
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        fitPreference === item.id ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Result Card */}
            <div className="bg-[#f7f5f2] rounded-2xl p-5 border border-stone-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-stone-900 text-white font-mono font-extrabold text-xl flex items-center justify-center shadow-md">
                    {recommendation.recommendedSize}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Recommended Size
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <Sparkles className="h-3 w-3 text-emerald-600" />
                        {recommendation.matchScore}% Match
                      </span>
                    </div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">
                      Chest Range: {recommendation.chestRange}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <Button
                  size="sm"
                  onClick={() => handleApplySize(recommendation.recommendedSize)}
                  className="rounded-full text-xs font-semibold px-5 py-2.5 bg-stone-900 hover:bg-black text-white shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Apply Size {recommendation.recommendedSize}</span>
                </Button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-200/80 pt-3">
                {recommendation.fitVerdict}
              </p>

              {recommendation.alternativeSize && recommendation.alternativeExplanation && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-200 text-xs">
                  <div>
                    <span className="font-semibold text-stone-800">
                      Alternative Option (Size {recommendation.alternativeSize}):
                    </span>{' '}
                    <span className="text-stone-500">{recommendation.alternativeExplanation}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySize(recommendation.alternativeSize!)}
                    className="text-stone-800 font-bold hover:underline text-[11px] shrink-0 ml-3"
                  >
                    Select {recommendation.alternativeSize}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MEASUREMENT TABLE */}
        {activeTab === 'chart' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest / Bust</th>
                    <th className="p-3">Waist</th>
                    <th className="p-3">Hips</th>
                    <th className="p-3">Garment Length</th>
                    <th className="p-3">Sleeve Length</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {chartRows.map((row) => {
                    const isSelected = currentSize === row.size;
                    return (
                      <tr
                        key={row.size}
                        className={`transition-colors ${
                          isSelected ? 'bg-amber-50/60 font-semibold' : 'hover:bg-stone-50/50'
                        }`}
                      >
                        <td className="p-3 font-bold text-stone-900">
                          <span className="inline-flex items-center gap-1.5">
                            <span>{row.size}</span>
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-stone-700">{row.chest}</td>
                        <td className="p-3 text-stone-700">{row.waist}</td>
                        <td className="p-3 text-stone-700">{row.hips}</td>
                        <td className="p-3 text-stone-700">{row.length}</td>
                        <td className="p-3 text-stone-700">{row.sleeve}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleApplySize(row.size)}
                            className="rounded-full text-[11px] h-7 px-3 cursor-pointer"
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* How to Measure Guidelines */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Ruler className="h-4 w-4 text-stone-600" />
                <span>How to Measure Accurately</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600 text-[11px] leading-relaxed pt-1">
                <div>
                  <strong>Chest / Bust:</strong> Wrap measuring tape horizontally under arms across the fullest part of your chest.
                </div>
                <div>
                  <strong>Natural Waist:</strong> Measure around the narrowest section of your torso, keeping the tape comfortably loose.
                </div>
                <div>
                  <strong>Hips:</strong> Measure around the widest circumference across the hip bone and glutes.
                </div>
                <div>
                  <strong>Sleeve Length:</strong> From center back of your neck along the shoulder line down to wrist bone.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
