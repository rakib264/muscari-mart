'use client';

import { Button } from '@/components/ui/button';
import EventPreview from '@/components/events/EventPreview';
import { Display, Text } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Event {
  _id: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
  discountText: string;
  layoutType?: 'horizontal' | 'vertical';
  cta?: {
    label: string;
    url: string;
    openInNewTab: boolean;
  };
  startDate: string;
  endDate: string;
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    thumbnailImage?: string;
    averageRating?: number;
    totalReviews?: number;
    quantity?: number;
  }>;
  productsCount: number;
  isActive: boolean;
  status: 'active' | 'upcoming' | 'expired' | 'inactive';
  showInLanding: boolean;
}

export default function LandingEvents({
  title = 'Special Events & Deals',
}: {
  title?: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingEvents();
  }, []);

  const fetchLandingEvents = async () => {
    try {
      const response = await fetch('/api/events/landing');
      if (!response.ok) throw new Error('Failed to fetch landing events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching landing events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-gray-200 h-48 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-row items-center justify-between mb-12"
        >
          {/* Left side - Title */}
          <div className="text-center lg:text-left">
            <Display size="lg" weight="bold" className="text-gray-900">
              {title}
            </Display>
          </div>

          {/* Right side - View All Button */}
          <div className="flex justify-end flex-shrink-0">
            <Link href="/deals">
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


        {/* Events Display */}
        { events && events?.length > 0 && (
          <>
            <div className="space-y-12">
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <EventPreview event={event} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
