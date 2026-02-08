'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Advertisement {
  _id: string;
  position: number;
  badgeTitle?: string;
  title: string;
  discountText?: string;
  bannerImage: string;
  cta?: {
    label: string;
    url: string;
  };
}

export default function HorizontalAdvertisements() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/advertisements?type=horizontal');
      const data = await response.json();

      if (data.success) {
        setAds(data.advertisements);
      }
    } catch (error) {
      console.error('Error fetching horizontal ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-[280px] sm:h-[320px] md:h-[300px] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {ads.map((ad, index) => (
            <motion.div
              key={ad._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={ad.cta?.url || '#'} className="block group">
                <div className="relative h-[280px] sm:h-[320px] md:h-[300px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
                  {/* Background Image */}
                  <Image
                    src={ad.bannerImage}
                    alt={ad.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index < 2}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-transparent" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="p-6 sm:p-7 md:p-8 max-w-[85%] sm:max-w-md">
                      {/* Badge */}
                      {ad.badgeTitle && (
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 + index * 0.1 }}
                          className="mb-2 sm:mb-3"
                        >
                          <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold rounded-full border border-white/30">
                            {ad.badgeTitle}
                          </span>
                        </motion.div>
                      )}

                      {/* Title */}
                      <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + index * 0.1 }}
                        className="text-xl sm:text-2xl md:text-[1.75rem] lg:text-3xl font-bold text-white mb-2 sm:mb-2.5 leading-tight"
                      >
                        {ad.title}
                      </motion.h2>

                      {/* Discount Text */}
                      {ad.discountText && (
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.35 + index * 0.1 }}
                          className="text-sm sm:text-base md:text-lg text-white/95 mb-4 sm:mb-5 font-medium"
                        >
                          {ad.discountText}
                        </motion.p>
                      )}

                      {/* CTA Button */}
                      {ad.cta && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.45 + index * 0.1 }}
                        >
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg shadow-lg transition-all duration-300 group-hover:bg-gray-100 group-hover:shadow-xl group-hover:gap-3">
                            <span>{ad.cta.label}</span>
                            <ArrowRight
                              size={16}
                              className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Bottom gradient for visual depth */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
