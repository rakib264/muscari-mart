import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.wellrise.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
          '/returns/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
          '/returns/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

