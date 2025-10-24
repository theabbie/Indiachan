import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Boards } from '@/lib/db/boards';
import { Accounts } from '@/lib/db/accounts';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ board: string }> }
) {
  try {
    const { board: boardId } = await params;
    const session = await requireSession();
    const formData = await request.formData();
    const staffUsername = formData.get('username') as string;
    
    if (!staffUsername) {
      return NextResponse.json(
        { error: 'Username required' },
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
        { error: 'Only board owners can add staff' },
        { status: 403 }
      );
    }

    const staffAccount = await Accounts.findOne(staffUsername);
    if (!staffAccount) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (board.staff && board.staff[staffUsername]) {
      return NextResponse.json(
        { error: 'User is already staff' },
        { status: 400 }
      );
    }

    const defaultPermissions = Buffer.from([15, 0, 0, 0]).toString('base64');
    
    await Boards.addStaff(boardId, staffUsername, defaultPermissions, false);
    await Accounts.addStaffBoard(staffUsername, boardId);

    return NextResponse.redirect(new URL(`/${boardId}/manage/staff.html`, request.url));

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
