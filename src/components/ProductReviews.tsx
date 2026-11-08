import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquarePlus,
  Filter,
  Check,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Review } from '../types/ecommerce';
import {
  calculateRatingBreakdown,
  filterAndSortReviews,
  ReviewSortOption,
  RatingBreakdown,
} from '../lib/review-utils';
import { useShop } from '../context/ShopContext';
import { Button } from './ui/button';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  onReviewSubmitted,
}) => {
  const { userProfile, submitProductReview, voteReviewHelpful, showToast } = useShop();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [breakdown, setBreakdown] = useState<RatingBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & sort
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<ReviewSortOption>('newest');

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formAuthorName, setFormAuthorName] = useState(userProfile.fullName || '');
  const [formAuthorEmail, setFormAuthorEmail] = useState(userProfile.email || '');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formFit, setFormFit] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Voted review IDs to prevent multi-voting in session
  const [votedIds, setVotedIds] = useState<string[]>([]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
          setBreakdown(data.breakdown || calculateRatingBreakdown(data.reviews || []));
        }
      }
    } catch (err) {
      console.error('Failed to load reviews for product:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Keep author prefilled from profile if user didn't type yet
  useEffect(() => {
    if (!formAuthorName && userProfile.fullName) {
      setFormAuthorName(userProfile.fullName);
    }
    if (!formAuthorEmail && userProfile.email) {
      setFormAuthorEmail(userProfile.email);
    }
  }, [userProfile]);

  const handleHelpfulClick = async (reviewId: string) => {
    if (votedIds.includes(reviewId)) {
      showToast('You have already marked this review as helpful.');
      return;
    }
    const success = await voteReviewHelpful(reviewId);
    if (success) {
      setVotedIds((prev) => [...prev, reviewId]);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      );
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formAuthorName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Please enter a review headline.');
      return;
    }
    if (formComment.trim().length < 10) {
      setFormError('Please write at least 10 characters describing your experience.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitProductReview(productId, {
        authorName: formAuthorName.trim(),
        authorEmail: formAuthorEmail.trim() || undefined,
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
        fitFeedback: formFit,
      });

      if (result.success && result.review) {
        setReviews((prev) => [result.review!, ...prev]);
        setIsFormOpen(false);
        setFormTitle('');
        setFormComment('');
        await fetchReviews();
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        setFormError(result.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedReviews = filterAndSortReviews(reviews, starFilter, sortBy);
  const ratingLabels: Record<number, string> = {
    5: 'Exceptional (5/5)',
    4: 'Great quality (4/5)',
    3: 'Average (3/5)',
    2: 'Needs improvement (2/5)',
    1: 'Disappointing (1/5)',
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Rating Overview & Summary Header */}
      <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Score */}
          <div className="md:col-span-4 text-center md:text-left md:border-r md:border-stone-200/80 md:pr-4">
            <div className="text-4xl font-extrabold text-stone-900 tracking-tight">
              {breakdown ? breakdown.averageRating.toFixed(1) : '5.0'}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 my-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(breakdown?.averageRating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Based on {breakdown?.totalReviews || reviews.length} verified ratings
            </p>
            {breakdown?.fitSummary && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-200/60 text-stone-700 text-[11px] font-semibold">
                <Sparkles className="h-3 w-3 text-rose-500" />
                <span>Fit: {breakdown.fitSummary.consensus}</span>
              </div>
            )}
          </div>

          {/* Breakdown Bars */}
          <div className="md:col-span-8 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const starKey = star as 1 | 2 | 3 | 4 | 5;
              const data = breakdown?.distribution[starKey] || { count: 0, percentage: 0 };
              const isSelected = starFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarFilter(isSelected ? null : star)}
                  className={`w-full flex items-center gap-2.5 text-xs py-0.5 px-2 rounded-lg transition-colors text-left cursor-pointer ${
                    isSelected ? 'bg-amber-100/70 font-semibold text-stone-900' : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <span className="w-12 text-[11px] shrink-0 font-medium">{star} Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] text-stone-400 shrink-0">
                    {data.count} ({data.percentage}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action button to open review form */}
        <div className="mt-5 pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-600">
            Have you worn this piece? Share your feedback with our garment community.
          </p>
          <Button
            size="sm"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="rounded-full text-xs font-semibold px-4 py-2 flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white cursor-pointer shadow-xs"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{isFormOpen ? 'Close Form' : 'Write a Review'}</span>
          </Button>
        </div>
      </div>

      {/* Review Submission Form Drawer / Card */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Write a Review for {productName}</h4>
              <p className="text-xs text-stone-500">Your genuine experience helps others find the right fit.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-stone-400 hover:text-stone-700 text-xs font-medium"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          {/* Interactive Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Overall Rating: <span className="text-amber-600 font-bold">{ratingLabels[hoverRating || formRating]}</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setFormRating(star)}
                  className="p-1 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-6 w-6 transition-transform ${
                      star <= (hoverRating || formRating)
                        ? 'fill-amber-400 text-amber-400 scale-110'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Fit Feedback */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              How does the garment fit?
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Runs Small', 'True to Size', 'Runs Large'] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFormFit(fit)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    formFit === fit
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Author Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formAuthorName}
                onChange={(e) => setFormAuthorName(e.target.value)}
                placeholder="e.g. Elena R."
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formAuthorEmail}
                onChange={(e) => setFormAuthorEmail(e.target.value)}
                placeholder="Your email (kept private)"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Title / Headline */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Headline / Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Luxurious fabric and flawless fit"
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          {/* Written Feedback */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-stone-700">
                Detailed Feedback *
              </label>
              <span className="text-[10px] text-stone-400">
                {formComment.length} characters (min 10)
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Describe the fabric texture, how it wears throughout the day, drape, and care tips..."
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50 resize-y"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="rounded-full text-xs font-semibold px-5 bg-stone-900 hover:bg-black text-white"
            >
              {isSubmitting ? 'Publishing...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3 text-xs">
        {/* Star filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-stone-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setStarFilter(null)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
              starFilter === null
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = breakdown?.distribution[s as 1 | 2 | 3 | 4 | 5]?.count || 0;
            if (count === 0 && starFilter !== s) return null;

            return (
              <button
                key={s}
                onClick={() => setStarFilter(starFilter === s ? null : s)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  starFilter === s
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{s}★</span>
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="review-sort" className="text-stone-500 text-[11px]">
            Sort:
          </label>
          <div className="relative">
            <select
              id="review-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
              className="appearance-none bg-stone-100 text-stone-800 text-[11px] font-semibold py-1 pl-2.5 pr-6 rounded-lg border-0 focus:ring-1 focus:ring-stone-400 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <ChevronDown className="h-3 w-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-stone-400">Loading reviews...</div>
        ) : displayedReviews.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
            <p className="text-xs font-semibold text-stone-700">No reviews found matching your filter</p>
            <p className="text-[11px] text-stone-400">
              {starFilter ? 'Try clearing the star filter to see all reviews.' : 'Be the first to share your thoughts on this garment.'}
            </p>
            {starFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStarFilter(null)}
                className="mt-2 text-xs rounded-full"
              >
                Clear Filter
              </Button>
            )}
          </div>
        ) : (
          displayedReviews.map((rev) => {
            const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const hasVoted = votedIds.includes(rev.id);

            return (
              <div
                key={rev.id}
                className="p-4 rounded-2xl border border-stone-100 bg-white hover:border-stone-200 transition-colors space-y-2.5"
              >
                {/* Review Header: User info, verified badge, rating & date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center uppercase">
                      {rev.authorName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-stone-900">{rev.authorName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">{dateStr}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Fit tag if present */}
                {rev.fitFeedback && (
                  <div className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
                    Fit: <span className="text-stone-900 font-semibold">{rev.fitFeedback}</span>
                  </div>
                )}

                {/* Title & Comment */}
                <div>
                  <h5 className="font-bold text-xs text-stone-900">{rev.title}</h5>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rev.comment}</p>
                </div>

                {/* Helpful count button */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400">
                  <button
                    onClick={() => handleHelpfulClick(rev.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      hasVoted
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                    }`}
                    title="Mark this review as helpful"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{hasVoted ? 'Helpful' : 'Helpful'}</span>
                    <span className="font-semibold">({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
