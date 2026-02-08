'use client';

import AddToCartButton from '@/components/ui/add-to-cart-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { formatBDTCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductDetailsModal from './product-details-modal';

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

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'best-selling' | 'new-arrival' | 'limited-edition' | 'standard';
  showQuickActions?: boolean;
  showQuickView?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  variant = 'default',
  showQuickActions = true,
  showQuickView = true,
  className = ''
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: any) => state.wishlist?.items || []);
  const cartItems = useSelector((state: any) => state.cart?.items || []);

  const isInWishlist = wishlistItems.some((item: any) => item.id === product._id);
  const isInCart = cartItems.some((item: any) => item.id === product._id);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isInWishlist) {
        dispatch(removeFromWishlist(product._id));
      } else {
        dispatch(addToWishlist({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.thumbnailImage,
          comparePrice: product.comparePrice,
          inStock: (product?.quantity ?? 0) > 0
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate discount percentage only if comparePrice exists and is greater than price
  const getDiscountPercentage = (): number | null => {
    if (!product.comparePrice || product.comparePrice <= product.price) {
      return null;
    }
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const discountPercentage = getDiscountPercentage();

  // Get variant-specific styles - simplified for minimal design
  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          cardClass: 'border border-primary-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'best-selling':
        return {
          cardClass: 'border border-orange-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'new-arrival':
        return {
          cardClass: 'border border-green-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'limited-edition':
        return {
          cardClass: 'border border-purple-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'standard':
        return {
          cardClass: 'border border-gray-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      default:
        return {
          cardClass: 'border border-gray-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
    }
  };

  const { cardClass } = getVariantStyles();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group relative h-full ${className}`}
    >
      <Card className={`${cardClass} overflow-hidden h-full flex flex-col`}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Container - Responsive Height with proper spacing */}
          <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 xl:h-60 overflow-hidden bg-white p-2">
            <Link href={`/products/${product.slug}`} className="block h-full">
              <Image
                src={product.thumbnailImage}
                alt={product.name}
                fill
                className="object-contain transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </Link>

            {/* Discount Badge - Only show if there's a discount */}
            {discountPercentage && discountPercentage > 0 && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 font-bold shadow-sm">
                -{discountPercentage}%
              </Badge>
            )}

            {/* Wishlist Button - Top Left */}
            {showQuickActions && (
              <div className="absolute top-2 left-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm rounded-full"
                  onClick={handleWishlistToggle}
                  disabled={isLoading}
                >
                  <Heart
                    className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </Button>
              </div>
            )}

            {/* Quick View Button - Center overlay on hover */}
            {showQuickView && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/95 hover:bg-white shadow-lg rounded-md px-4 py-2 typography-button-sm text-hierarchy-title"
                  onClick={handleQuickView}
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Quick View
                </Button>
              </div>
            )}

          </div>

          {/* Product Info - Responsive Padding */}
          <div className="p-2 xs:p-3 sm:p-4 flex-1 flex flex-col">
            {/* Category - Responsive Text */}
            {product.category && (
              <p className="typography-caption text-hierarchy-caption mb-1 xs:mb-1.5 sm:mb-2 uppercase tracking-wide line-clamp-1">
                {product.category.name}
              </p>
            )}

            {/* Product Name - Responsive Text */}
            <Link href={`/products/${product.slug}`} className="block flex-1">
              <h3 className="typography-product-name text-hierarchy-title mb-2 xs:mb-2 sm:mb-3 line-clamp-2 hover:text-brand-primary transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.averageRating !== undefined && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < Math.floor(product.averageRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="typography-caption text-hierarchy-caption">
                  {product.averageRating?.toFixed(1) || '0.0'} ({product.totalReviews || 0})
                </span>
              </div>
            )}

            {/* Price and Add Button - Responsive Layout */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="typography-product-price">
                  {formatBDTCurrency(product.price)}
                </span>
                {product.comparePrice !==0 && product.comparePrice !== undefined && product.comparePrice && product.comparePrice > product.price && (
                  <span className="typography-caption text-hierarchy-caption line-through">
                    {formatBDTCurrency(product.comparePrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <AddToCartButton
                productId={product._id}
                productName={product.name}
                productPrice={product.price}
                productImage={product.thumbnailImage}
                productSlug={product.slug}
                quantity={1}
                variant="compact"
                size="sm"
                availableStock={product.quantity}
                isOutOfStock={product.quantity === 0}
                text="Add"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {showQuickView && (
        <ProductDetailsModal
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          productSlug={product.slug}
          product={{
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice,
            thumbnailImage: product.thumbnailImage,
            images: product.images,
            quantity: product.quantity || 0,
            averageRating: product.averageRating,
            totalReviews: product.totalReviews,
            category: product.category,
            shortDescription: product.shortDescription,
            variants: product.variants,
            productSize: product.productSize,
          }}
        />
      )}
    </motion.div>
  );
}
