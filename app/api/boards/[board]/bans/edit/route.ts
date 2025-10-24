import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Boards } from '@/lib/db/boards';
import { Accounts } from '@/lib/db/accounts';
import { Bans } from '@/lib/db/bans';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ board: string }> }
) {
  try {
    const { board: boardId } = await params;
    const session = await requireSession();
    const formData = await request.formData();
    
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
    const isStaff = account.staffBoards?.includes(boardId);

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: 'No permission' },
        { status: 403 }
      );
    }

    const checkedBans = formData.getAll('checkedbans');
    const option = formData.get('option');

    if (!checkedBans || checkedBans.length === 0) {
      return NextResponse.json(
        { error: 'No bans selected' },
        { status: 400 }
      );
    }

    const banIds = checkedBans.map(id => String(id));

    switch (option) {
      case 'unban':
        await Bans.removeMany(boardId, banIds);
        return NextResponse.redirect(new URL(`/${boardId}/manage/bans.html`, request.url));

      case 'deny_appeal':
        await Bans.denyAppeals(banIds);
        return NextResponse.redirect(new URL(`/${boardId}/manage/bans.html`, request.url));

      case 'edit_duration':
        const duration = parseInt(formData.get('ban_duration') as string);
        if (isNaN(duration)) {
          return NextResponse.json(
            { error: 'Invalid duration' },
            { status: 400 }
          );
        }
        await Bans.editDuration(banIds, duration);
        return NextResponse.redirect(new URL(`/${boardId}/manage/bans.html`, request.url));

      case 'edit_reason':
        const reason = formData.get('ban_reason') as string;
        if (!reason) {
          return NextResponse.json(
            { error: 'Reason required' },
            { status: 400 }
          );
        }
        await Bans.editReason(banIds, reason);
        return NextResponse.redirect(new URL(`/${boardId}/manage/bans.html`, request.url));

      default:
        return NextResponse.json(
          { error: 'Invalid option' },
          { status: 400 }
        );
    }

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
