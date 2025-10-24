import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { generateTOTPSecret, generateTOTPUri, verifyTOTP } from '@/lib/totp';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { code } = body;

    const account = await Accounts.findOne(session.user!);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.twofactor) {
      return NextResponse.json(
        { error: 'Two-factor authentication already enabled' },
        { status: 400 }
      );
    }

    if (!code) {
      const secret = generateTOTPSecret();
      const uri = generateTOTPUri(account._id, secret);
      const qrcode = await QRCode.toDataURL(uri);

      return NextResponse.json({
        secret,
        qrcode,
        uri
      });
    }

    const tempSecret = body.secret;
    if (!tempSecret) {
      return NextResponse.json(
        { error: 'Secret required for verification' },
        { status: 400 }
      );
    }

    const delta = await verifyTOTP(account._id, tempSecret, code);
    if (delta === null) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    await Accounts.updateTwofactor(account._id, tempSecret);

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled'
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
