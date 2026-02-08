'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Advertisement {
  _id: string;
  position: number;
  title: string;
  discountText?: string;
  bannerImage: string;
  cta?: {
    label: string;
    url: string;
  };
}

export default function VerticalAdvertisements() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/advertisements?type=vertical');
      const data = await response.json();

      if (data.success) {
        setAds(data.advertisements);
      }
    } catch (error) {
      console.error('Error fetching vertical ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative h-[420px] sm:h-[450px] md:h-[480px] rounded-2xl overflow-hidden animate-pulse bg-gray-100"
              />
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
    <section className="py-10 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {ads.map((ad, index) => (
            <motion.div
              key={ad._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            >
              <Link href={ad.cta?.url || '#'} className="block group">
                <div className="relative h-[420px] sm:h-[450px] md:h-[480px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
                  {/* Full Height Background Image */}
                  <Image
                    src={ad.bannerImage}
                    alt={ad.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                  />

                  {/* Gradient Overlay - Top portion for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-transparent" style={{ height: '55%' }} />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col p-6 md:p-8">
                    {/* Top Content */}
                    <div className="flex-shrink-0">
                      {/* Discount Badge */}
                      {ad.discountText && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 + index * 0.1 }}
                          className="mb-2"
                        >
                          <span
                            className="inline-block text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase"
                            style={{
                              color: '#D4A024',
                              textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {ad.discountText}
                          </span>
                        </motion.div>
                      )}

                      {/* Title */}
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 + index * 0.1 }}
                        className="text-xl sm:text-2xl md:text-[1.75rem] font-bold text-gray-900 leading-tight mb-4"
                      >
                        {ad.title}
                      </motion.h3>

                      {/* CTA Button */}
                      {ad.cta && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.35 + index * 0.1 }}
                        >
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg transition-all duration-300 group-hover:bg-gray-800 group-hover:gap-3 group-hover:shadow-lg group-hover:pr-4">
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

                  {/* Bottom Gradient for visual depth */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
