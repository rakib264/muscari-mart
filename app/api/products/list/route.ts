import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Dedicated API endpoint for product listing with pagination
 * Optimized for progressive loading and future filter support
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Future filter support (ready for implementation)
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const inStock = searchParams.get('inStock') === 'true';

    const skip = (page - 1) * limit;

    // Build query - only active products
    const query: any = {
      isActive: true
    };

    // Category filter (future-ready)
    if (category) {
      const Category = (await import('@/lib/models/Category')).default;
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Price range filter (future-ready)
    if (minPrice > 0 || maxPrice < 999999) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    // Stock filter (future-ready)
    if (inStock) {
      query.quantity = { $gt: 0 };
    }

    // Fetch products with optimized fields (including quantity for UI functionality)
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .select('name slug price comparePrice thumbnailImage averageRating totalReviews quantity variants shortDescription images productSize category')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Return clean, optimized response
    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Products list API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        products: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0,
          hasMore: false
        }
      },
      { status: 500 }
    );
  }
}

