"use client";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import WellRiseLogo from "@/lib/assets/images/muscarimart.jpg";

export default function Footer() {
  const { settings, loading } = useSettings();

  // Settings hook already handles: Backend → Env Vars → Empty
  // So we can directly use settings values
  const siteName = settings?.siteName || "";
  const siteDescription = settings?.siteDescription || "";
  const contactEmail = settings?.contactEmail || "";
  const contactPhone = settings?.contactPhone || "";
  const contactAddress =
    settings?.location?.formattedAddress || settings?.address || "";
  const currentYear = new Date().getFullYear();

  // Show skeleton loading state for dynamic content
  const isLoading = loading && !settings;

  // Social links
  const socialLinks = {
    facebook: settings?.socialLinks?.facebook || "",
    instagram: settings?.socialLinks?.instagram || "",
    youtube: settings?.socialLinks?.youtube || "",
    tiktok: settings?.socialLinks?.tiktok || "",
  };

  const hasAnySocial = Object.values(socialLinks).some(Boolean);

  // Minimal inline TikTok icon to match lucide stroke style
  const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 3v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M13 6c1.2 1.8 3.2 3 5.5 3" />
    </svg>
  );

  return (
    <footer className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-beige-50 border-t border-secondary-700 hidden md:block relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-sandy/5 to-secondary/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {siteName && (
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <div className="h-8 bg-white/20 rounded animate-pulse w-48"></div>
                ) : (
                  <>
                    <Image
                      src={settings?.logo1 || WellRiseLogo?.src}
                      alt={settings?.siteName || "Muscari Mart"}
                      width={240}
                      height={80}
                      className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
                      priority
                    />
                  </>
                )}
              </div>
            )}
            {isLoading ? (
              <div className="text-white/80 text-sm space-y-2">
                <div className="h-4 bg-white/20 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
              </div>
            ) : siteDescription ? (
              <p className="typography-caption text-gray-300 leading-relaxed">
                {siteDescription}
              </p>
            ) : null}
            {hasAnySocial && (
              <div className="flex space-x-3">
                {socialLinks.facebook && (
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 text-gray-400 hover:text-white hover:bg-blue-600 border border-gray-600/30 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                      >
                        <Facebook size={18} />
                      </Button>
                    </a>
                  </motion.div>
                )}
                {socialLinks.instagram && (
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 border border-gray-600/30 hover:border-pink-400 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
                      >
                        <Instagram size={18} />
                      </Button>
                    </a>
                  </motion.div>
                )}
                {socialLinks.youtube && (
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 text-gray-400 hover:text-white hover:bg-red-600 border border-gray-600/30 hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                      >
                        <Youtube size={18} />
                      </Button>
                    </a>
                  </motion.div>
                )}
                {socialLinks.tiktok && (
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-600/30 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-gray-500/25"
                      >
                        <TikTokIcon />
                      </Button>
                    </a>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="typography-card-title text-white mb-2 border-b-2 border-gray-600/30 pb-2">
              Quick Links
            </h4>
            <div className="space-y-2">
              <Link
                href="/products"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                About Us
              </Link>
              <Link
                href="/terms-conditions"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/auth/signin"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Sign In
              </Link>
              <Link
                href="/blogs"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Blogs
              </Link>
            </div>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="typography-card-title text-white mb-2 border-b-2 border-gray-600/30 pb-2">
              Customer Service
            </h4>
            <div className="space-y-2">
              <Link
                href="/shipping-delivery"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Shipping & Delivery
              </Link>
              <Link
                href="/privilege-members"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Privilege Members
              </Link>
              <Link
                href="/returns"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Returns & Exchanges
              </Link>
              <Link
                href="/deals"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Special Deals
              </Link>
              <Link
                href="/faqs"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                className="block typography-caption text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-white/40 pl-2"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="typography-card-title text-white mb-2 border-b-2 border-gray-600/30 pb-2">
              Contact Info
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm group hover:bg-white/10 p-2 rounded-lg transition-all duration-300">
                <Phone
                  size={16}
                  className="text-gray-400 group-hover:text-gray-200"
                />
                {isLoading ? (
                  <div className="h-4 bg-white/20 rounded animate-pulse w-32"></div>
                ) : contactPhone ? (
                  <span className="typography-caption text-gray-300 group-hover:text-white">
                    {contactPhone}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center space-x-3 text-sm group hover:bg-white/10 p-2 rounded-lg transition-all duration-300">
                <Mail
                  size={16}
                  className="text-gray-400 group-hover:text-gray-200"
                />
                {isLoading ? (
                  <div className="h-4 bg-white/20 rounded animate-pulse w-40"></div>
                ) : contactEmail ? (
                  <span className="typography-caption text-gray-300 group-hover:text-white">
                    {contactEmail}
                  </span>
                ) : null}
              </div>
              <div className="flex items-start space-x-3 text-sm group hover:bg-white/10 p-2 rounded-lg transition-all duration-300">
                <MapPin
                  size={16}
                  className="text-gray-400 group-hover:text-gray-200 mt-0.5 flex-shrink-0"
                />
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 bg-white/20 rounded animate-pulse w-36"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-28"></div>
                  </div>
                ) : contactAddress ? (
                  <span className="whitespace-pre-line typography-caption text-gray-300 group-hover:text-white break-words">
                    {contactAddress}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        {siteName && (
          <div className="mt-8 pt-8 border-t border-gray-600/30 text-center typography-caption text-gray-400">
            {isLoading ? (
              <div className="h-4 bg-white/20 rounded animate-pulse w-64 mx-auto"></div>
            ) : (
              <p>
                &copy; {currentYear} {siteName}. All rights reserved. Developed
                By{" "}
                <a
                  href="https://wa.me/8801828123264?text=Hi%20there!%20How%20can%20I%20help%20you%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white hover:underline transition-colors duration-300 font-medium"
                >
                  Redwan Rakib
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
