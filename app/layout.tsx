import ClientOnly from '@/components/providers/ClientOnly';
import { AutoStartup, FaviconProvider, NextAuthProvider, ShoppingBasket, ThemeProvider, Toaster } from '@/components/providers/ClientProviders';
import StoreProvider from '@/lib/providers/StoreProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.muscarimart.com'),
  title: {
    default: 'Muscari Mart',
    template: '%s | Muscari Mart'
  },
  description: 'Muscari Mart is a women’s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide..',
  keywords: [
    'Muscari Mart',
    'women\'s wear Bangladesh',
    'luxury sarees',
    'trendy sarees',
    'casual sarees',
    'premium sarees',
    'elegant designs',
    'women\'s fashion',
    'saree collection',
    'Bangladesh fashion',
    'online saree shopping',
    'women\'s clothing Bangladesh',
  ],
  authors: [{ name: 'Muscari Mart' }],
  creator: 'Muscari Mart',
  publisher: 'Muscari Mart',
  category: 'Women\'s Fashion & Clothing',
  classification: 'Fashion & Apparel',
  applicationName: 'Muscari Mart',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Muscari Mart',
    title: 'Muscari Mart - Premium Women\'s Sarees',
    description: 'Muscari Mart is a women’s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide..',
    url: 'https://www.muscarimart.com',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Muscari Mart - Premium Women\'s Sarees',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['bn_BD'],
    countryName: 'Bangladesh',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@muscarimart',
    creator: '@muscarimart',
    title: 'Muscari Mart - Premium Women\'s Sarees',
    description: 'Muscari Mart is a women\'s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.',
    images: {
      url: '/logo.png',
      alt: 'Muscari Mart - Premium Women\'s Sarees',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'wrOspiyoBW1XKkXx0Rb_vNpPe539pPXeVLv6vu-1HBI',
  },
  alternates: {
    canonical: 'https://www.muscarimart.com',
    languages: {
      'en-US': 'https://www.muscarimart.com',
      'bn-BD': 'https://www.muscarimart.com/bn',
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />

        {/* Structured Data for LocalBusiness */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "Fashion Store"],
              "name": "Muscari Mart",
              "alternateName": "Muscari Mart Bangladesh",
              "description": "Muscari Mart is a women\'s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.",
              "url": "https://www.muscarimart.com",
              "logo": "https://www.muscarimart.com/logo.png",
              "image": "https://www.muscarimart.com/logo.png",
              "telephone": "+880-XXX-XXXXXX", // Replace with actual phone
              "email": "info@muscarimart.com", // Replace with actual email
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address", // Replace with actual address
                "addressLocality": "Dhaka", // Replace with actual city
                "addressRegion": "Dhaka Division", // Replace with actual region
                "postalCode": "1000", // Replace with actual postal code
                "addressCountry": "BD"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 23.8103, // Replace with actual coordinates
                "longitude": 90.4125 // Replace with actual coordinates
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                ],
                "opens": "09:00",
                "closes": "21:00"
              },
              "sameAs": [
                "https://www.facebook.com/muscarimart", // Replace with actual social media links
                "https://www.instagram.com/muscarimart",
                "https://www.twitter.com/muscarimart"
              ],
              "priceRange": "$$",
              "servesCuisine": null,
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Women's Sarees",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Premium Quality Sarees"
                    }
                  }
                ]
              }
            })
          }}
        />

        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Muscari Mart",
              "alternateName": ["Muscari Mart", "Muscari Mart Bangladesh"],
              "url": "https://www.muscarimart.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.muscarimart.com/logo.png",
                "width": 400,
                "height": 400
              },
              "image": "https://www.muscarimart.com/logo.png",
              "description": "Muscari Mart is a women\'s wear brand specializing in luxury, trendy, and casual sarees, delivering premium quality and elegant designs for customers in Bangladesh and worldwide.",
              "foundingDate": "2020", // Replace with actual founding date
              "founders": [
                {
                  "@type": "Person",
                  "name": "Muscari Mart Team"
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address", // Replace with actual address
                "addressLocality": "Dhaka",
                "addressRegion": "Dhaka Division",
                "postalCode": "1000",
                "addressCountry": "BD"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+880-XXX-XXXXXX", // Replace with actual phone
                "contactType": "customer service",
                "availableLanguage": ["English", "Bengali"]
              },
              "sameAs": [
                "https://www.facebook.com/muscarimart",
                "https://www.instagram.com/muscarimart",
                "https://www.twitter.com/muscarimart"
              ]
            })
          }}
        />

        {/* Website Schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Muscari Mart",
              "alternateName": "Muscari Mart",
              "url": "https://www.muscarimart.com",
              "description": "Muscari Mart - Premium Women's Sarees.",
              "publisher": {
                "@type": "Organization",
                "name": "Muscari Mart"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.muscarimart.com/products?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        <Script
          id="hydration-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration mismatches
              if (typeof window !== 'undefined') {
                window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
                window.__NEXT_DATA__.props = window.__NEXT_DATA__.props || {};
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider>
            <StoreProvider>
              {children}
              <ClientOnly>
                <ShoppingBasket />
              </ClientOnly>
              <ClientOnly>
                <Toaster />
              </ClientOnly>
              <ClientOnly>
                <FaviconProvider />
              </ClientOnly>
              <ClientOnly>
                <AutoStartup />
              </ClientOnly>
            </StoreProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
