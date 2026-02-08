import type { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import EventPageClient from './EventPageClient';
import Script from 'next/script';

const BASE_URL = 'https://www.wellrise.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  try {
    await connectDB();
    const event = await Event.findOne({ _id: id, isActive: true }).lean();

    if (!event) {
      return {
        title: 'Event Not Found | Muscari Mart',
        description: 'The event you are looking for does not exist.',
      };
    }

    const eventData = event as any;
    const title = `${eventData.title} | Muscari Mart Events`;
    const description = eventData.subtitle || eventData.discountText || 
      `Don't miss ${eventData.title} at Muscari Mart. Special offers and discounts on premium sarees.`;
    
    const startDate = new Date(eventData.startDate).toISOString();
    const endDate = new Date(eventData.endDate).toISOString();
    const now = new Date();
    const eventStatus = now < eventData.startDate ? 'upcoming' : 
                        now > eventData.endDate ? 'expired' : 'active';

    return {
      title,
      description,
      keywords: ['Muscari Mart', 'events', 'sarees', 'discounts', 'sales'],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/events/${id}`,
        siteName: 'Muscari Mart',
        images: eventData.bannerImage ? [
          {
            url: eventData.bannerImage,
            width: 1200,
            height: 630,
            alt: eventData.title,
          },
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: eventData.bannerImage ? [eventData.bannerImage] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/events/${id}`,
      },
    };
  } catch (error) {
    console.error('Error generating event metadata:', error);
    return {
      title: 'Event | Muscari Mart',
      description: 'Discover our latest events and special offers at Muscari Mart.',
    };
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch event for structured data
  let event = null;
  try {
    await connectDB();
    event = await Event.findOne({ _id: id, isActive: true }).lean();
  } catch (error) {
    console.error('Error fetching event for structured data:', error);
  }

  return (
    <>
      {event && (() => {
        const eventData = event as any;
        return (
          <Script
            id="event-schema"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                "name": eventData.title,
                "description": eventData.subtitle || eventData.discountText || eventData.title,
                "image": eventData.bannerImage ? [eventData.bannerImage] : [],
                "startDate": new Date(eventData.startDate).toISOString(),
                "endDate": new Date(eventData.endDate).toISOString(),
                "eventStatus": "https://schema.org/EventScheduled",
                "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
                "location": {
                  "@type": "VirtualLocation",
                  "url": `${BASE_URL}/events/${id}`
                },
                "organizer": {
                  "@type": "Organization",
                  "name": "Muscari Mart",
                  "url": BASE_URL
                },
                "offers": {
                  "@type": "Offer",
                  "url": `${BASE_URL}/events/${id}`,
                  "price": "0",
                  "priceCurrency": "BDT",
                  "availability": "https://schema.org/InStock",
                  "validFrom": new Date(eventData.startDate).toISOString(),
                  "validThrough": new Date(eventData.endDate).toISOString()
                }
              })
            }}
          />
        );
      })()}
      <EventPageClient params={Promise.resolve({ id })} />
    </>
  );
}

