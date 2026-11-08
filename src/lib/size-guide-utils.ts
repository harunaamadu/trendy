export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type MeasurementUnit = 'in' | 'cm';
export type FitPreference = 'snug' | 'regular' | 'relaxed';

export interface SizeRecommendationInput {
  chest: number; // in or cm
  waist?: number;
  hips?: number;
  height?: number;
  unit: MeasurementUnit;
  fitPreference: FitPreference;
  category?: string;
}

export interface SizeRecommendationResult {
  recommendedSize: ClothingSize;
  matchScore: number; // 0 to 100%
  fitVerdict: string;
  alternativeSize?: ClothingSize;
  alternativeExplanation?: string;
  chestRange: string;
}

export interface SizeChartRow {
  size: ClothingSize;
  chest: string;
  waist: string;
  hips: string;
  length: string;
  sleeve: string;
}

// Baseline size measurements in inches (midpoint & bounds)
const SIZE_STANDARDS_IN: Record<ClothingSize, { minChest: number; maxChest: number; midChest: number; minWaist: number; maxWaist: number }> = {
  XS: { minChest: 32, maxChest: 34.5, midChest: 33.5, minWaist: 26, maxWaist: 28 },
  S:  { minChest: 35, maxChest: 37.5, midChest: 36.5, minWaist: 29, maxWaist: 31 },
  M:  { minChest: 38, maxChest: 40.5, midChest: 39.5, minWaist: 32, maxWaist: 34 },
  L:  { minChest: 41, maxChest: 43.5, midChest: 42.5, minWaist: 35, maxWaist: 37 },
  XL: { minChest: 44, maxChest: 48.0, midChest: 46.0, minWaist: 38, maxWaist: 42 },
};

export function inchesToCm(inches: number): number {
  return Number((inches * 2.54).toFixed(1));
}

export function cmToInches(cm: number): number {
  return Number((cm / 2.54).toFixed(1));
}

export function calculateRecommendedSize(input: SizeRecommendationInput): SizeRecommendationResult {
  if (!input.chest || input.chest <= 0) {
    return {
      recommendedSize: 'M',
      matchScore: 80,
      fitVerdict: 'Please enter your chest or bust measurement for a personalized calculation.',
      chestRange: '38" - 40.5"',
    };
  }

  // Convert to inches for standard comparison
  const chestInches = input.unit === 'cm' ? cmToInches(input.chest) : input.chest;
  const waistInches = input.waist ? (input.unit === 'cm' ? cmToInches(input.waist) : input.waist) : undefined;

  let bestSize: ClothingSize = 'M';
  let minDiff = 999;

  const sizes: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL'];

  for (const s of sizes) {
    const std = SIZE_STANDARDS_IN[s];
    // Check if directly in range
    if (chestInches >= std.minChest && chestInches <= std.maxChest) {
      bestSize = s;
      minDiff = 0;
      break;
    }
    const diff = Math.abs(chestInches - std.midChest);
    if (diff < minDiff) {
      minDiff = diff;
      bestSize = s;
    }
  }

  // Adjust for Fit Preference
  let finalSize = bestSize;
  let alternativeSize: ClothingSize | undefined;
  let alternativeExplanation: string | undefined;

  const sizeOrder: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL'];
  const currentIndex = sizeOrder.indexOf(bestSize);

  if (input.fitPreference === 'snug' && currentIndex > 0) {
    // If between sizes or prefers close fit
    alternativeSize = bestSize;
    if (chestInches <= SIZE_STANDARDS_IN[bestSize].minChest + 1) {
      finalSize = sizeOrder[currentIndex - 1];
      alternativeExplanation = `Size ${bestSize} will offer a slightly looser, casual look.`;
    } else {
      alternativeExplanation = `Size ${sizeOrder[currentIndex - 1]} for an ultra-tailored contour.`;
    }
  } else if (input.fitPreference === 'relaxed' && currentIndex < sizeOrder.length - 1) {
    alternativeSize = bestSize;
    if (chestInches >= SIZE_STANDARDS_IN[bestSize].maxChest - 1) {
      finalSize = sizeOrder[currentIndex + 1];
      alternativeExplanation = `Size ${bestSize} gives a standard modern cut.`;
    } else {
      alternativeExplanation = `Size ${sizeOrder[currentIndex + 1]} for an oversized streetwear drape.`;
    }
  }

  // Consider waist for bottoms/trouser or broader midsection
  if (waistInches && waistInches > SIZE_STANDARDS_IN[finalSize].maxWaist) {
    const nextIdx = sizeOrder.indexOf(finalSize) + 1;
    if (nextIdx < sizeOrder.length) {
      alternativeSize = finalSize;
      finalSize = sizeOrder[nextIdx];
      alternativeExplanation = `Adjusted from ${sizeOrder[nextIdx - 1]} to provide comfortable ease around the waistband.`;
    }
  }

  // Compute confidence match percentage
  const std = SIZE_STANDARDS_IN[finalSize];
  const deviation = Math.abs(chestInches - std.midChest);
  const matchScore = Math.max(78, Math.min(99, Math.round(98 - deviation * 3.5)));

  const unitSymbol = input.unit === 'cm' ? 'cm' : '"';
  const rangeDisplay = input.unit === 'cm'
    ? `${inchesToCm(std.minChest)} - ${inchesToCm(std.maxChest)} cm`
    : `${std.minChest}" - ${std.maxChest}"`;

  let fitVerdict = `Size ${finalSize} aligns best with your ${input.chest}${unitSymbol} chest`;
  if (input.fitPreference === 'relaxed') {
    fitVerdict += ' with a generous, effortless silhouette.';
  } else if (input.fitPreference === 'snug') {
    fitVerdict += ' with a sleek, close-to-body contour.';
  } else {
    fitVerdict += ' for the intended classic drape.';
  }

  return {
    recommendedSize: finalSize,
    matchScore,
    fitVerdict,
    alternativeSize,
    alternativeExplanation,
    chestRange: rangeDisplay,
  };
}

