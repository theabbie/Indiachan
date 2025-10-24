import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await logout();
    return NextResponse.redirect(new URL('/', request.url), 303);
  } catch (error: any) {
    return NextResponse.redirect(new URL('/', request.url), 303);
  }
}
