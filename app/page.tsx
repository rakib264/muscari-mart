import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import Script from "next/script";

const BASE_URL = "https://www.muscarimart.store";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Muscari Mart",
    description:
      "Muscari Mart is a women’s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.",
    openGraph: {
      title: "Muscari Mart",
      description:
        "Muscari Mart is a women’s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.",
      url: BASE_URL,
      siteName: "Muscari Mart",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "Muscari Mart - Women’s Wear Brand, Luxury, Trendy, and Casual Sarees",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Muscari Mart",
      description:
        "Muscari Mart is a women wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.",
      images: ["/logo.png"],
    },
    alternates: {
      canonical: BASE_URL,
    },
  };
}

export default function Home() {
  return (
    <>
      {/* Structured Data - Home Page */}
      <Script
        id="home-page-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Muscari Mart",
            description:
              "Muscari Mart is a women’s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.",
            url: BASE_URL,
            inLanguage: "en-US",
            isPartOf: {
              "@type": "WebSite",
              name: "Muscari Mart",
              url: BASE_URL,
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: BASE_URL,
                },
              ],
            },
          }),
        }}
      />
      <HomeClient />
    </>
  );
}
