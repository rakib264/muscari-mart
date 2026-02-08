"use client";

import ClientOnly from "@/components/providers/ClientOnly";
import FloatingCartCard from "@/components/ui/floating-cart-card";
import FloatingButtons from "@/components/ui/FloatingButtons";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroCarousel = dynamic(() => import("@/components/home/HeroCarousel"), {
  ssr: false,
});
const ModernCategorySection = dynamic(
  () => import("@/components/home/ModernCategorySection"),
  { ssr: false }
);
const AllProductsListing = dynamic(
  () => import("@/components/home/AllProductsListing"),
  { ssr: false }
);
const LandingEvents = dynamic(
  () => import("@/components/home/LandingEvents"),
  { ssr: false }
);
const HorizontalAdvertisements = dynamic(
  () => import("@/components/home/HorizontalAdvertisements"),
  { ssr: false }
);
const BestSellingProducts = dynamic(
  () => import("@/components/home/BestSellingProducts"),
  { ssr: false }
);

const FeaturedProducts = dynamic(
  () => import("@/components/home/FeaturedProducts"),
  { ssr: false }
);

const VerticalAdvertisements = dynamic(
  () => import("@/components/home/VerticalAdvertisements"),
  { ssr: false }
);


const SocialProof = dynamic(() => import("@/components/home/SocialProof"), {
  ssr: false,
});
const Newsletter = dynamic(() => import("@/components/home/Newsletter"), {
  ssr: false,
});
const Header = dynamic(() => import("@/components/layout/Header"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
});
const MobileBottomNav = dynamic(
  () => import("@/components/layout/MobileBottomNav"),
  { ssr: false }
);

export default function HomeClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isClient) return;

    // Dynamically import GSAP and ScrollTrigger only after component is fully mounted
    const initGSAP = async () => {
      if (typeof window !== "undefined") {
        try {
          // Respect reduced motion and skip on small screens for perf
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          const isSmallScreen = window.innerWidth < 768;
          if (prefersReducedMotion || isSmallScreen) return;

          const GSAP = await import("gsap");
          const ST = await import("gsap/ScrollTrigger");

          const gsap = GSAP.gsap;
          const ScrollTrigger = ST.ScrollTrigger;

          gsap.registerPlugin(ScrollTrigger);

          const ctx = gsap.context(() => {
            // Only animate scroll reveal elements, not page-load elements (handled by Framer Motion)
            const scrollRevealElements =
              document.querySelectorAll(".scroll-reveal");

            if (scrollRevealElements.length > 0) {
              gsap.utils
                .toArray(".scroll-reveal")
                .forEach((element: any, index) => {
                  gsap.fromTo(
                    element,
                    {
                      y: 100,
                      opacity: 0,
                    },
                    {
                      y: 0,
                      opacity: 1,
                      duration: 1,
                      delay: index * 0.1,
                      ease: "power3.out",
                      scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse",
                      },
                    }
                  );
                });
            }
          }, containerRef);

          return () => ctx.revert();
        } catch (error) {
          console.warn("GSAP initialization failed:", error);
        }
      }
    };

    // Delay GSAP initialization to ensure DOM is ready and Framer Motion has completed
    const timeoutId = setTimeout(initGSAP, 1200);

    return () => clearTimeout(timeoutId);
  }, [mounted, isClient]);

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <ClientOnly>
        <Header />
      </ClientOnly>

      <main className="mb-0">
        {/* Hero Carousel section with simple fade-in, no GSAP conflict */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          suppressHydrationWarning
        >
          <HeroCarousel />
        </motion.div>

        {/* Modern Category Section */}
        <div suppressHydrationWarning>
          <ModernCategorySection />
        </div>

        {/* All Products Listing - Grid with Load More */}
        <div suppressHydrationWarning>
          <AllProductsListing />
        </div>

        {/* Horizontal Advertisements - 2 Cards */}
        <div suppressHydrationWarning>
          <HorizontalAdvertisements />
        </div>

        {/* Landing Events - Special Deals & Promotions */}
        <div suppressHydrationWarning>
          <LandingEvents title="New Year Discounts" />
        </div>

        {/* Featured Products - Grid Layout */}
        <div suppressHydrationWarning>
          <FeaturedProducts />
        </div>

        {/* Vertical Advertisements - 3 Cards */}
        <div suppressHydrationWarning>
          <VerticalAdvertisements />
        </div>

        {/* Social Proof Section */}
        <div suppressHydrationWarning>
          <SocialProof />
        </div>

        {/* Newsletter Section */}
        <div suppressHydrationWarning>
          <Newsletter />
        </div>

        {/* Floating Cart Card - Only on Home Page */}
        <FloatingCartCard />
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Floating Buttons */}
      <ClientOnly>
        <FloatingButtons />
      </ClientOnly>
    </div>
  );
}