export function getSizeChart(unit: MeasurementUnit): SizeChartRow[] {
  const isCm = unit === 'cm';

  return [
    {
      size: 'XS',
      chest: isCm ? '81 - 88 cm' : '32 - 34.5"',
      waist: isCm ? '66 - 71 cm' : '26 - 28"',
      hips: isCm ? '84 - 89 cm' : '33 - 35"',
      length: isCm ? '66 cm' : '26.0"',
      sleeve: isCm ? '81 cm' : '32.0"',
    },
    {
      size: 'S',
      chest: isCm ? '89 - 95 cm' : '35 - 37.5"',
      waist: isCm ? '74 - 79 cm' : '29 - 31"',
      hips: isCm ? '91 - 97 cm' : '36 - 38"',
      length: isCm ? '68 cm' : '26.8"',
      sleeve: isCm ? '83 cm' : '32.7"',
    },
    {
      size: 'M',
      chest: isCm ? '96 - 103 cm' : '38 - 40.5"',
      waist: isCm ? '81 - 86 cm' : '32 - 34"',
      hips: isCm ? '99 - 104 cm' : '39 - 41"',
      length: isCm ? '70 cm' : '27.5"',
      sleeve: isCm ? '86 cm' : '33.8"',
    },
    {
      size: 'L',
      chest: isCm ? '104 - 110 cm' : '41 - 43.5"',
      waist: isCm ? '89 - 94 cm' : '35 - 37"',
      hips: isCm ? '107 - 112 cm' : '42 - 44"',
      length: isCm ? '72 cm' : '28.3"',
      sleeve: isCm ? '88 cm' : '34.6"',
    },
    {
      size: 'XL',
      chest: isCm ? '111 - 122 cm' : '44 - 48"',
      waist: isCm ? '97 - 104 cm' : '38 - 41"',
      hips: isCm ? '114 - 122 cm' : '45 - 48"',
      length: isCm ? '74 cm' : '29.1"',
      sleeve: isCm ? '90 cm' : '35.4"',
    },
  ];
}
