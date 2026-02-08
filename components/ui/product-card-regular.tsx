"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Caption, Text } from "@/components/ui/typography";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
} from "@/lib/store/slices/cartSlice";
import { formatBDTCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Maximize2, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductDetailsModal from "./product-details-modal";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating?: number;
  totalReviews?: number;
  quantity?: number;
  category?: {
    name: string;
    slug: string;
  };
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

interface ProductCardRegularProps {
  product: Product;
  className?: string;
}

export default function ProductCardRegular({
  product,
  className = "",
}: ProductCardRegularProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart?.items || []);

  // Find cart item
  const cartItem = cartItems.find((item: any) => item.id === product._id);
  const isInCart = !!cartItem;
  const itemQuantity = cartItem?.quantity || 0;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.thumbnailImage,
        quantity: 1,
        variant: "",
        maxQuantity: product.quantity || 999,
      }),
    );
  };

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartItem) {
      const newQuantity = Math.min(itemQuantity + 1, product.quantity || 999);
      dispatch(
        updateQuantity({
          id: product._id,
          variant: cartItem.variant,
          quantity: newQuantity,
        }),
      );
    }
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    // If quantity would go to 0, remove item from cart and let UI fall back to Add button
    if (itemQuantity <= 1) {
      dispatch(
        removeFromCart({
          id: product._id,
          variant: cartItem.variant,
          name: product.name,
        }),
      );
    } else {
      const newQuantity = Math.max(1, itemQuantity - 1);
      dispatch(
        updateQuantity({
          id: product._id,
          variant: cartItem.variant,
          quantity: newQuantity,
        }),
      );
    }
  };

  // Check stock status
  const isOutOfStock = !product.quantity || product.quantity <= 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`group relative h-full ${className}`}
      >
        <Card className="border-2 border-primary-100 hover:border-primary-300 overflow-hidden h-full flex flex-col bg-white rounded-2xl transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Image Container */}
            <div className="relative bg-gray-50 overflow-hidden">
              {/* Stock Badge */}
              {isOutOfStock && (
                <Badge className="absolute top-2 left-2 bg-red-100 text-red-600 border-none text-xs font-medium px-2 py-1 z-10">
                  Out of Stock
                </Badge>
              )}

              {/* Product Image - Smaller on mobile */}
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative w-full h-28 sm:h-36 md:h-40 lg:h-44 p-2 sm:p-3 md:p-4">
                  <Image
                    src={product.thumbnailImage || "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-contain transition-all duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
              </Link>

              {/* Quick View Button - Appears on hover (hidden on mobile) */}
              <div className="hidden sm:block absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white hover:bg-gray-50 text-gray-900 shadow-lg rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2"
                  onClick={handleQuickView}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Quick View
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
              {/* Product Name */}
              <Link
                href={`/products/${product.slug}`}
                className="block mb-1 sm:mb-2"
              >
                <Text
                  size="md"
                  weight="semibold"
                  color="primary"
                  className="line-clamp-2 leading-tight text-gray-700 hover:text-gray-900 transition-colors min-h-[2rem] sm:min-h-[2.5rem]"
                >
                  {product.name}
                </Text>
              </Link>

              {/* Rating */}
              <div className="hidden lg:flex items-center gap-1 mb-2 sm:mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs sm:text-sm ${
                        i < Math.floor(product.averageRating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <Caption weight="normal" color="muted">
                  {product.averageRating?.toFixed(1) || "0.0"} (
                  {product.totalReviews || 0} reviews)
                </Caption>
              </div>

              {/* Price and Cart Section - consistent row layout */}
              <div className="mt-auto grid grid-cols-6 items-center gap-2">
                <div className="flex flex-col col-span-2">
                  <Text
                    size="md"
                    weight="bold"
                    color="primary"
                    className="text-gray-700"
                  >
                    {formatBDTCurrency(product.price)}
                  </Text>
                </div>

                {/* Cart Button / Quantity Controls */}
                {isInCart ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-stretch bg-primary-500 rounded-md shadow-md col-span-4"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 sm:h-9 sm:w-9 p-0 hover:bg-primary-600 text-white rounded-l-md flex-shrink-0 active:scale-95 transition-all"
                      onClick={handleDecreaseQuantity}
                      disabled={isOutOfStock}
                    >
                      <Minus className="h-4 w-4 text-white stroke-[3]" />
                    </Button>
                    <div className="flex items-center justify-center flex-1 border-x border-primary-600/20">
                      <span className="text-sm font-bold text-white">
                        {itemQuantity}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 sm:h-9 sm:w-9 p-0 hover:bg-primary-600 text-white rounded-r-md flex-shrink-0 active:scale-95 transition-all"
                      onClick={handleIncreaseQuantity}
                      disabled={
                        isOutOfStock || itemQuantity >= (product.quantity || 0)
                      }
                    >
                      <Plus className="h-4 w-4 text-white stroke-[3]" />
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    size="sm"
                    className="h-9 px-4 py-0 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-md transition-all duration-300 hover:scale-105 font-medium text-sm flex items-center justify-center gap-2 col-span-4"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingBag className="h-4 w-4 text-white" />
                    <span>Add</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Details Modal */}
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
    </>
  );
}
