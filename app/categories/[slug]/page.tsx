import type { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import CategoryPageClient from "./CategoryPageClient";
import Script from "next/script";

const BASE_URL = process.env.NODE_ENV === 'production' ? "https://muscarimart.com" : "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    await connectDB();
    const category = await Category.findOne({ slug, isActive: true })
      .populate("parent", "name slug")
      .lean();

    if (!category) {
      return {
        title: "Category Not Found | Muscari Mart",
        description: "The food category you are looking for does not exist.",
      };
    }

    const categoryData = category as any;
    const title =
      categoryData.metaTitle || `${categoryData.name} | Muscari Mart`;
    const description =
      categoryData.metaDescription ||
      categoryData.description ||
      `Browse ${categoryData.name} at Muscari Mart. Premium quality sarees and women\'s wear collection.`;

    const parentCategory = (categoryData.parent as any)?.name;
    const breadcrumbs = parentCategory
      ? [
          { name: "Home", url: BASE_URL },
          { name: "Categories", url: `${BASE_URL}/categories` },
          {
            name: parentCategory,
            url: `${BASE_URL}/categories/${(categoryData.parent as any).slug}`,
          },
          { name: categoryData.name, url: `${BASE_URL}/categories/${slug}` },
        ]
      : [
          { name: "Home", url: BASE_URL },
          { name: "Categories", url: `${BASE_URL}/categories` },
          { name: categoryData.name, url: `${BASE_URL}/categories/${slug}` },
        ];

    return {
      title,
      description,
      keywords: [
        categoryData.name,
        "sarees",
        "women's wear",
        "premium",
        "Muscari Mart",
      ],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/categories/${slug}`,
        siteName: "Muscari Mart",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: `${BASE_URL}/categories/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating category metadata:", error);
    return {
      title: "Category | Muscari Mart",
      description: "Browse our saree categories at Muscari Mart.",
    };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch category for structured data
  let category = null;
  try {
    await connectDB();
    category = await Category.findOne({ slug, isActive: true })
      .populate("parent", "name slug")
      .lean();
  } catch (error) {
    console.error("Error fetching category for structured data:", error);
  }

  return (
    <>
      {category &&
        (() => {
          const categoryData = category as any;
          return (
            <Script
              id="category-breadcrumb-schema"
              type="application/ld+json"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: BASE_URL,
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Categories",
                      item: `${BASE_URL}/categories`,
                    },
                    ...(categoryData.parent
                      ? [
                          {
                            "@type": "ListItem",
                            position: 3,
                            name: (categoryData.parent as any).name,
                            item: `${BASE_URL}/categories/${(categoryData.parent as any).slug}`,
                          },
                        ]
                      : []),
                    {
                      "@type": "ListItem",
                      position: categoryData.parent ? 4 : 3,
                      name: categoryData.name,
                      item: `${BASE_URL}/categories/${slug}`,
                    },
                  ],
                }),
              }}
            />
          );
        })()}
      <CategoryPageClient />
    </>
  );
}
