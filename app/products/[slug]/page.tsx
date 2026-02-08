import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import ProductPageClient from './ProductPageClient';
import Script from 'next/script';

const BASE_URL = 'https://www.wellrise.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return {
        title: 'Product Not Found | Muscari Mart',
        description: 'The food product you are looking for does not exist.',
      };
    }

    const productData = product as any;
    const title = productData.metaTitle || `${productData.name} | Muscari Mart`;
    const description = productData.metaDescription || productData.shortDescription || 
      (productData.description ? productData.description.substring(0, 160).replace(/<[^>]*>/g, '') : `Buy ${productData.name} at Muscari Mart. Premium quality sarees and women\'s wear.`);
    
    const images = productData.images && productData.images.length > 0 
      ? productData.images 
      : [productData.thumbnailImage];
    
    const price = productData.comparePrice && productData.comparePrice > productData.price 
      ? productData.comparePrice 
      : productData.price;
    
    const availability = productData.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    const categoryName = (productData.category as any)?.name || 'Organic Food';

    return {
      title,
      description,
      keywords: productData.seoKeywords || productData.tags || [productData.name, categoryName],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/products/${slug}`,
        siteName: 'Muscari Mart',
        images: images.slice(0, 4).map((img: string) => ({
          url: img,
          width: 1200,
          height: 630,
          alt: productData.name,
        })),
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [productData.thumbnailImage],
      },
      alternates: {
        canonical: `${BASE_URL}/products/${slug}`,
      },
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'BDT',
        'product:availability': availability,
        'product:condition': 'new',
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product | Muscari Mart',
      description: 'Browse our premium saree collection at Muscari Mart.',
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch product for structured data
  let product = null;
  try {
    await connectDB();
    product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .lean();
  } catch (error) {
    console.error('Error fetching product for structured data:', error);
  }

  return (
    <>
      {product && (() => {
        const productData = product as any;
        return (
          <Script
            id="product-schema"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": productData.name,
                "description": productData.shortDescription || (productData.description ? productData.description.replace(/<[^>]*>/g, '').substring(0, 500) : ''),
                "image": productData.images && productData.images.length > 0 ? productData.images : [productData.thumbnailImage],
                "sku": productData.sku,
                "brand": {
                  "@type": "Brand",
                  "name": "Muscari Mart"
                },
                "offers": {
                  "@type": "Offer",
                  "url": `${BASE_URL}/products/${slug}`,
                  "priceCurrency": "BDT",
                  "price": productData.price,
                  "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  "itemCondition": "https://schema.org/NewCondition",
                  "availability": productData.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  "seller": {
                    "@type": "Organization",
                    "name": "Muscari Mart"
                  }
                },
                "aggregateRating": productData.averageRating > 0 ? {
                  "@type": "AggregateRating",
                  "ratingValue": productData.averageRating,
                  "reviewCount": productData.totalReviews || 0,
                  "bestRating": "5",
                  "worstRating": "1"
                } : undefined,
                "category": (productData.category as any)?.name || "Organic Food",
                "additionalProperty": [
                  {
                    "@type": "PropertyValue",
                    "name": "Total Sales",
                    "value": productData.totalSales || 0
                  }
                ]
              })
            }}
          />
        );
      })()}
      <ProductPageClient />
    </>
  );
}

