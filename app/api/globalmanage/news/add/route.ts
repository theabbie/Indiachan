import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { News } from '@/lib/db/news';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message required' },
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

    await News.insertOne({
      title,
      message: {
        raw: message,
        markdown: message
      },
      date: new Date(),
      edited: null
    });

    return NextResponse.redirect(new URL('/globalmanage/news.html', request.url));

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
