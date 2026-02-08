import GeneralSettings from '@/lib/models/GeneralSettings';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// Public API endpoint for general settings
export async function GET() {
  try {
    await connectDB();

    // List of old hardcoded values that should be treated as empty and cleaned from database
    const OLD_HARDCODED_SITE_NAMES = [
      'TSR Gallery',
      'NextEcom',
      'TSRGallery'
    ];

    const OLD_HARDCODED_DESCRIPTIONS = [
      'Your Trusted Online Shopping Destination'
    ];

    // Get settings
    let settings = await GeneralSettings.findOne();
    if (!settings) {
      settings = await GeneralSettings.create({});
    }

    // Clean old hardcoded values from database (one-time cleanup)
    let needsUpdate = false;
    const updateData: any = {};

    if (settings.siteName && OLD_HARDCODED_SITE_NAMES.includes(settings.siteName.trim())) {
      updateData.siteName = '';
      needsUpdate = true;
    }

    if (settings.siteDescription && OLD_HARDCODED_DESCRIPTIONS.includes(settings.siteDescription.trim())) {
      updateData.siteDescription = '';
      needsUpdate = true;
    }

    // Update database if old values found
    if (needsUpdate) {
      await GeneralSettings.findByIdAndUpdate(settings._id, { $set: updateData });
      // Reload settings after update
      settings = await GeneralSettings.findById(settings._id);
      if (!settings) {
        settings = await GeneralSettings.create({});
      }
    }

    // Helper function to check if a value is an old hardcoded default
    const isOldHardcodedValue = (value: string | undefined, oldValues: string[]): boolean => {
      if (!value || value.trim() === '') return false;
      return oldValues.includes(value.trim());
    };

    // Clean siteName - treat old hardcoded values as empty
    const cleanSiteName = settings.siteName && !isOldHardcodedValue(settings.siteName, OLD_HARDCODED_SITE_NAMES)
      ? settings.siteName
      : '';

    // Clean siteDescription - treat old hardcoded values as empty
    const cleanSiteDescription = settings.siteDescription && !isOldHardcodedValue(settings.siteDescription, OLD_HARDCODED_DESCRIPTIONS)
      ? settings.siteDescription
      : '';

    // Return public-safe data with fallback to environment variables
    // Priority: Database (if not old hardcoded value) → Environment Variables → Empty
    const publicSettings = {
      siteName: cleanSiteName || process.env.NEXT_PUBLIC_SITE_NAME || '',
      siteDescription: cleanSiteDescription || process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
      siteUrl: settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '',
      contactEmail: settings.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
      contactPhone: settings.contactPhone || process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
      contactPerson: settings.contactPerson || '',
      address: settings.address || process.env.NEXT_PUBLIC_CONTACT_ADDRESS || '',
      logo1: settings.logo1 || '',
      logo2: settings.logo2 || '',
      favicon: settings.favicon || '',
      primaryColor: settings.primaryColor || process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#3949AB',
      secondaryColor: settings.secondaryColor || process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#10b981',
      location: settings.location || {
        address: '',
        latitude: 0,
        longitude: 0,
        formattedAddress: ''
      },
      socialLinks: settings.socialLinks || {},
      currency: settings.currency || process.env.NEXT_PUBLIC_CURRENCY || 'BDT',
      timezone: settings.timezone || process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Dhaka',
      language: settings.language || process.env.NEXT_PUBLIC_LANGUAGE || 'en',
    };

    // No caching - always return fresh data
    return NextResponse.json(publicSettings, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Public general settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch general settings' }, { status: 500 });
  }
}
