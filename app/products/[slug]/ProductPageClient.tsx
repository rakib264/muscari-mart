"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import ProductCardRegular from "@/components/ui/product-card-regular";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Caption, Display, Heading, Text } from "@/components/ui/typography";
import { useToast } from "@/hooks/use-toast";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/store/slices/wishlistSlice";
import { RootState } from "@/lib/store/store";
import { formatBDTCurrency, formatDhakaDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  FileText,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Play,
  Plus,
  RotateCcw,
  Ruler,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  Truck,
  Video,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  images: string[];
  videoLinks?: string[];
  sizeImage?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  variants?: Array<{
    name: string;
    value: string;
    price?: number;
    sku?: string;
    quantity?: number;
    image?: string;
  }>;
  quantity?: number; // Optional for public users
  sku?: string; // Optional for public users
  tags: string[];
  productSize?: string[];
  averageRating: number;
  totalReviews: number;
  totalSales?: number; // Optional for public users
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: { // Optional for public users
    length: number;
    width: number;
    height: number;
  };
  cost?: number; // Optional for public users
  barcode?: string; // Optional for public users
  reviews: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    rating: number;
    comment: string;
    verified: boolean;
    helpful: number;
    createdAt: string;
    userPurchased?: boolean;
  }>;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating: number;
  totalReviews: number;
  quantity?: number; // Optional for public users
  totalSales?: number; // Optional for public users
}

