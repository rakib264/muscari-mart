import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CustomerFeedback from '@/lib/models/CustomerFeedback';

// GET - Fetch active customer feedback for public display
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6');

    const feedbacks = await CustomerFeedback.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit)
      .select('-__v')
      .lean();

    // Calculate time ago dynamically
    const feedbacksWithTimeAgo = feedbacks.map((feedback) => {
      const now = new Date();
      const createdAt = new Date(feedback.createdAt);
      const diffInHours = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      );

      let timeAgo = '';
      if (diffInHours < 1) {
        timeAgo = 'Just now';
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours}h`;
      } else if (diffInHours < 168) {
        // 7 days
        const days = Math.floor(diffInHours / 24);
        timeAgo = `${days}d`;
      } else {
        const weeks = Math.floor(diffInHours / 168);
        timeAgo = `${weeks}w`;
      }

      return {
        ...feedback,
        timeAgo,
      };
    });

    return NextResponse.json({ feedbacks: feedbacksWithTimeAgo });
  } catch (error: any) {
    console.error('Error fetching customer feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer feedback' },
      { status: 500 }
    );
  }
}

