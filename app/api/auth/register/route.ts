import { NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';
import { verifyCaptcha } from '@/lib/captcha';
import { getClientIp } from '@/lib/ip';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, captcha } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const ip = await getClientIp();
    const identifier = getRateLimitIdentifier(ip);

    try {
      await checkRateLimit(identifier, 'register');
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    if (captcha) {
      try {
        await verifyCaptcha(captcha, ip);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    const result = await register(username, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