export default function ProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [showVideos, setShowVideos] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const SWIPE_THRESHOLD = 40;
  const [relatedProductsIndex, setRelatedProductsIndex] = useState(0);
  const relatedProductsPerView = {
    sm: 2,
    md: 4,
    lg: 5,
    xl: 6,
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) {
        // swipe left -> next
        setSelectedImage((prev) =>
          Math.min(galleryImages.length - 1, prev + 1)
        );
      } else {
        // swipe right -> prev
        setSelectedImage((prev) => Math.max(0, prev - 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    // keep isSwiping flag for click suppression
  };

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();

      if (response.ok) {
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } else {
        router.push("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVariants = () => {
    const variants = { ...selectedVariants };
    if (selectedSize) {
      variants.Size = selectedSize;
    }
    return variants;
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const isInWishlist = wishlistItems.some((item) => item.id === product._id);

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(
        addToWishlist({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.thumbnailImage,
          comparePrice: product.comparePrice,
          inStock: (product.quantity ?? 1) > 0,
        })
      );
    }
  };

  const getSelectedPrice = () => {
    if (!product) return 0;

    // Check if any variant has a different price
    const variantWithPrice = product.variants?.find(
      (variant) =>
        selectedVariants[variant.name] === variant.value && variant.price
    );

    return variantWithPrice?.price || product.price;
  };

  const getAvailableStock = () => {
    if (!product) return 0;

    // Check if any variant has specific quantity
    const variantWithQuantity = product.variants?.find(
      (variant) =>
        selectedVariants[variant.name] === variant.value &&
        variant.quantity !== undefined
    );

    // Return variant quantity if available, otherwise product quantity, otherwise default to 999 for unlimited
    return variantWithQuantity?.quantity ?? product.quantity ?? 999;
  };

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Render product description without raw HTML tags and clean entities
  const cleanHtml = (html: string): string => {
    if (!html) return "";
    // Avoid server/client branching; consistently strip tags using regex
    return html
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular spaces
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  };

  const submitReview = async () => {
    if (!product || !session) return;

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${product.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        setReviewDialogOpen(false);
        setNewReview({ rating: 5, comment: "" });
        fetchProduct(); // Refresh to show new review
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => formatBDTCurrency(price);

  const getDiscountPercentage = () => {
    if (!product?.comparePrice || product.comparePrice <= 0) return 0;
    return Math.round(
      ((product.comparePrice - getSelectedPrice()) / product.comparePrice) * 100
    );
  };

  const canWriteReview = () => {
    if (!session || !product) return false;

    // Check if user has already reviewed this product
    const hasReviewed = product.reviews.some(
      (review) => review.user._id === session.user.id
    );

    if (hasReviewed) return false;

    // In a real application, you would check if the user has purchased this product
    // with verified payment. For now, we'll allow logged-in users to review
    // TODO: Implement proper purchase verification logic
    return true;
  };

  const hasUserPurchased = () => {
    if (!session || !product) return false;

    // TODO: Implement actual purchase verification by checking user's orders
    // This should verify that the user has purchased this specific product
    // and the payment has been verified
    return false; // Placeholder - implement actual logic
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = product?.name || "Check out this product";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Product link has been copied to your clipboard.",
        });
        break;
    }
  };

  const convertVideoUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url
        .replace("watch?v=", "embed/")
        .replace("youtu.be/", "youtube.com/embed/");
    }
    if (url.includes("vimeo.com")) {
      return url.replace("vimeo.com/", "player.vimeo.com/video/");
    }
    return url;
  };

  const filteredReviews =
    product?.reviews.filter((review) => {
      if (reviewFilter === "all") return true;
      if (reviewFilter === "verified") return review.verified;
      return review.rating === parseInt(reviewFilter);
    }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 mt-16 md:mt-20">
          {/* Breadcrumb Skeleton */}
          <div className="mb-8 sm:mb-12 flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20">
            {/* Image Gallery Skeleton */}
            <div className="space-y-6">
              {/* Desktop Layout */}
              <div className="hidden lg:block">
                <div className="flex gap-4 items-start">
                  {/* Vertical Thumbnails */}
                  <div className="flex flex-col gap-3 w-20">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-200 rounded-lg h-20 w-20 animate-pulse"
                      ></div>
                    ))}
                  </div>
                  {/* Main Image */}
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-2xl aspect-square animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="lg:hidden">
                <div className="bg-gray-200 rounded-xl aspect-square animate-pulse mb-4"></div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg h-16 w-16 flex-shrink-0 animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details Skeleton */}
            <div className="space-y-6 lg:space-y-8">
              {/* Tags */}
              <div className="flex gap-2">
                <div className="bg-gray-200 h-6 w-20 rounded-full animate-pulse"></div>
                <div className="bg-gray-200 h-6 w-16 rounded-full animate-pulse"></div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <div className="bg-gray-200 h-10 rounded-lg w-4/5 animate-pulse"></div>
                <div className="bg-gray-200 h-8 rounded-lg w-3/5 animate-pulse"></div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 h-5 w-5 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="bg-gray-200 h-4 w-24 rounded animate-pulse"></div>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 h-12 rounded-lg w-32 animate-pulse"></div>
                  <div className="bg-gray-200 h-8 rounded-lg w-24 animate-pulse"></div>
                </div>
                <div className="bg-gray-200 h-6 w-40 rounded-full animate-pulse"></div>
                <div className="bg-gray-200 h-5 w-36 rounded animate-pulse"></div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                <div className="bg-gray-200 h-4 rounded w-11/12 animate-pulse"></div>
                <div className="bg-gray-200 h-4 rounded w-4/5 animate-pulse"></div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="bg-gray-200 h-5 w-28 rounded animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 h-14 w-16 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Quantity & Action Buttons */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 h-10 w-32 rounded-lg animate-pulse"></div>
                  <div className="bg-gray-200 h-6 w-24 rounded-lg animate-pulse"></div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-200 h-14 rounded-xl animate-pulse"></div>
                  <div className="bg-gray-200 h-14 w-14 rounded-xl animate-pulse"></div>
                  <div className="bg-gray-200 h-14 w-14 rounded-xl animate-pulse"></div>
                  <div className="bg-gray-200 h-14 w-14 rounded-xl animate-pulse"></div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-200">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-gray-200 h-10 w-10 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="bg-gray-200 h-5 w-32 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mt-12 lg:mt-16">
            <div className="flex gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 h-12 w-32 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg p-6 space-y-3">
              <div className="bg-gray-200 h-6 w-48 rounded animate-pulse"></div>
              <div className="bg-gray-200 h-4 w-full rounded animate-pulse"></div>
              <div className="bg-gray-200 h-4 w-11/12 rounded animate-pulse"></div>
              <div className="bg-gray-200 h-4 w-10/12 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Related Products Skeleton */}
          <div className="mt-12 sm:mt-16 md:mt-20">
            <div className="text-center mb-8">
              <div className="bg-gray-200 h-10 w-64 rounded-lg mx-auto mb-4 animate-pulse"></div>
              <div className="bg-gray-200 h-1 w-24 rounded-full mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="bg-gray-200 rounded-xl aspect-square animate-pulse"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 animate-pulse"></div>
                  <div className="bg-gray-200 h-5 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isInWishlist = wishlistItems.some((item) => item.id === product._id);
  const availableStock = getAvailableStock();
  const selectedPrice = getSelectedPrice();
  const galleryImages = [
    product.thumbnailImage,
    ...product.images.filter((img) => img !== product.thumbnailImage),
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 mt-16 md:mt-20">
        {/* Clean Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-700 transition-colors">
              Products
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate">
              {product.name}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20">
          {/* Product Images - Clean & Modern */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Desktop Layout - Clean & Minimal */}
            <div className="hidden lg:block">
              <div className="flex gap-4 items-start">
                {/* Vertical Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex flex-col gap-3 w-20 max-h-[600px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                    {galleryImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImage === index
                            ? "border-gray-900"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="flex-1">
                  <div
                    className="relative bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in group"
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                    onMouseMove={handleImageHover}
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <div className="relative w-full aspect-square">
                      <Image
                        src={
                          galleryImages[selectedImage] || product.thumbnailImage
                        }
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 600px"
                        className="object-cover transition-transform duration-500"
                        style={{
                          transform: isZooming ? "scale(1.5)" : "scale(1)",
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }}
                        priority
                      />
                    </div>

                    {/* Discount Badge */}
                    {product?.comparePrice !== 0 &&
                      product?.comparePrice !== undefined &&
                      product?.comparePrice > 0 &&
                      getDiscountPercentage() > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                          -{getDiscountPercentage()}%
                        </div>
                      )}

                    {/* Navigation Arrows */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(Math.max(0, selectedImage - 1));
                          }}
                          disabled={selectedImage === 0}
                          className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all ${
                            selectedImage === 0
                              ? "opacity-50 cursor-not-allowed"
                              : "opacity-100"
                          }`}
                        >
                          <ChevronLeft size={20} className="text-gray-900" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(
                              Math.min(
                                galleryImages.length - 1,
                                selectedImage + 1
                              )
                            );
                          }}
                          disabled={selectedImage === galleryImages.length - 1}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all ${
                            selectedImage === galleryImages.length - 1
                              ? "opacity-50 cursor-not-allowed"
                              : "opacity-100"
                          }`}
                        >
                          <ChevronRight size={20} className="text-gray-900" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Simplified */}
            <div className="lg:hidden">
              {/* Main Image */}
              <div
                className="relative bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in group mb-4"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleImageHover}
                onClick={() => {
                  if (!isSwiping.current) setIsLightboxOpen(true);
                  isSwiping.current = false;
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={galleryImages[selectedImage] || product.thumbnailImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw"
                    className="object-cover transition-transform duration-500"
                    style={{
                      transform: isZooming ? "scale(1.5)" : "scale(1)",
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                    priority
                  />
                </div>

                {/* Discount Badge */}
                {product?.comparePrice !== 0 &&
                  product?.comparePrice !== undefined &&
                  product?.comparePrice > 0 &&
                  getDiscountPercentage() > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      -{getDiscountPercentage()}%
                    </div>
                  )}

                {/* Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(Math.max(0, selectedImage - 1));
                      }}
                      disabled={selectedImage === 0}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all ${
                        selectedImage === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "opacity-100"
                      }`}
                    >
                      <ChevronLeft size={16} className="text-gray-900" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(
                          Math.min(galleryImages.length - 1, selectedImage + 1)
                        );
                      }}
                      disabled={selectedImage === galleryImages.length - 1}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all ${
                        selectedImage === galleryImages.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "opacity-100"
                      }`}
                    >
                      <ChevronRight size={16} className="text-gray-900" />
                    </button>
                  </>
                )}

                {/* Image Dots */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImage === index ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Horizontal Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-gray-900"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Lightbox Dialog - Premium UI */}
            <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
              <DialogContent className="max-w-7xl w-[95vw] p-0 overflow-hidden bg-black/95 backdrop-blur-md border-0 rounded-none sm:rounded-2xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>{product.name} image preview</DialogTitle>
                </DialogHeader>

                {/* Close Button - Always visible, well-positioned */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 hover:scale-110"
                  aria-label="Close image viewer"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </Button>

                <div className="relative bg-black">
                  <div
                    className="relative w-full max-h-[85vh] sm:max-h-[90vh]"
                    style={{ height: "85vh", minHeight: "400px" }}
                  >
                    <Image
                      src={
                        galleryImages[selectedImage] || product.thumbnailImage
                      }
                      alt={product.name}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Navigation Arrows - Enhanced */}
                  {galleryImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 z-40 ${
                          selectedImage === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "opacity-100 hover:scale-110"
                        }`}
                        onClick={() =>
                          setSelectedImage(Math.max(0, selectedImage - 1))
                        }
                        disabled={selectedImage === 0}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} className="sm:w-7 sm:h-7" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 z-40 ${
                          selectedImage === galleryImages.length - 1
                            ? "opacity-50 cursor-not-allowed"
                            : "opacity-100 hover:scale-110"
                        }`}
                        onClick={() =>
                          setSelectedImage(
                            Math.min(
                              galleryImages.length - 1,
                              selectedImage + 1
                            )
                          )
                        }
                        disabled={selectedImage === galleryImages.length - 1}
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} className="sm:w-7 sm:h-7" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Enhanced Thumbnail Strip */}
                {galleryImages.length > 1 && (
                  <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-3 sm:p-4">
                    <div className="flex gap-2 sm:gap-3 justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pb-2">
                      {galleryImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            selectedImage === index
                              ? "border-white ring-2 ring-white/50 shadow-lg scale-105"
                              : "border-white/30 hover:border-white/50 opacity-70 hover:opacity-100"
                          }`}
                          aria-label={`Select image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    {/* Image Counter */}
                    <div className="text-center mt-2 text-white/70 text-xs sm:text-sm font-medium">
                      {selectedImage + 1} / {galleryImages.length}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Product Details - Clean & Modern */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6 lg:space-y-8"
          >
            {/* Product Header */}
            <div className="space-y-4">
              {/* Category & Featured Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  {product.category.name}
                </Badge>
                {product.isFeatured && (
                  <Badge className="text-xs font-medium bg-primary text-white">
                    Featured
                  </Badge>
                )}
                {product.totalSales !== undefined && product.totalSales > 50 && (
                  <Badge variant="outline" className="text-xs font-medium border-green-200 text-green-700">
                    Bestseller
                  </Badge>
                )}
              </div>

              {/* Product Title */}
              <h1 className="typography-hero-title text-gray-700">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="typography-caption font-medium text-hierarchy-title ml-1">
                    {product.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="typography-caption text-hierarchy-caption">
                  ({product.totalReviews} reviews)
                </span>
                {product.totalSales !== undefined && (
                  <span className="typography-caption text-hierarchy-caption">
                    {product.totalSales} sold
                  </span>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-3 py-4 border-y border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="typography-product-price text-3xl">
                  {formatPrice(selectedPrice)}
                </span>
                {product.comparePrice !==0 && product.comparePrice !== undefined && product.comparePrice && product.comparePrice > selectedPrice && (
                  <>
                    <span className="text-heading-3 text-hierarchy-caption line-through">
                      {formatPrice(product?.comparePrice ?? 0)}
                    </span>
                    <Badge className="bg-red-100 text-red-700 text-sm font-semibold">
                      -{getDiscountPercentage()}% OFF
                    </Badge>
                  </>
                )}
              </div>
              {product.comparePrice !==0 && product.comparePrice !== undefined && product.comparePrice && product.comparePrice > selectedPrice && (
                <p className="typography-caption text-success-600 font-medium">
                  You save {formatPrice(product?.comparePrice - selectedPrice)}
                </p>
              )}
            </div>

            {/* Description with Read More - 2-3 lines max */}
            <div className="space-y-3">
              <div className="relative">
                <div
                  className={`leading-relaxed transition-all duration-300 text-md font-normal text-gray-600 ${
                    showFullDescription
                      ? ""
                      : "line-clamp-3 overflow-hidden"
                  }`}
                  style={{
                    display: showFullDescription ? "block" : "-webkit-box",
                    WebkitLineClamp: showFullDescription ? "unset" : 3,
                    WebkitBoxOrient: "vertical" as const,
                  }}
                >
                  {cleanHtml(product.description)}
                </div>
                {!showFullDescription && cleanHtml(product.description).length > 200 && (
                  <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-8">
                    <span className="text-gray-400">...</span>
                  </div>
                )}
              </div>
              {cleanHtml(product.description).length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary hover:text-primary-600 p-0 h-auto font-medium"
                >
                  {showFullDescription ? "Show Less" : "Read More"}
                </Button>
              )}
            </div>

            {/* Professional Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 py-4 border-y border-gray-100">
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <Truck size={14} className="text-green-600" />
                </div>
                <div>
                  <Text size="sm" weight="semibold" color="primary" className="leading-tight">
                    Free Delivery
                  </Text>
                  <Caption weight="normal" color="muted" className="text-xs">
                    Orders over ৳2000
                  </Caption>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <RotateCcw size={14} className="text-blue-600" />
                </div>
                <div>
                  <Text size="sm" weight="semibold" color="primary" className="leading-tight">
                    Easy Return
                  </Text>
                  <Caption weight="normal" color="muted" className="text-xs">
                    15 days return
                  </Caption>
                </div>
              </div>

              {/* <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <CheckCircle size={14} className="text-purple-600" />
                </div>
                <div>
                  <Text size="sm" weight="semibold" color="primary" className="leading-tight">
                    Secure Pay
                  </Text>
                  <Caption weight="normal" color="muted" className="text-xs">
                    SSL protected
                  </Caption>
                </div>
              </div> */}

              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <Package size={14} className="text-orange-600" />
                </div>
                <div>
                  <Text size="sm" weight="semibold" color="primary" className="leading-tight">
                    Quality
                  </Text>
                  <Caption weight="normal" color="muted" className="text-xs">
                    Premium products
                  </Caption>
                </div>
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    if (!acc[variant.name]) acc[variant.name] = [];
                    acc[variant.name].push(variant);
                    return acc;
                  }, {} as Record<string, typeof product.variants>)
                ).map(([variantName, options]) => (
                  <div key={variantName}>
                    <Label className="text-sm font-medium mb-2 block">
                      {variantName}: {selectedVariants[variantName] || "Select"}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            selectedVariants[variantName] === option.value
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [variantName]: option.value,
                            }));
                            // Update selected image if variant has one
                            if (option.image) {
                              const variantImageIndex = galleryImages.findIndex(
                                (img) => img === option.image
                              );
                              if (variantImageIndex !== -1) {
                                setSelectedImage(variantImageIndex);
                              }
                            }
                          }}
                          className="min-w-[70px] sm:min-w-[80px] flex flex-col items-center gap-1 sm:gap-2 h-auto py-2 sm:py-3 px-2 sm:px-4 transition-all duration-200 hover:shadow-md hover:scale-105 border-2 hover:border-primary/20"
                        >
                          {option.image && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 overflow-hidden rounded-full border-2 border-gray-200">
                              <Image
                                src={option.image}
                                alt={option.value}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="font-medium text-xs sm:text-sm">
                            {option.value}
                          </span>
                          {option.price && option.price !== product.price && (
                            <span className="text-xs text-primary font-semibold">
                              +{formatPrice(option.price - product.price)}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Size Selection */}
            {product.productSize && product.productSize.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Size: {selectedSize ? (
                    <span className="font-normal text-gray-600">{selectedSize}</span>
                  ) : (
                    <span className="font-normal text-gray-500">Select a size</span>
                  )}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {product.productSize.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[50px] h-10 border-2 font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                          : "border-gray-200 hover:border-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Quantity & Add to Cart Section */}
            <div className="space-y-6 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Quantity
                  </Label>
                  <div className="flex items-center border-2 border-gray-200 rounded-lg w-fit">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 hover:bg-gray-100 rounded-none border-0"
                    >
                      <Minus size={16} />
                    </Button>
                    <div className="px-4 py-2 font-semibold min-w-[60px] text-center text-gray-900 border-x-2 border-gray-200">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setQuantity(Math.min(availableStock, quantity + 1))
                      }
                      disabled={quantity >= availableStock}
                      className="h-10 w-10 hover:bg-gray-100 rounded-none border-0"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                {product.quantity !== undefined && (
                  <div className="text-right">
                    <Text size="sm" weight="semibold" color="secondary" className="mb-1">
                      Stock Status
                    </Text>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${availableStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <Text size="sm" weight="medium" className={availableStock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {availableStock > 0 ? `In stock` : 'Out of stock'}
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <AddToCartButton
                  productId={product._id}
                  productName={product.name}
                  productPrice={getSelectedPrice()}
                  productImage={
                    galleryImages[selectedImage] || product.thumbnailImage
                  }
                  productSlug={product.slug}
                  selectedVariants={getSelectedVariants()}
                  quantity={quantity}
                  variant="full"
                  size="lg"
                  availableStock={availableStock}
                  isOutOfStock={product.quantity !== undefined ? availableStock === 0 : false}
                  className="w-full h-12 text-base font-semibold"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleWishlistToggle}
                    className={`h-12 border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isInWishlist
                        ? "border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                        : "border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <Heart
                      size={18}
                      className={`transition-colors duration-300 ${
                        isInWishlist ? "fill-current" : ""
                      }`}
                    />
                    <span className="font-medium">
                      {isInWishlist ? "Wishlisted" : "Add to Wishlist"}
                    </span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Share2 size={18} />
                        <span className="font-medium">Share</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleShare("facebook")}>
                        <Facebook size={16} className="mr-2" />
                        Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                        <MessageCircle size={16} className="mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare("copy")}>
                        <Copy size={16} className="mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Size Chart Button */}
                {product.sizeImage && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 text-primary hover:text-primary-600 hover:bg-primary/5"
                      >
                        <Ruler size={16} className="mr-2" />
                        View Size Chart
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Size Chart</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-auto">
                        <img
                          src={product.sizeImage}
                          alt="Size chart"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

          </motion.div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-12 lg:mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-lg p-1 h-12">
              <TabsTrigger
                value="description"
                className="text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-secondary-600"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-secondary-600"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-secondary-600"
              >
                Reviews ({product.totalReviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {cleanHtml(product.description)}
                  </p>

                  {product.tags.length > 0 && (
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Product Details</h4>
                    <div className="space-y-3">
                      {product.sku && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">SKU</span>
                          <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Category</span>
                        <span className="text-sm font-medium text-gray-900">{product.category.name}</span>
                      </div>
                      {product.weight && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Weight</span>
                          <span className="text-sm font-medium text-gray-900">{product.weight} kg</span>
                        </div>
                      )}
                      {product.quantity !== undefined ? (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">Availability</span>
                          <span className={`text-sm font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {availableStock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">Availability</span>
                          <span className="text-sm font-medium text-green-600">Available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {product.dimensions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Dimensions</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Length</span>
                          <span className="text-sm font-medium text-gray-900">{product.dimensions.length} cm</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Width</span>
                          <span className="text-sm font-medium text-gray-900">{product.dimensions.width} cm</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">Height</span>
                          <span className="text-sm font-medium text-gray-900">{product.dimensions.height} cm</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Enhanced Videos Tab */}
            {product.videoLinks && product.videoLinks.length > 0 && (
              <TabsContent value="videos" className="mt-0">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                    <CardTitle className="flex items-center">
                      <Video
                        size={18}
                        className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5"
                      />
                      <Heading level={3} weight="bold" color="primary">
                        Product Videos
                      </Heading>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      {product.videoLinks.map((link, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2 sm:space-y-3 md:space-y-4"
                        >
                          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group">
                            <iframe
                              src={convertVideoUrl(link)}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`${product.name} - Video ${index + 1}`}
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/70 text-white p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg">
                                <Play
                                  size={14}
                                  className="sm:w-4 sm:h-4 md:w-5 md:h-5"
                                />
                              </div>
                            </div>
                          </div>
                          <Text
                            size="md"
                            weight="bold"
                            color="secondary"
                            className="text-center"
                          >
                            Video {index + 1}
                          </Text>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {/* Enhanced Review Summary */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <Heading
                      level={3}
                      weight="bold"
                      color="primary"
                      className="mb-4 sm:mb-6 md:mb-8 flex items-center"
                    >
                      <MessageCircle
                        size={18}
                        className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5"
                      />
                      Customer Reviews
                    </Heading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="text-center bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                        <Display
                          size="sm"
                          weight="bold"
                          gradient="primary"
                          className="mb-2 sm:mb-3 md:mb-4"
                        >
                          {product.averageRating.toFixed(1)}
                        </Display>
                        <div className="flex items-center justify-center space-x-1 mb-2 sm:mb-3 md:mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                                i < Math.floor(product.averageRating)
                                  ? "text-yellow-400 fill-current drop-shadow-sm"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <Text size="md" weight="semibold" color="secondary">
                          Based on {product.totalReviews} reviews
                        </Text>
                      </div>

                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <Heading
                          level={4}
                          weight="bold"
                          color="primary"
                          className="mb-2 sm:mb-3 md:mb-4"
                        >
                          Rating Breakdown
                        </Heading>
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = product.reviews.filter(
                            (r) => r.rating === rating
                          ).length;
                          const percentage =
                            product.totalReviews > 0
                              ? (count / product.totalReviews) * 100
                              : 0;

                          return (
                            <div
                              key={rating}
                              className="flex items-center space-x-2 sm:space-x-3 md:space-x-4"
                            >
                              <Text
                                size="md"
                                weight="bold"
                                color="secondary"
                                className="w-8 sm:w-10 md:w-12"
                              >
                                {rating}★
                              </Text>
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 md:h-3">
                                <div
                                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1.5 sm:h-2 md:h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <Text
                                size="md"
                                weight="bold"
                                color="secondary"
                                className="w-8 sm:w-10 md:w-12"
                              >
                                {count}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Write Review Section */}
                {session ? (
                  canWriteReview() ? (
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <span className="flex items-center">
                            <MessageCircle
                              size={18}
                              className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5"
                            />
                            <Heading level={3} weight="bold" color="primary">
                              Write a Review
                            </Heading>
                          </span>
                          <Dialog
                            open={reviewDialogOpen}
                            onOpenChange={setReviewDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg">
                                <MessageCircle
                                  size={14}
                                  className="mr-1 sm:mr-2 sm:w-4 sm:h-4"
                                />
                                <span className="hidden sm:inline">
                                  Write Review
                                </span>
                                <span className="sm:hidden">Review</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl max-w-2xl mx-4">
                              <DialogHeader className="pb-4 sm:pb-6">
                                <DialogTitle className="text-center">
                                  <Heading
                                    level={3}
                                    weight="bold"
                                    color="primary"
                                  >
                                    Write a Review for {product.name}
                                  </Heading>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 sm:space-y-6">
                                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                                  <Label className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 block">
                                    Your Rating
                                  </Label>
                                  <div className="flex space-x-1 sm:space-x-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <Button
                                        key={rating}
                                        variant="ghost"
                                        size="lg"
                                        onClick={() =>
                                          setNewReview((prev) => ({
                                            ...prev,
                                            rating,
                                          }))
                                        }
                                        className="p-2 sm:p-3 hover:bg-yellow-50 transition-colors"
                                      >
                                        <Star
                                          size={24}
                                          className={`sm:hidden transition-all duration-300 ${
                                            rating <= newReview.rating
                                              ? "text-yellow-400 fill-current drop-shadow-sm"
                                              : "text-gray-300 hover:text-yellow-300"
                                          }`}
                                        />
                                        <Star
                                          size={32}
                                          className={`hidden sm:block transition-all duration-300 ${
                                            rating <= newReview.rating
                                              ? "text-yellow-400 fill-current drop-shadow-sm"
                                              : "text-gray-300 hover:text-yellow-300"
                                          }`}
                                        />
                                      </Button>
                                    ))}
                                  </div>
                                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                                    {newReview.rating === 1 && "Poor"}
                                    {newReview.rating === 2 && "Fair"}
                                    {newReview.rating === 3 && "Good"}
                                    {newReview.rating === 4 && "Very Good"}
                                    {newReview.rating === 5 && "Excellent"}
                                  </p>
                                </div>

                                <div>
                                  <Label
                                    htmlFor="comment"
                                    className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 block"
                                  >
                                    Your Review
                                  </Label>
                                  <Textarea
                                    id="comment"
                                    value={newReview.comment}
                                    onChange={(e) =>
                                      setNewReview((prev) => ({
                                        ...prev,
                                        comment: e.target.value,
                                      }))
                                    }
                                    placeholder="Share your experience with this product..."
                                    rows={4}
                                    className="text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-primary-500 transition-colors"
                                  />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => setReviewDialogOpen(false)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold border-2 rounded-xl"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={submitReview}
                                    disabled={submittingReview}
                                    className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg"
                                  >
                                    {submittingReview
                                      ? "Submitting..."
                                      : "Submit Review"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ) : (
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <MessageCircle
                          size={48}
                          className="mx-auto text-gray-400 mb-4 sm:mb-6"
                        />
                        <Heading
                          level={3}
                          weight="bold"
                          color="primary"
                          className="mb-3 sm:mb-4"
                        >
                          You've already reviewed this product
                        </Heading>
                        <Text size="md" weight="normal" color="secondary">
                          Thank you for your feedback! You can only review a
                          product once.
                        </Text>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 sm:p-12 text-center">
                      <MessageCircle
                        size={48}
                        className="mx-auto text-gray-400 mb-4 sm:mb-6"
                      />
                      <Heading
                        level={3}
                        weight="bold"
                        color="primary"
                        className="mb-3 sm:mb-4"
                      >
                        Sign in to write a review
                      </Heading>
                      <Text
                        size="md"
                        weight="normal"
                        color="secondary"
                        className="mb-6 sm:mb-8"
                      >
                        Share your experience with this product by signing in
                        first.
                      </Text>
                      <Link href="/auth/signin">
                        <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg">
                          Sign In
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Review Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Select
                      value={reviewFilter}
                      onValueChange={setReviewFilter}
                    >
                      <SelectTrigger className="w-full sm:w-56 h-10 sm:h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl">
                        <SelectItem
                          value="all"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          All Reviews
                        </SelectItem>
                        <SelectItem
                          value="verified"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          Verified Purchases
                        </SelectItem>
                        <SelectItem
                          value="5"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          5 Stars
                        </SelectItem>
                        <SelectItem
                          value="4"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          4 Stars
                        </SelectItem>
                        <SelectItem
                          value="3"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          3 Stars
                        </SelectItem>
                        <SelectItem
                          value="2"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          2 Stars
                        </SelectItem>
                        <SelectItem
                          value="1"
                          className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base"
                        >
                          1 Star
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Text
                      size="md"
                      weight="semibold"
                      color="secondary"
                      className="bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
                    >
                      {filteredReviews.length} reviews
                    </Text>
                  </div>
                </div>

                {/* Enhanced Reviews List */}
                <div className="space-y-4 sm:space-y-6">
                  {filteredReviews.length === 0 ? (
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <MessageCircle
                          size={48}
                          className="mx-auto text-gray-400 mb-4 sm:mb-6"
                        />
                        <Heading
                          level={3}
                          weight="bold"
                          color="primary"
                          className="mb-3 sm:mb-4"
                        >
                          No reviews yet
                        </Heading>
                        <Text
                          size="md"
                          weight="normal"
                          color="secondary"
                          className="mb-4 sm:mb-6"
                        >
                          Be the first to review this product and help other
                          customers!
                        </Text>
                        {session ? (
                          <Button
                            onClick={() => setReviewDialogOpen(true)}
                            className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg"
                          >
                            Write First Review
                          </Button>
                        ) : (
                          <Link href="/auth/signin">
                            <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg">
                              Sign In to Review
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredReviews.map((review) => (
                      <Card
                        key={review._id}
                        className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                      >
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                          <div className="flex items-start space-x-4 sm:space-x-6">
                            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user.firstName} ${review.user.lastName}`}
                              />
                              <AvatarFallback className="text-sm sm:text-lg font-bold">
                                {review.user.firstName.charAt(0)}
                                {review.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                                <div>
                                  <Heading
                                    level={4}
                                    weight="bold"
                                    color="primary"
                                    className="mb-1 sm:mb-2"
                                  >
                                    {review.user.firstName}{" "}
                                    {review.user.lastName}
                                  </Heading>
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={`${
                                            i < review.rating
                                              ? "text-yellow-400 fill-current drop-shadow-sm"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {review.verified && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1"
                                        >
                                          <CheckCircle
                                            size={12}
                                            className="mr-1"
                                          />
                                          <span className="hidden sm:inline">
                                            Verified Purchase
                                          </span>
                                          <span className="sm:hidden">
                                            Verified
                                          </span>
                                        </Badge>
                                      )}
                                      {review.userPurchased && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
                                        >
                                          Purchased
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Caption weight="semibold" color="secondary">
                                  {formatDhakaDate(review.createdAt)}
                                </Caption>
                              </div>

                              <Text
                                size="md"
                                weight="normal"
                                color="secondary"
                                className="leading-relaxed mb-4 sm:mb-6"
                              >
                                {review.comment}
                              </Text>

                              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-primary-600 hover:bg-primary/10 transition-colors text-xs sm:text-sm"
                                >
                                  <ThumbsUp
                                    size={16}
                                    className="mr-1 sm:mr-2"
                                  />
                                  Helpful ({review.helpful})
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                                >
                                  <ThumbsDown
                                    size={16}
                                    className="mr-1 sm:mr-2"
                                  />
                                  Not Helpful
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You might also like</h2>
              <p className="text-gray-600">Similar products that other customers viewed</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {relatedProducts.slice(0, 6).map((relatedProduct) => (
                <ProductCardRegular
                  key={relatedProduct._id}
                  product={relatedProduct}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
