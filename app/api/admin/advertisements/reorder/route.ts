import { auth } from '@/lib/auth';
import AuditLog from '@/lib/models/AuditLog';
import Advertisement from '@/lib/models/Advertisement';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface ReorderItem {
  _id: string;
  position: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { type, items }: { type: 'horizontal' | 'vertical'; items: ReorderItem[] } = await request.json();

    // Validation
    if (!type || !['horizontal', 'vertical'].includes(type)) {
      return NextResponse.json({ error: 'Valid type is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const maxPosition = type === 'horizontal' ? 2 : 3;

    // Validate positions
    const positions = items.map(item => item.position);
    const uniquePositions = new Set(positions);

    if (positions.length !== uniquePositions.size) {
      return NextResponse.json({ error: 'Duplicate positions detected' }, { status: 400 });
    }

    for (const item of items) {
      if (item.position < 1 || item.position > maxPosition) {
        return NextResponse.json({
          error: `Invalid position ${item.position} for ${type} advertisement`
        }, { status: 400 });
      }
    }

    // Update all positions in a transaction-like manner
    const updates = items.map(item =>
      Advertisement.findByIdAndUpdate(
        item._id,
        { position: item.position },
        { new: true }
      )
    );

    await Promise.all(updates);

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'UPDATE',
      resource: 'Advertisement',
      resourceId: 'bulk',
      metadata: {
        type,
        action: 'reorder',
        itemsCount: items.length
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Advertisements reordered successfully'
    });

  } catch (error: any) {
    console.error('Reorder advertisements error:', error);
    return NextResponse.json({
      error: 'Failed to reorder advertisements',
      details: error.message
    }, { status: 500 });
  }
}
