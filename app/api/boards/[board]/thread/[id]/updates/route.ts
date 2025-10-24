import { NextResponse } from 'next/server';
import { Posts } from '@/lib/db/posts';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ board: string; id: string }> }
) {
  try {
    const { board: boardId, id } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    
    const threadId = parseInt(id);
    const sincePostId = since ? parseInt(since) : 0;
    
    const replies = await Posts.getThreadReplies(boardId, threadId, sincePostId);
    
    return NextResponse.json({
      success: true,
      replies,
      count: replies.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
