import { NextResponse } from 'next/server';
import { Accounts } from '@/lib/db/accounts';
import bcrypt from 'bcryptjs';
import { verifyCaptcha } from '@/lib/captcha';
import { getClientIp } from '@/lib/ip';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const newpassword = formData.get('newpassword') as string;
    const newpasswordconfirm = formData.get('newpasswordconfirm') as string;
    const twofactor = formData.get('twofactor') as string;

    if (!username || !password || !newpassword || !newpasswordconfirm) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      );
    }

    if (newpassword !== newpasswordconfirm) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }

    if (newpassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const account = await Accounts.findOne(username);
    if (!account) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 403 }
      );
    }

    const validPassword = await bcrypt.compare(password, account.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 403 }
      );
    }

    if (account.twofactor && twofactor) {
      const { verifyTOTP } = await import('@/lib/totp');
      const valid = await verifyTOTP(username, account.twofactor, twofactor);
      if (valid === null) {
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 403 }
        );
      }
    } else if (account.twofactor && !twofactor) {
      return NextResponse.json(
        { error: '2FA code required' },
        { status: 403 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newpassword, 12);
    await Accounts.updatePassword(username, newPasswordHash);

    return NextResponse.redirect(new URL('/login.html?changed=1', request.url));

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
