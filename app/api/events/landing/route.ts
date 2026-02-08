import Event from '@/lib/models/Event';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const now = new Date();

    // Query for events that should be shown on landing page
    // Only show active events (not expired or upcoming) that have showInLanding enabled
    const query: any = {
      isActive: true,
      showInLanding: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    const events = await Event.find(query)
      .populate('products', 'name thumbnailImage price comparePrice slug averageRating totalReviews isActive quantity')
      .sort({ startDate: -1 }) // Most recent first
      .limit(5) // Limit to 5 events on landing page
      .lean();

    // Filter out inactive products and add computed status
    const eventsWithStatus = events.map((event: any) => {
      // Filter to only include active products
      const activeProducts = (event.products || []).filter((product: any) => product.isActive);

      // Compute status
      let computedStatus = 'inactive';
      if (event.isActive) {
        if (now < new Date(event.startDate)) {
          computedStatus = 'upcoming';
        } else if (now > new Date(event.endDate)) {
          computedStatus = 'expired';
        } else {
          computedStatus = 'active';
        }
      }

      return {
        ...event,
        products: activeProducts,
        productsCount: activeProducts.length,
        status: computedStatus
      };
    });

    // Only return events that have at least 1 active product
    const validEvents = eventsWithStatus.filter((event: any) => event.products.length > 0);

    return NextResponse.json({
      events: validEvents,
      total: validEvents.length
    });
  } catch (error) {
    console.error('Landing events API error:', error);
    return NextResponse.json({ error: 'Failed to fetch landing events' }, { status: 500 });
  }
}
