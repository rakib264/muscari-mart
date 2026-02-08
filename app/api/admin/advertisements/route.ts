import { auth } from '@/lib/auth';
import AuditLog from '@/lib/models/AuditLog';
import Advertisement from '@/lib/models/Advertisement';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'horizontal' or 'vertical'

    const query: any = {};
    if (type) {
      query.type = type;
    }

    const advertisements = await Advertisement.find(query)
      .sort({ type: 1, position: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      advertisements
    });
  } catch (error) {
    console.error('Get advertisements error:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();

    // Validation
    const errors: string[] = [];

    if (!data.type || !['horizontal', 'vertical'].includes(data.type)) {
      errors.push('Valid type (horizontal or vertical) is required');
    }

    if (!data.position || data.position < 1) {
      errors.push('Valid position is required');
    }

    if (data.type === 'horizontal' && data.position > 2) {
      errors.push('Horizontal advertisements can only have positions 1 or 2');
    }

    if (data.type === 'vertical' && data.position > 3) {
      errors.push('Vertical advertisements can only have positions 1, 2, or 3');
    }

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.bannerImage || data.bannerImage.trim().length === 0) {
      errors.push('Banner image is required');
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

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    // Check if position is already taken
    const existingAd = await Advertisement.findOne({
      type: data.type,
      position: data.position
    });

    if (existingAd) {
      return NextResponse.json({
        error: 'Position already occupied',
        details: [`Position ${data.position} for ${data.type} advertisement is already taken`]
      }, { status: 400 });
    }

    // Prepare data
    const adData: any = {
      type: data.type,
      position: data.position,
      title: data.title.trim(),
      bannerImage: data.bannerImage.trim(),
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    if (data.badgeTitle) {
      adData.badgeTitle = data.badgeTitle.trim();
    }

    if (data.discountText) {
      adData.discountText = data.discountText.trim();
    }

    if (data.cta && data.cta.label && data.cta.url) {
      adData.cta = {
        label: data.cta.label.trim(),
        url: data.cta.url.trim()
      };
    }

    const advertisement = await Advertisement.create(adData);

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'CREATE',
      resource: 'Advertisement',
      resourceId: advertisement._id.toString(),
      metadata: {
        type: advertisement.type,
        position: advertisement.position,
        title: advertisement.title
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Advertisement created successfully',
      advertisement
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create advertisement error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create advertisement',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Advertisement ID is required' }, { status: 400 });
    }

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    await Advertisement.findByIdAndDelete(id);

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'DELETE',
      resource: 'Advertisement',
      resourceId: id,
      metadata: {
        type: advertisement.type,
        position: advertisement.position,
        title: advertisement.title
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Delete advertisement error:', error);
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 });
  }
}
