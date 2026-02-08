'use client';

import { Input } from '@/components/ui/input';
import { Caption, Label, Text } from '@/components/ui/typography';
import { toggleSearch } from '@/lib/store/slices/uiSlice';
import { RootState } from '@/lib/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Package,
  Percent,
  Phone,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  User
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  productCount?: number;
  children?: Category[];
}

interface MobileTabbedMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileTabbedMenu({ isOpen, onClose }: MobileTabbedMenuProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'menu'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { itemCount: wishlistCount } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      const categoriesArray = data.categories || [];

      // Build category tree
      const rootCategories = categoriesArray.filter((cat: Category) => !cat.parent);
      const categoriesWithChildren = rootCategories.map((parent: Category) => {
        const children = categoriesArray.filter((cat: Category) =>
          cat.parent && cat.parent._id === parent._id
        );
        return {
          ...parent,
          children: children.length > 0 ? children : undefined
        };
      });

      setCategories(categoriesWithChildren);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-sandy/10">
        <Text size="md" weight="bold" className="text-gray-900">
          Browse
        </Text>
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </Button> */}
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('categories')}
          className="flex-1 py-3 px-4 transition-all duration-200 relative"
        >
          <Label
            weight="semibold"
            className={activeTab === 'categories' ? 'text-primary' : 'text-gray-700 hover:text-gray-900'}
          >
            Categories
          </Label>
          {activeTab === 'categories' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className="flex-1 py-3 px-4 transition-all duration-200 relative"
        >
          <Label
            weight="semibold"
            className={activeTab === 'menu' ? 'text-primary' : 'text-gray-700 hover:text-gray-900'}
          >
            Menu
          </Label>
          {activeTab === 'menu' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'categories' ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-2"
            >
              {loading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center gap-3 p-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {categories.map((category) => (
                    <div key={category._id} className="mb-2">
                      {/* Parent Category */}
                      <div className="flex items-center rounded-xl overflow-hidden">
                        {/* Category Link */}
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 flex-1 hover:bg-gray-50 active:bg-primary/5 transition-colors"
                        >
                          {/* Category Image or Avatar */}
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary to-sandy rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {getInitials(category.name)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <Text size="md" weight="medium" className="text-gray-900">
                              {category.name}
                            </Text>
                            {category.productCount !== undefined && (
                              <Caption weight="normal" className="text-gray-600">
                                {category.productCount} items
                              </Caption>
                            )}
                          </div>
                        </Link>

                        {/* Expand/Collapse Button - Only if has children */}
                        {category.children && category.children.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category._id)}
                            className="p-3 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                          >
                            <motion.div
                              animate={{ rotate: expandedCategories.has(category._id) ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            </motion.div>
                          </button>
                        )}
                      </div>

                      {/* Child Categories */}
                      <AnimatePresence>
                        {expandedCategories.has(category._id) && category.children && category.children.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 mt-1 border-l-2 border-gray-200 overflow-hidden"
                          >
                            {category.children.map((child) => (
                              <Link
                                key={child._id}
                                href={`/categories/${child.slug}`}
                                onClick={onClose}
                              >
                                <motion.div
                                  className="flex items-center gap-3 p-3 pl-4 hover:bg-gray-50 active:bg-primary/5 transition-colors"
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {/* Child Category Image or Avatar */}
                                  <div className="relative w-8 h-8 flex-shrink-0">
                                    {child.image ? (
                                      <Image
                                        src={child.image}
                                        alt={child.name}
                                        fill
                                        className="object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-sandy to-primary rounded-lg flex items-center justify-center">
                                        <span className="text-white font-medium text-xs">
                                          {getInitials(child.name)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <Text size="md" weight="medium" className="text-gray-900">
                                      {child.name}
                                    </Text>
                                    {child.productCount !== undefined && (
                                      <Caption weight="normal" className="text-gray-600">
                                        {child.productCount} items
                                      </Caption>
                                    )}
                                  </div>

                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </motion.div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-6"
            >
              {/* Search */}
              <div className="relative space-x-2">
              <Search className="absolute z-10 left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search products..."
                  className="pl-10 h-12 border border-gray-300 focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
                  onClick={() => {
                    onClose();
                    dispatch(toggleSearch());
                  }}
                />
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <MobileMenuItem
                  href="/products"
                  icon={Package}
                  label="Products"
                  onClose={onClose}
                />
                <MobileMenuItem
                  href="/deals"
                  icon={Percent}
                  label="Deals"
                  onClose={onClose}
                />
                <MobileMenuItem
                  href="/wishlist"
                  icon={Heart}
                  label="Wishlist"
                  badge={wishlistCount}
                  onClose={onClose}
                />
                <MobileMenuItem
                  href="/cart"
                  icon={ShoppingBag}
                  label="Cart"
                  badge={itemCount}
                  onClose={onClose}
                />
                <MobileMenuItem
                  href="/blogs"
                  icon={BookOpen}
                  label="Blog"
                  onClose={onClose}
                />
                <MobileMenuItem
                  href="/contact"
                  icon={Phone}
                  label="Contact"
                  onClose={onClose}
                />
                <MobileMenuItem
                  href="/returns"
                  icon={RotateCcw}
                  label="Returns & Exchanges"
                  onClose={onClose}
                />
              </div>

              {/* User Section */}
              {session ? (
                <div className="border-t border-gray-200 pt-6 space-y-2">
                  <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-sandy/10 rounded-lg border border-primary/20">
                    <Text size="md" weight="medium" className="text-gray-900">
                      {session.user?.name}
                    </Text>
                    <Caption weight="normal" className="mt-1 text-gray-600">
                      {session.user?.email}
                    </Caption>
                  </div>
                  <MobileMenuItem
                    href="/profile"
                    icon={User}
                    label="Profile"
                    onClose={onClose}
                  />
                  {session.user?.role === 'admin' && (
                    <MobileMenuItem
                      href="/admin"
                      icon={Settings}
                      label="Admin Panel"
                      onClose={onClose}
                    />
                  )}
                  <button
                    onClick={() => {
                      onClose();
                      signOut();
                    }}
                    className="flex items-center w-full px-4 py-4 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                      <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <Text size="md" weight="medium" className="ml-3 text-red-600">
                      Sign Out
                    </Text>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-6">
                  <Link href="/auth/signin" onClick={onClose}>
                    <div className="flex items-center px-4 py-4 text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <Text size="md" weight="medium" className="ml-3 text-gray-900">
                        Sign In
                      </Text>
                    </div>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Mobile Menu Item Component
interface MobileMenuItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  onClose: () => void;
}

function MobileMenuItem({ href, icon: Icon, label, badge, onClose }: MobileMenuItemProps) {
  return (
    <Link href={href} onClick={onClose}>
      <motion.div
        className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-primary/5 rounded-lg transition-all duration-200 group"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary/10 transition-colors">
            <Icon className="h-5 w-5 text-gray-700 group-hover:text-primary transition-colors" />
          </div>
          <Text size="md" weight="medium" className="ml-3 text-gray-900">
            {label}
          </Text>
        </div>
        {badge !== undefined && badge > 0 && (
          <Caption weight="bold" className="bg-primary text-white px-2 py-1 rounded-full min-w-[20px] text-center">
            {badge}
          </Caption>
        )}
      </motion.div>
    </Link>
  );
}

