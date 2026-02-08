'use client';

import { Button } from '@/components/ui/button';
import { Caption, Display, Text } from '@/components/ui/typography';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  productCount?: number;
  children?: Category[];
}

export default function ModernCategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollButtons = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    };

    checkScrollButtons();
    container.addEventListener('scroll', checkScrollButtons);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      const categoriesArray = data.categories || [];

      // Build category tree
      const rootCategories = categoriesArray.filter((cat: Category) => !cat.parent);
      const categoriesWithChildren = rootCategories.map((parent: Category) => {
        const children = categoriesArray.filter((cat: Category) =>
          cat.parent && cat.parent._id === parent._id
        );
        return {
          ...parent,
          children: children.length > 0 ? children : undefined
        };
      });

      setCategories(categoriesWithChildren);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 280; // Width of category card + gap
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <section className="py-12 lg:py-16 bg-gradient-to-b from-beige-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mb-2"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-64 rounded"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 h-32 w-64 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no categories
  if (!categories || categories.length === 0) {
    return null;
  }

  // Flatten all categories for the horizontal layout
  const allCategories = categories.flatMap((category) => {
    const items = [category];
    if (category.children && category.children.length > 0) {
      items.push(...category.children);
    }
    return items;
  });

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-beige-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8 lg:mb-10"
        >
          {/* Left side - Title */}
          <div className="text-left">
            <Display size="lg" weight="bold" className="text-gray-700 mb-2">
              Shop by Categories
            </Display>
            <Text size="lg" color="muted" className="text-gray-600">
              Discover our wide range of premium organic products
            </Text>
          </div>

          {/* Right side - All Categories Button */}
          <div className="flex justify-end flex-shrink-0">
            <Link href="/categories">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-black hover:text-indigo-600 px-3 py-2 lg:px-4 bg-transparent hover:bg-transparent shadow-none hover:shadow-none font-semibold transition-all duration-300 relative"
                >
                  <span className="inline">View All</span>
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 ml-1 lg:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                {/* Custom underline */}
                <div className="absolute bottom-1 left-3 right-3 lg:left-4 lg:right-4 h-0.5 bg-black transform scale-x-100 group-hover:scale-x-110 transition-transform duration-300 origin-left"></div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Categories Container with Navigation */}
        <div className="relative">
          {/* Left Navigation Button */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl border border-gray-200 rounded-full p-3 transition-all duration-300 group hidden lg:flex items-center justify-center"
                style={{ transform: 'translateY(-50%) translateX(-50%)' }}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right Navigation Button */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl border border-gray-200 rounded-full p-3 transition-all duration-300 group hidden lg:flex items-center justify-center"
                style={{ transform: 'translateY(-50%) translateX(50%)' }}
              >
                <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrollable Categories */}
          <motion.div
            ref={scrollContainerRef}
            className="flex gap-6 sm:gap-8 lg:gap-10 overflow-x-auto scrollbar-hide py-8 px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {allCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <motion.div
                    className="group flex flex-col items-center cursor-pointer py-3"
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Category Image or Avatar */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 mb-4 sm:mb-5">
                      {category.image ? (
                        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 ring-2 ring-transparent group-hover:ring-primary-300">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 ring-2 ring-transparent group-hover:ring-primary-300">
                          <span className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl">
                            {getInitials(category.name)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="text-center max-w-[120px] sm:max-w-[140px] lg:max-w-[160px]">
                      <Text
                        size="sm"
                        weight="semibold"
                        className="text-secondary-800 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 mb-1.5 text-center leading-tight"
                      >
                        {category.name}
                      </Text>

                      {category.productCount !== undefined && (
                        <Caption
                          weight="medium"
                          className="text-secondary-500 group-hover:text-primary-500 transition-colors duration-300 text-xs sm:text-sm"
                        >
                          {category.productCount} items
                        </Caption>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
