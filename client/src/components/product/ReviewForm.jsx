import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { submitProductReview } from '../../api/products';
import useFormValidation from '../../hooks/useFormValidation';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const { isAuthenticated, user } = useCustomerAuthStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const {
    values,
    errors,
    touched,
    validateForm,
    getFieldProps,
    resetForm
  } = useFormValidation(
    { title: '', body: '' },
    (vals) => {
      const errs = {};
      if (!vals.body || !vals.body.trim()) {
        errs.body = 'Review comment is required.';
      } else if (vals.body.trim().length < 10) {
        errs.body = 'Review details must be at least 10 characters long.';
      }
      return errs;
    }
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-white/40 border border-black/5 p-6 rounded-2xl text-center space-y-3">
        <p className="text-xs font-futura text-ivory/70">
          Only verified shoppers can leave a review. Please sign in to share your experience.
        </p>
        <Link
          to="/auth"
          className="inline-block px-6 py-2 bg-ivory text-white text-xs font-futura font-bold uppercase tracking-widest rounded-xl hover:bg-gold hover:text-noir transition-colors duration-300 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Sign In to Review
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const newReview = await submitProductReview(productId, {
        rating,
        title: values.title.trim() || undefined,
        body: values.body.trim()
      });

      // Construct fallback user info if backend returns incomplete include
      const fullReview = {
        ...newReview,
        User: newReview.User || {
          full_name: user?.full_name || 'Shopper',
          first_name: user?.full_name ? user.full_name.split(' ')[0] : 'Shopper',
          last_name: user?.full_name ? user.full_name.split(' ').slice(1).join(' ') : ''
        }
      };

      setSuccessMsg('Thank you! Your review has been submitted successfully.');
      resetForm();
      setRating(5);

      if (onReviewSubmitted) {
        onReviewSubmitted(fullReview);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bodyProps = getFieldProps('body', 'review-body');
  const titleProps = getFieldProps('title', 'review-title');

  return (
    <div className="bg-white/40 border border-black/5 p-6 md:p-8 rounded-2xl shadow-sm">
      <h3 className="text-sm font-futura uppercase tracking-widest text-gold-light font-bold mb-4">Write a Review</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-futura">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-xs font-futura">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Star Rating Picker */}
        <div>
          <span id="star-rating-label" className="block text-[10px] font-futura uppercase tracking-wider text-ivory/70 font-bold mb-2">
            Overall Rating *
          </span>
          <div className="flex gap-1 items-center" role="group" aria-labelledby="star-rating-label">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                className="text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
              >
                <span className={(hoverRating || rating) >= star ? 'text-gold' : 'text-ivory/20'}>
                  ★
                </span>
              </button>
            ))}
            <span className="ml-2 text-xs font-futura text-ivory/70 font-medium">
              {hoverRating || rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Title Input */}
        <div className="premium-input-group">
          <input
            type="text"
            placeholder=" "
            {...titleProps}
            className="premium-input focus:border-gold"
          />
          <label htmlFor="review-title" className="premium-label">Headline / Summary (Optional)</label>
        </div>

        {/* Body Textarea */}
        <div className="premium-input-group">
          <textarea
            rows={4}
            placeholder=" "
            {...bodyProps}
            className={`premium-input resize-none ${
              errors.body && touched.body ? 'border-red-500 focus:border-red-500' : 'focus:border-gold'
            }`}
          />
          <label htmlFor="review-body" className="premium-label">Review Details *</label>
          {errors.body && touched.body && (
            <p id="review-body-error" className="text-[11px] font-futura text-red-500 mt-1.5">
              {errors.body}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-ivory text-white font-futura font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gold hover:text-noir transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {loading ? 'Submitting Review...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
