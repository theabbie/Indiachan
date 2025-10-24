import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';

export async function GET() {
  try {
    const username = await getSessionUser();

    if (!username) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const account = await Accounts.findOne(username);

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username: account._id,
      original: account.original,
      ownedBoards: account.ownedBoards || [],
      staffBoards: account.staffBoards || [],
      permissions: account.permissions
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
