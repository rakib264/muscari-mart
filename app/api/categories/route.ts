import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - Get all active categories (excluding seed/default categories)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // List of seed/default category slugs that should be excluded
    const SEED_CATEGORY_SLUGS = [
      'electronics',
      'fashion',
      'home-living',
      'sports-fitness',
      'books-education',
      'health-beauty',
      'electronics-2',
      'mobile' // Child category of Electronics (seed)
    ];

    // First, get seed category IDs to exclude their children
    const seedCategories = await Category.find({ 
      slug: { $in: SEED_CATEGORY_SLUGS }
    }).select('_id').lean();
    
    const seedCategoryIds = seedCategories.map(cat => cat._id);

    // Fetch categories, excluding seed categories and their children
    const allCategories = await Category.find({ 
      isActive: true,
      slug: { $nin: SEED_CATEGORY_SLUGS }, // Exclude seed category slugs
      parent: { $nin: seedCategoryIds } // Exclude children of seed categories
    })
      .select('name slug description image parent sortOrder')
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Additional filter to ensure no categories with seed parent slugs in populated data
    const categories = allCategories.filter(cat => {
      // If category has a parent, check if parent slug is in seed list
      if (cat.parent && typeof cat.parent === 'object' && 'slug' in cat.parent) {
        return !SEED_CATEGORY_SLUGS.includes(cat.parent.slug);
      }
      return true;
    });

    return NextResponse.json({
      categories: categories || []
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

