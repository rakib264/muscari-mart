import Product, { IProduct } from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { getSessionFromCookies } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Define confidential fields that should only be visible to admin/manager/super-admin
const CONFIDENTIAL_FIELDS = ['cost', 'sku', 'barcode', 'dimensions', 'totalSales'];

// Helper function to check if user has admin privileges
function hasAdminAccess(role: string): boolean {
  return ['admin', 'manager', 'super-admin'].includes(role);
}

// Helper function to filter confidential fields from product data
function filterProductData(product: any, hasAccess: boolean): any {
  if (hasAccess) {
    return product; // Return all fields for admin users
  }

  // Create a copy and remove confidential fields for public users
  const filtered = { ...product };
  CONFIDENTIAL_FIELDS.forEach(field => {
    delete filtered[field];
  });

  return filtered;
}

// Helper function to filter related products (keep quantity but remove sensitive fields for public users)
function filterRelatedProducts(products: any[], hasAccess: boolean): any[] {
  if (hasAccess) {
    return products; // Return all fields for admin users
  }

  // Remove only sensitive fields but keep quantity for UI functionality
  return products.map(product => {
    const { totalSales, ...publicFields } = product;
    return publicFields;
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await context.params;

    // Get user session to determine access level
    const session = await getSessionFromCookies();
    const userRole = session?.user?.role || '';
    const hasAccess = hasAdminAccess(userRole);

    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('reviews.user', 'firstName lastName')
      .lean() as IProduct | null;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
    .select('name slug price comparePrice thumbnailImage quantity averageRating totalReviews totalSales category')
    .populate('category', 'name slug')
    .limit(4)
    .lean();

    // Filter data based on user role
    const filteredProduct = filterProductData(product, hasAccess);
    const filteredRelatedProducts = filterRelatedProducts(relatedProducts, hasAccess);

    return NextResponse.json({
      product: filteredProduct,
      relatedProducts: filteredRelatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
