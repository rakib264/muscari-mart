'use client';

import { Button } from '@/components/ui/button';
import ProductCardDiscounted from '@/components/ui/product-card-discounted';
import ProductCardRegular from '@/components/ui/product-card-regular';
import { Display, Text } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
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

interface AllProductsListingProps {
  title?: string;
  subtitle?: string;
  initialLimit?: number;
  loadMoreLimit?: number;
  className?: string;
}

export default function AllProductsListing({
  title = 'All Products',
  subtitle = 'Discover our complete collection of premium products',
  initialLimit = 12,
  loadMoreLimit = 12,
  className = '',
}: AllProductsListingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
    hasMore: false,
  });

  useEffect(() => {
    fetchProducts(1, initialLimit);
  }, []);

  const fetchProducts = async (page: number, limit: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/products/list?page=${page}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;
    fetchProducts(nextPage, loadMoreLimit, true);
  };

  if (loading) {
    return (
      <section className={`py-8 lg:py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-96 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
            {[...Array(initialLimit)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white h-80 rounded-2xl border border-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={`py-8 lg:py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Display size="md" weight="bold" className="mb-4">
              {title}
            </Display>
            <Text size="lg" className="text-gray-600">
              No products found at the moment.
            </Text>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 lg:py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${className}`}>
      <div className="container mx-auto px-4">
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
            <Display size="lg" weight="bold" color="primary" className="text-gray-900">
              {title}
            </Display>
          </div>


          {/* Right side - All Products Button */}
          <div className="flex justify-end flex-shrink-0">
            <Link href="/products">
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

          {/* Products Grid - Responsive Layout
              - Mobile (default): 2 columns
              - Medium (md): 3-4 columns
              - Large (lg): 5 columns
              - Extra Large (2xl): 6 columns
          */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 mb-12"
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

        {/* Load More / See All Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          {pagination.hasMore ? (
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              size="lg"
                    className="bg-secondary hover:bg-secondary/80 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More ({pagination.total - products.length} remaining)
                </>
              )}
            </Button>
          ) : (
            <Link href="/products">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                    className="bg-secondary hover:bg-secondary/80 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  See All Products
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

