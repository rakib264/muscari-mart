'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductCardRegular from '@/components/ui/product-card-regular';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Package, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating?: number;
  totalReviews?: number;
  quantity?: number;
}

interface EventProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage?: string;
  averageRating?: number;
  totalReviews?: number;
  quantity?: number;
}

interface EventPreviewProps {
  event: {
    _id: string;
    title: string;
    subtitle?: string;
    bannerImage?: string;
    discountText: string;
    layoutType?: 'horizontal' | 'vertical';
    cta?: {
      label: string;
      url: string;
      openInNewTab: boolean;
    };
    startDate: string;
    endDate: string;
    products: EventProduct[];
    isActive: boolean;
    status: 'active' | 'upcoming' | 'expired' | 'inactive';
  };
  showProducts?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function EventPreview({
  event,
  showProducts = true,
  className = ""
}: EventPreviewProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetDate = event.status === 'upcoming' ?
        new Date(event.startDate).getTime() :
        new Date(event.endDate).getTime();

      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event.startDate, event.endDate, event.status, mounted]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const getCountdownLabel = () => {
    switch (event.status) {
      case 'upcoming':
        return 'Starts in';
      case 'active':
        return 'Ends in';
      case 'expired':
        return 'Event ended';
      case 'inactive':
        return 'Event inactive';
      default:
        return 'Event ended';
    }
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isCountdownActive = event.status === 'active' || event.status === 'upcoming';
  const layoutType = event.layoutType || 'horizontal';

  // Render CTA Button
  const renderCTA = (className: string = '') => {
    if (!event.cta || !event.cta.label || !event.cta.url) return null;

    const CTAComponent = (
      <Button
        asChild
        size="lg"
        className={`bg-white hover:bg-white/90 text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      >
        {event.cta.openInNewTab ? (
          <a href={event.cta.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            {event.cta.label}
            <ArrowRight size={18} />
          </a>
        ) : (
          <Link href={event.cta.url} className="flex items-center gap-2">
            {event.cta.label}
            <ArrowRight size={18} />
          </Link>
        )}
      </Button>
    );

    return CTAComponent;
  };

  // Render Countdown Timer
  const renderCountdown = (className: string = '') => {
    if (!isCountdownActive) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center ${className}`}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Clock size={20} />
          <span className="text-lg font-medium">{getCountdownLabel()}</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Min' },
            { value: timeLeft.seconds, label: 'Sec' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/20 rounded-lg p-3 mb-1">
                <span className="text-2xl font-bold">
                  {String(item.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-white/80">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Horizontal Layout
  if (layoutType === 'horizontal') {
    return (
      <div className={`w-full ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-12"
        >
          {/* Banner Image */}
          {event.bannerImage && (
            <div className="absolute inset-0">
              <Image
                src={event.bannerImage}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 p-6 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className={`mb-4 ${getStatusColor()} bg-white/90 text-sm font-medium`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>

                {/* Title and Subtitle */}
                <motion.h1
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {event.title}
                </motion.h1>

                {event.subtitle && (
                  <motion.p
                    className="text-lg md:text-xl lg:text-2xl text-white/90 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {event.subtitle}
                  </motion.p>
                )}

                {/* Discount Text */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 mb-6"
                >
                  <Tag size={18} />
                  <span className="text-base md:text-lg font-semibold">{event.discountText}</span>
                </motion.div>

                {/* Product Count */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-2 text-white/80 mb-6"
                >
                  <Package size={18} />
                  <span>{event.products.length} products in this event</span>
                </motion.div>

                {/* CTA Button */}
                {event.cta && renderCTA('mt-4')}
              </div>

              {/* Countdown Timer */}
              {renderCountdown('min-w-[280px]')}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {showProducts && event.products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Event Products</h2>
              <Badge variant="outline" className="text-sm">
                {event.products.length} products
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.products.map((product) => (
                <ProductCardRegular
                  key={product._id}
                  product={{
                    ...product,
                    thumbnailImage: product.thumbnailImage || '/placeholder-product.jpg'
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Vertical Layout (Grid Blended)
  return (
    <div className={`w-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Grid Layout: Banner + Products */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Banner Card - Takes 2 columns and 2 rows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl min-h-[400px]"
          >
            {/* Banner Image */}
            {event.bannerImage && (
              <div className="absolute inset-0">
                <Image
                  src={event.bannerImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}

            {/* Banner Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className={`mb-3 ${getStatusColor()} bg-white/90 text-xs font-medium`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {event.title}
                </h2>

                {event.subtitle && (
                  <p className="text-sm md:text-base text-white/90 mb-3">
                    {event.subtitle}
                  </p>
                )}

                {/* Discount Text */}
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                  <Tag size={16} />
                  <span className="text-sm md:text-base font-semibold">{event.discountText}</span>
                </div>

                {/* Product Count */}
                <div className="flex items-center space-x-2 text-white/80 text-sm mb-4">
                  <Package size={16} />
                  <span>{event.products.length} products</span>
                </div>
              </div>

              {/* Countdown - Compact Version */}
              {isCountdownActive && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock size={16} />
                    <span className="text-xs md:text-sm font-medium">{getCountdownLabel()}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: timeLeft.days, label: 'Days' },
                      { value: timeLeft.hours, label: 'Hrs' },
                      { value: timeLeft.minutes, label: 'Min' },
                      { value: timeLeft.seconds, label: 'Sec' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-white/20 rounded-lg p-2 mb-1">
                          <span className="text-lg font-bold">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/80">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {event.cta && renderCTA('')}
            </div>
          </motion.div>

          {/* Products - Fill remaining grid cells */}
          {showProducts && event.products.slice(0, 6).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <ProductCardRegular
                product={{
                  ...product,
                  thumbnailImage: product.thumbnailImage || '/placeholder-product.jpg'
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Show More Products if needed */}
        {showProducts && event.products.length > 6 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {event.products.slice(6).map((product) => (
              <ProductCardRegular
                key={product._id}
                product={{
                  ...product,
                  thumbnailImage: product.thumbnailImage || '/placeholder-product.jpg'
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
