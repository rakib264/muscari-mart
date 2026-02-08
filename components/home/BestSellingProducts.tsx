'use client';

import { Button } from '@/components/ui/button';
import ProductCardDiscounted from '@/components/ui/product-card-discounted';
import ProductCardRegular from '@/components/ui/product-card-regular';
import { Display } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating?: number;
  totalReviews?: number;
  totalSales?: number;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isLimitedEdition?: boolean;
  quantity?: number;
  category?: {
    name: string;
    slug: string;
  };
  tags?: string[];
  shortDescription?: string;
  images?: string[];
  variants?: Array<{
    name: string;
    value: string;
    price?: number;
    sku?: string;
    quantity?: number;
    image?: string;
  }>;
  productSize?: string[];
}

interface BestSellingProductsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showPagination?: boolean;
  className?: string;
}

export default function BestSellingProducts({
  title = "Best Selling Products",
  subtitle = "Discover our most popular fashion items loved by customers worldwide",
  limit = 8,
  showPagination = false,
  className = ""
}: BestSellingProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=${limit}&sortBy=totalSales&sortOrder=desc&active=true`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching best selling products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`py-8 lg:py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-96 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white/60 h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 lg:py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-red-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/40 to-orange-200/40 rounded-full blur-3xl"></div>

        {/* Floating elements */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => {
            // Use fixed positions to avoid hydration mismatch
            const positions = [
              { left: '10%', top: '20%' }, { left: '25%', top: '40%' }, { left: '40%', top: '60%' },
              { left: '55%', top: '80%' }, { left: '70%', top: '30%' }, { left: '85%', top: '50%' },
              { left: '15%', top: '70%' }, { left: '30%', top: '10%' }, { left: '45%', top: '90%' },
              { left: '60%', top: '15%' }, { left: '75%', top: '75%' }, { left: '90%', top: '35%' }
            ];
            const position = positions[i] || { left: '50%', top: '50%' };

            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-300/30 rounded-full"
                style={position}
                animate={{
                  y: [0, -25, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: (i % 4) * 0.5,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-row items-center justify-between mb-12"
        >
          {/* Left side - Title and Subtitle */}
          <div className="text-center lg:text-left">
            <Display size="lg" weight="bold" className="text-gray-900">
              {title}
            </Display>
          </div>

          {/* Right side - Best Selling Button */}
          <div className="flex justify-end flex-shrink-0">
            <Link href="/products/best-selling">
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

        {/* Products Grid - Responsive Layout */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {products.map((product) => {
            // Determine if product has a discount
            const hasDiscount =
              product.comparePrice &&
              product.comparePrice > 0 &&
              product.comparePrice > product.price;

            // Use discounted card if product has discount, otherwise use regular card
            return hasDiscount ? (
              <ProductCardDiscounted
                key={product._id}
                product={product}
                className="h-full"
              />
            ) : (
              <ProductCardRegular
              key={product._id}
              product={product}
              className="h-full"
            />
            );
          })}
        </motion.div>

        {/* No Products */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <TrendingUp size={80} className="mx-auto text-gray-300 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Best Selling Products Found</h3>
            <p className="text-gray-500 text-lg">Check back later for our most popular items.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
