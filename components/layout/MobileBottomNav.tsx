'use client';

import HydrationWrapper from '@/components/providers/HydrationWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleCart, toggleSearch } from '@/lib/store/slices/uiSlice';
import { RootState } from '@/lib/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Grid, Home, Package, ShoppingBag, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    showBadge: false
  },
  {
    id: 'products',
    label: 'Products',
    icon: Grid,
    href: '/products',
    showBadge: false
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: Package,
    href: '/categories',
    showBadge: false
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: ShoppingBag,
    href: '/cart',
    showBadge: true,
    badgeKey: 'cart'
  },
  {
    id: 'account',
    label: 'Account',
    icon: User,
    href: '/auth/signin',
    showBadge: false,
    requiresAuth: true
  }
];

export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { itemCount: cartCount } = useSelector((state: RootState) => state.cart);
  const { itemCount: wishlistCount } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavAction = (action?: string) => {
    switch (action) {
      case 'search':
        dispatch(toggleSearch());
        break;
      case 'cart':
        dispatch(toggleCart());
        break;
    }
  };

  const getBadgeCount = (badgeKey: string) => {
    switch (badgeKey) {
      case 'cart':
        return cartCount;
      default:
        return 0;
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <HydrationWrapper
      fallback={
        <div className="h-16 md:hidden" />
      }
    >
      {/* Spacer to prevent content from being hidden behind the bottom nav */}
      <div className="h-16 md:hidden" />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg relative overflow-hidden">
              {/* Subtle background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-secondary/2" />

              <div className="safe-area-inset-bottom relative z-10">
                <div className="flex items-center justify-around px-4 py-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = item.href !== '#' && isActive(item.href);
                    const badgeCount = item.showBadge ? getBadgeCount(item.badgeKey!) : 0;

                    // Handle account navigation based on auth state
                    const isAccountItem = item.id === 'account';
                    const accountHref = isAccountItem ? (session ? '/profile' : '/auth/signin') : item.href;
                    const accountLabel = isAccountItem ? (session ? 'Profile' : 'Sign In') : item.label;




                    // Unified styling for inactive and active states

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                          type: 'spring',
                          stiffness: 200
                        }}
                        className="relative"
                      >
                        <Link href={isAccountItem ? accountHref : item.href}>
                          <motion.div
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all duration-300 relative group"
                          >
                            <div className="relative">
                              {/* Icon container */}
                              <div className={`
                                relative p-2.5 rounded-2xl transition-all duration-300 mb-1
                                ${active
                                  ? 'bg-gradient-to-br from-primary to-secondary shadow-md'
                                  : 'bg-transparent group-hover:bg-gray-100'
                                }
                              `}>
                                {isAccountItem && session?.user?.profileImage ? (
                                  <Image
                                    src={session.user.profileImage}
                                    alt={session.user.name || "Profile"}
                                    width={20}
                                    height={20}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <Icon
                                    size={20}
                                    className={`
                                      transition-all duration-300 stroke-[1.5]
                                      ${active ? 'text-white' : 'text-gray-600'}
                                      group-hover:text-primary
                                    `}
                                  />
                                )}

                                {/* Badge */}
                                {item.showBadge && badgeCount > 0 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1"
                                  >
                                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                                      {badgeCount > 99 ? '99+' : badgeCount}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            {/* Label */}
                            <span className={`
                              text-xs font-medium transition-all duration-300 text-center
                              ${active
                                ? 'text-primary'
                                : 'text-gray-500 group-hover:text-gray-700'
                              }
                            `}>
                              {isAccountItem ? accountLabel : item.label}
                            </span>

                            {/* Active indicator dot */}
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                              />
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  }                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HydrationWrapper>
  );
}
