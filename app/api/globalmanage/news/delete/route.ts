import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { News } from '@/lib/db/news';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    
    const checkedNews = formData.getAll('checkednews');

    if (!checkedNews || checkedNews.length === 0) {
      return NextResponse.json(
        { error: 'No news selected' },
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

    const newsIds = checkedNews.map(id => String(id));
    await News.deleteMany(newsIds);

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
