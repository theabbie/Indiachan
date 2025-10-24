import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Boards } from '@/lib/db/boards';
import { Accounts } from '@/lib/db/accounts';
import { CustomPages } from '@/lib/db/custompages';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ board: string }> }
) {
  try {
    const { board: boardId } = await params;
    const session = await requireSession();
    const formData = await request.formData();
    
    const page = formData.get('page') as string;
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;

    if (!page || !title || !message) {
      return NextResponse.json(
        { error: 'Page name, title, and message required' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(page)) {
      return NextResponse.json(
        { error: 'Page name must be alphanumeric with dashes and underscores only' },
        { status: 400 }
      );
    }

    const board = await Boards.findOne(boardId);
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    const account = await Accounts.findOne(session.user!);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const isOwner = account.ownedBoards?.includes(boardId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Only board owners can add custom pages' },
        { status: 403 }
      );
    }

    const existing = await CustomPages.findOne(boardId, page);
    if (existing) {
      return NextResponse.json(
        { error: 'Page already exists' },
        { status: 400 }
      );
    }

    await CustomPages.insertOne({
      board: boardId,
      page,
      title,
      message: {
        raw: message,
        markdown: message
      },
      date: new Date(),
      edited: null
    });

    return NextResponse.redirect(new URL(`/${boardId}/manage/custompages.html`, request.url));

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
