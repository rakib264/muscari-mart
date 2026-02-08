import Advertisement from '@/lib/models/Advertisement';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'horizontal' or 'vertical'

    const query: any = { isActive: true };
    if (type) {
      query.type = type;
    }

    const advertisements = await Advertisement.find(query)
      .sort({ type: 1, position: 1 })
      .select('-__v')
      .lean();

    return NextResponse.json({
      success: true,
      advertisements
    });
  } catch (error) {
    console.error('Get public advertisements error:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}
