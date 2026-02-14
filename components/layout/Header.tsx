"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchComponent from "@/components/ui/search";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHydration } from "@/hooks/use-hydration";
import { useSettings } from "@/hooks/use-settings";
import {
  reloadCartFromStorage,
  toggleCart,
} from "@/lib/store/slices/cartSlice";
import { toggleSearch } from "@/lib/store/slices/uiSlice";
import { loadWishlistFromStorage } from "@/lib/store/slices/wishlistSlice";
import { RootState } from "@/lib/store/store";
import { motion } from "framer-motion";
import {
  Heart,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  User
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MobileTabbedMenu from "./MobileTabbedMenu";
import MuscariMartLogo from "@/lib/assets/images/muscarimart.jpg"

export default function Header() {
  const dispatch = useDispatch();
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { itemCount: wishlistCount } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { searchOpen, mobileMenuOpen } = useSelector(
    (state: RootState) => state.ui
  );
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isHydrated = useHydration();
  const { settings } = useSettings();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Only add scroll listener after component is mounted
    window.addEventListener("scroll", handleScroll);

    // Load cart and wishlist from localStorage on mount
    dispatch(reloadCartFromStorage());
    dispatch(loadWishlistFromStorage());

    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  // Don't render anything until mounted to prevent hydration mismatches
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 sm:h-20 md:h-22 lg:h-26 xl:h-28">
            <div className="lg:hidden w-10 h-10" />
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={settings?.logo1 || MuscariMartLogo?.src}
                alt={settings?.siteName || 'Muscari Mart'}
                width={200}
                height={80}
                className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
                priority
              />
            </Link>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-primary via-secondary to-primary backdrop-blur-md border-b border-beige-200/30 shadow-lg"
            : "bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 backdrop-blur-sm"
        }`}
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 sm:h-20 md:h-22 lg:h-26 xl:h-28">
            {/* Mobile Layout: Menu (left) | Logo (center) | Search & Cart (right) */}
            <div className="flex items-center justify-between w-full lg:justify-start">
              {/* Mobile Hamburger Menu - Left Side */}
              <div className="lg:hidden">
                <Sheet
                  open={mobileDrawerOpen}
                  onOpenChange={setMobileDrawerOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-beige-50 hover:bg-beige-100/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      <Menu size={24} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 p-0 overflow-hidden bg-white flex flex-col max-h-screen"
                  >
                    <SheetHeader className="sr-only">
                      <SheetTitle>Mobile Menu</SheetTitle>
                    </SheetHeader>
                    <MobileTabbedMenu
                      isOpen={mobileDrawerOpen}
                      onClose={() => setMobileDrawerOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo - Center (Mobile) */}
              <Link
                href="/"
                className="flex items-center justify-center flex-1 lg:flex-none lg:ml-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <Image
                    src={settings?.logo1 || MuscariMartLogo?.src}
                    alt={settings?.siteName || 'Muscari Mart'}
                    width={200}
                    height={80}
                    className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
                    priority
                  />
                </motion.div>
              </Link>

              {/* Mobile Actions - Right Side (Search & Cart) */}
              <div className="flex items-center space-x-1 lg:hidden">
                {/* Search */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(toggleSearch())}
                  className="p-2 text-beige-50 hover:bg-beige-100/20 transition-all duration-200 backdrop-blur-sm"
                  aria-label="Search"
                >
                  <Search size={20} className="text-beige-50 stroke-2 drop-shadow-sm flex-shrink-0" />
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(toggleCart())}
                  className="p-2 relative text-beige-50 hover:bg-beige-100/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <ShoppingBag size={20} />
                  {isHydrated && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-sandy text-secondary-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 ml-8">
              <Link
                href="/products"
                className="typography-label text-beige-50 hover:text-beige-100 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Products
              </Link>
              <Link
                href="/blogs"
                className="typography-label text-beige-50 hover:text-beige-100 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Blog
              </Link>
              <Link
                href="/deals"
                className="typography-label text-beige-50 hover:text-beige-100 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Deals
              </Link>
              <Link
                href="/contact"
                className="typography-label text-beige-50 hover:text-beige-100 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4 ml-8">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                aria-label="Search"
              >
                <Search size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 relative text-beige-50 hover:bg-beige-100/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <Heart size={20} className="text-beige-50 stroke-2 drop-shadow-sm flex-shrink-0" />
                  {isHydrated && wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary text-beige-50 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleCart())}
                className="p-2 relative text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <ShoppingBag size={20} className="text-beige-50 stroke-2 drop-shadow-sm flex-shrink-0" />
                {isHydrated && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              {/* User Account */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-beige-50 hover:bg-beige-100/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      {
                        session.user?.profileImage ? (
                          <Image src={session.user?.profileImage} alt={session.user?.name} width={10} height={10} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                        ) : (
                          <User size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                        )
                      }
                    </Button> */}
                    {
                        session.user?.profileImage ? (
                          <Image src={session.user?.profileImage} alt={session.user?.name} width={28} height={28} className="text-white stroke-2 drop-shadow-sm flex-shrink-0 rounded-full cursor-pointer object-cover ring-[2px] ring-white p-0.5" />
                        ) : (
                          <User size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                        )
                      }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {session.user?.name}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {session.user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {(session.user?.role === "admin" ||
                      session.user?.role === "manager") && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-beige-50 hover:bg-beige-100/20 transition-all duration-200 backdrop-blur-sm"
                  >
                    <User size={20} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Search Component */}
      <SearchComponent
        isOpen={searchOpen}
        onClose={() => dispatch(toggleSearch())}
      />
    </>
  );
}

// Mobile Navigation Item Component
interface MobileNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClose: () => void;
}

function MobileNavItem({
  href,
  icon: Icon,
  label,
  badge,
  onClose,
}: MobileNavItemProps) {
  return (
    <Link href={href} onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 rounded-lg transition-all duration-200 group">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="font-medium ml-3 text-gray-900 group-hover:text-indigo-700 transition-colors">
            {label}
          </span>
        </div>
        {badge && badge > 0 && (
          <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-medium shadow-sm">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
