import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRatingBreakdown,
  filterAndSortReviews,
  validateReviewSubmission,
} from './review-utils';
import { Review } from '../types/ecommerce';

const sampleReviews: Review[] = [
  {
    id: 'r1',
    productId: 'prod-1',
    authorName: 'Alice',
    rating: 5,
    title: 'Fantastic sweater',
    comment: 'Warm and comfortable cashmere, fits true to size.',
    createdAt: '2026-10-01T00:00:00Z',
    verifiedPurchase: true,
    fitFeedback: 'True to Size',
    helpfulCount: 10,
  },
  {
    id: 'r2',
    productId: 'prod-1',
    authorName: 'Bob',
    rating: 4,
    title: 'Good quality',
    comment: 'Nice material, slightly loose around waist.',
    createdAt: '2026-10-15T00:00:00Z',
    verifiedPurchase: true,
    fitFeedback: 'Runs Large',
    helpfulCount: 2,
  },
  {
    id: 'r3',
    productId: 'prod-1',
    authorName: 'Charlie',
    rating: 5,
    title: 'Supreme luxury',
    comment: 'Best piece of clothing I have bought this season.',
    createdAt: '2026-11-01T00:00:00Z',
    verifiedPurchase: true,
    fitFeedback: 'True to Size',
    helpfulCount: 5,
  },
];

describe('Review calculation & rating breakdown', () => {
  it('correctly computes average rating, distribution percentages, and fit consensus', () => {
    const breakdown = calculateRatingBreakdown(sampleReviews);
    // (5 + 4 + 5) / 3 = 4.666 -> 4.7
    assert.equal(breakdown.averageRating, 4.7);
    assert.equal(breakdown.totalReviews, 3);
    assert.equal(breakdown.distribution[5].count, 2);
    assert.equal(breakdown.distribution[4].count, 1);
    assert.equal(breakdown.distribution[3].count, 0);
    assert.equal(breakdown.fitSummary.trueToSize, 2);
    assert.equal(breakdown.fitSummary.consensus, 'True to Size');
  });

  it('handles empty review array gracefully', () => {
    const emptyBreakdown = calculateRatingBreakdown([]);
    assert.equal(emptyBreakdown.averageRating, 0);
    assert.equal(emptyBreakdown.totalReviews, 0);
    assert.equal(emptyBreakdown.distribution[5].count, 0);
  });
});

describe('Review filtering and sorting', () => {
  it('filters by star rating', () => {
    const fiveStarsOnly = filterAndSortReviews(sampleReviews, 5, 'newest');
    assert.equal(fiveStarsOnly.length, 2);
    assert.ok(fiveStarsOnly.every((r) => r.rating === 5));
  });

  it('sorts by helpful count descending', () => {
    const byHelpful = filterAndSortReviews(sampleReviews, null, 'helpful');
    assert.equal(byHelpful[0].id, 'r1'); // helpfulCount: 10
    assert.equal(byHelpful[1].id, 'r3'); // helpfulCount: 5
    assert.equal(byHelpful[2].id, 'r2'); // helpfulCount: 2
  });

  it('sorts by newest descending', () => {
    const byNewest = filterAndSortReviews(sampleReviews, null, 'newest');
    assert.equal(byNewest[0].id, 'r3'); // Nov 1
    assert.equal(byNewest[1].id, 'r2'); // Oct 15
    assert.equal(byNewest[2].id, 'r1'); // Oct 1
  });
});

describe('Review submission validation', () => {
  it('rejects short author name or missing rating', () => {
    const res1 = validateReviewSubmission({
      authorName: 'A',
      rating: 5,
      title: 'Valid title',
      comment: 'Valid comment with enough characters',
    });
    assert.equal(res1.valid, false);

    const res2 = validateReviewSubmission({
      authorName: 'Alice',
      rating: 0,
      title: 'Valid title',
      comment: 'Valid comment with enough characters',
    });
    assert.equal(res2.valid, false);
  });

  it('accepts valid review payload', () => {
    const res = validateReviewSubmission({
      authorName: 'Jordan Smith',
      rating: 5,
      title: 'Incredible texture and quality',
      comment: 'Feels amazing, beautifully packaged, and looks sharp.',
    });
    assert.equal(res.valid, true);
  });
});
