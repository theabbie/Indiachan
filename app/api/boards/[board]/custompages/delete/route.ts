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
    
    const checkedPages = formData.getAll('checkedpages');

    if (!checkedPages || checkedPages.length === 0) {
      return NextResponse.json(
        { error: 'No pages selected' },
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
        { error: 'Only board owners can delete custom pages' },
        { status: 403 }
      );
    }

    const pageNames = checkedPages.map(p => String(p));
    await CustomPages.deleteMany(pageNames, boardId);

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
