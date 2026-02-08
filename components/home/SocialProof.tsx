'use client';

import { Display } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CustomerFeedback {
  _id: string;
  platform: string;
  platformName: string;
  customer: {
    name: string;
    avatar: string;
    location: string;
    verified: boolean;
  };
  message: string;
  rating: number;
  productImage?: string;
  timeAgo?: string;
}

// Helper function to get platform styling
const getPlatformStyling = (platform: string) => {
  const platformMap: Record<string, { color: string; icon: string }> = {
    facebook: { color: 'bg-blue-600', icon: '📘' },
    messenger: { color: 'bg-blue-500', icon: '💬' },
    instagram: { color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '📷' },
    whatsapp: { color: 'bg-green-500', icon: '💬' },
    email: { color: 'bg-gray-600', icon: '✉️' },
  };
  return platformMap[platform] || { color: 'bg-gray-600', icon: '💬' };
};

export default function SocialProof() {
  const [socialReviews, setSocialReviews] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/customer-feedback?limit=8');
      const data = await response.json();

      if (response.ok && data.feedbacks) {
        setSocialReviews(data.feedbacks);
      }
    } catch (error) {
      console.error('Error fetching customer feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 via-orange-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-orange-100 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 w-96 bg-orange-100 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no feedbacks, don't show the section
  if (!loading && socialReviews.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 via-orange-50/50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Display size="lg" weight="bold" className="text-gray-900 mb-4">
            Customer Reviews
          </Display>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real feedback from real customers across Bangladesh
          </p>
        </motion.div>

        {/* Reviews Grid - 2 columns on mobile, 4 columns on md+ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {socialReviews.slice(0, 8).map((review, index) => {
            const platformStyling = getPlatformStyling(review.platform);
            return (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col"
            >
              {/* Platform Badge */}
              <div className={`${platformStyling.color} px-3 py-2 flex items-center gap-2`}>
                <span className="text-base">{platformStyling.icon}</span>
                <span className="text-white font-semibold text-xs">{review.platformName}</span>
              </div>

              {/* Customer & Review */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={review.customer.avatar}
                      alt={review.customer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer.name)}&background=6366f1&color=fff&size=100`;
                      }}
                    />
                    {review.customer.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{review.customer.name}</p>
                    </div>
                    <div className="flex items-center gap-1 mb-1.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-current" size={13} />
                      ))}
                      <span className="text-xs font-semibold text-gray-600 ml-0.5">{review.rating}.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>📍</span>
                      <span className="truncate">{review.customer.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 flex-1 mb-3">
                  {review.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-gray-400 text-xs">{review.timeAgo || 'Recent'}</p>
                  <span className="text-xs text-gray-400">{review.platformName}</span>
                </div>
              </div>

            </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badges - Minimal & Elegant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 pt-8 border-t border-orange-100"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {[
              { icon: "🚚", text: "Fastest Delivery" },
              { icon: "💬", text: "24/7 Support" },
              { icon: "↩️", text: "Easy Returns" },
              { icon: "🔒", text: "Secure Payment" }
            ].map((badge, index) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-semibold">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
