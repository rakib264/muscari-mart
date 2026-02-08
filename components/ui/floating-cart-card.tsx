'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toggleCart } from '@/lib/store/slices/cartSlice';
import { formatBDTCurrency } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

export default function FloatingCartCard() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const cartItems = useSelector((state: any) => state.cart?.items || []);
  const cartTotal = useSelector((state: any) => state.cart?.total || 0);
  const itemCount = useSelector((state: any) => state.cart?.itemCount || 0);

  // Only show on home page
  const isHomePage = pathname === '/';

  if (!isHomePage) {
    return null;
  }

  const handleCartClick = () => {
    dispatch(toggleCart());
  };

  console.log("cartItems", cartItems);

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="hidden md:block fixed top-1/2 -translate-y-1/2 right-0 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCartClick}
            className="cursor-pointer"
          >
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg border-none rounded-l-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center gap-2.5 p-4 min-w-[110px]">
                {/* Cart Details */}
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[10px] text-white font-semibold opacity-90 uppercase tracking-wider">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                  </span>
                  <span className="text-lg text-white font-bold tracking-tight">
                    {formatBDTCurrency(cartTotal)}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-white/25"></div>

                {/* View Cart Button */}
                <Button
                  size="sm"
                  className="w-full bg-white text-gray-700 hover:bg-primary-50 hover:text-gray-900 font-bold text-xs px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-gray-700" />
                  <span className="text-gray-700">{itemCount > 0 ? 'View Cart' : 'Cart'}</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}

