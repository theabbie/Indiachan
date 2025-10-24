import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { verifyTOTP } from '@/lib/totp';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code required' },
        { status: 400 }
      );
    }

    const account = await Accounts.findOne(session.user!);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (!account.twofactor) {
      return NextResponse.json(
        { error: 'Two-factor authentication not enabled' },
        { status: 400 }
      );
    }

    const delta = await verifyTOTP(account._id, account.twofactor, code);
    if (delta === null) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    await Accounts.updateTwofactor(account._id, null);

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled'
    });
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
