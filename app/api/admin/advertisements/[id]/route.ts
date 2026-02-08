import { auth } from '@/lib/auth';
import AuditLog from '@/lib/models/AuditLog';
import Advertisement from '@/lib/models/Advertisement';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const advertisement = await Advertisement.findById(id).lean();

    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      advertisement
    });
  } catch (error) {
    console.error('Get advertisement error:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisement' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const existingAd = await Advertisement.findById(id);
    if (!existingAd) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    const data = await request.json();

    // Validation
    const errors: string[] = [];

    if (data.title && data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    }

    if (data.bannerImage && data.bannerImage.trim().length === 0) {
      errors.push('Banner image cannot be empty');
    }

    // Validate CTA if provided
    if (data.cta) {
      if (!data.cta.label || data.cta.label.trim().length === 0) {
        errors.push('CTA label is required when CTA is provided');
      }
      if (!data.cta.url || data.cta.url.trim().length === 0) {
        errors.push('CTA URL is required when CTA is provided');
      }
    }

    // If position is being changed, swap positions with conflicting ad
    let swappedAd = null;
    if (data.position && data.position !== existingAd.position) {
      const conflictingAd = await Advertisement.findOne({
        _id: { $ne: id },
        type: existingAd.type,
        position: data.position
      });

      if (conflictingAd) {
        // Swap positions: move conflicting ad to the old position
        swappedAd = await Advertisement.findByIdAndUpdate(
          conflictingAd._id,
          { position: existingAd.position },
          { new: true }
        );
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};

    if (data.position) updateData.position = data.position;
    if (data.title) updateData.title = data.title.trim();
    if (data.bannerImage) updateData.bannerImage = data.bannerImage.trim();
    if (data.badgeTitle !== undefined) updateData.badgeTitle = data.badgeTitle ? data.badgeTitle.trim() : undefined;
    if (data.discountText !== undefined) updateData.discountText = data.discountText ? data.discountText.trim() : undefined;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.cta && data.cta.label && data.cta.url) {
      updateData.cta = {
        label: data.cta.label.trim(),
        url: data.cta.url.trim()
      };
    } else if (data.cta === null) {
      updateData.cta = undefined;
    }

    const updatedAd = await Advertisement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'UPDATE',
      resource: 'Advertisement',
      resourceId: id,
      metadata: {
        type: updatedAd?.type,
        position: updatedAd?.position,
        title: updatedAd?.title
      }
    });

    return NextResponse.json({
      success: true,
      message: swappedAd
        ? `Advertisement updated successfully. Position swapped with another ad.`
        : 'Advertisement updated successfully',
      advertisement: updatedAd,
      swappedAd: swappedAd || undefined
    });

  } catch (error: any) {
    console.error('Update advertisement error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update advertisement',
      details: error.message
    }, { status: 500 });
  }
}
