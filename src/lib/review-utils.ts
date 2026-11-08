import { Review } from '../types/ecommerce';

export interface RatingBreakdown {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, { count: number; percentage: number }>;
  fitSummary: {
    runsSmall: number;
    trueToSize: number;
    runsLarge: number;
    consensus: string;
  };
}

export function calculateRatingBreakdown(reviews: Review[]): RatingBreakdown {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: {
        5: { count: 0, percentage: 0 },
        4: { count: 0, percentage: 0 },
        3: { count: 0, percentage: 0 },
        2: { count: 0, percentage: 0 },
        1: { count: 0, percentage: 0 },
      },
      fitSummary: {
        runsSmall: 0,
        trueToSize: 0,
        runsLarge: 0,
        consensus: 'No feedback yet',
      },
    };
  }

  const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatingSum = 0;
  let smallCount = 0;
  let trueCount = 0;
  let largeCount = 0;

  for (const rev of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[star] = (counts[star] || 0) + 1;
    totalRatingSum += rev.rating;

    if (rev.fitFeedback === 'Runs Small') smallCount++;
    else if (rev.fitFeedback === 'Runs Large') largeCount++;
    else if (rev.fitFeedback === 'True to Size') trueCount++;
  }

  const total = reviews.length;
  const avg = Number((totalRatingSum / total).toFixed(1));

  let consensus = 'True to Size';
  if (smallCount > trueCount && smallCount > largeCount) {
    consensus = 'Runs Small (Size Up)';
  } else if (largeCount > trueCount && largeCount > smallCount) {
    consensus = 'Runs Large (Size Down)';
  }

  return {
    averageRating: avg,
    totalReviews: total,
    distribution: {
      5: { count: counts[5], percentage: Math.round((counts[5] / total) * 100) },
      4: { count: counts[4], percentage: Math.round((counts[4] / total) * 100) },
      3: { count: counts[3], percentage: Math.round((counts[3] / total) * 100) },
      2: { count: counts[2], percentage: Math.round((counts[2] / total) * 100) },
      1: { count: counts[1], percentage: Math.round((counts[1] / total) * 100) },
    },
    fitSummary: {
      runsSmall: smallCount,
      trueToSize: trueCount,
      runsLarge: largeCount,
      consensus,
    },
  };
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest' | 'helpful';

export function filterAndSortReviews(
  reviews: Review[],
  starFilter: number | null,
  sortBy: ReviewSortOption
): Review[] {
  let result = [...reviews];

  if (starFilter !== null && starFilter >= 1 && starFilter <= 5) {
    result = result.filter((r) => Math.round(r.rating) === starFilter);
  }

  switch (sortBy) {
    case 'highest':
      result.sort((a, b) => b.rating - a.rating || (b.helpfulCount || 0) - (a.helpfulCount || 0));
      break;
    case 'lowest':
      result.sort((a, b) => a.rating - b.rating || (b.helpfulCount || 0) - (a.helpfulCount || 0));
      break;
    case 'helpful':
      result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      break;
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return result;
}

export function validateReviewSubmission(input: {
  authorName: string;
  rating: number;
  title: string;
  comment: string;
}): { valid: boolean; error?: string } {
  if (!input.authorName || input.authorName.trim().length < 2) {
    return { valid: false, error: 'Please enter your name (at least 2 characters).' };
  }
  if (!input.rating || input.rating < 1 || input.rating > 5) {
    return { valid: false, error: 'Please select a star rating from 1 to 5.' };
  }
  if (!input.title || input.title.trim().length < 3) {
    return { valid: false, error: 'Please provide a review headline (at least 3 characters).' };
  }
  if (!input.comment || input.comment.trim().length < 10) {
    return { valid: false, error: 'Please write a brief comment with your feedback (at least 10 characters).' };
  }

  return { valid: true };
}
