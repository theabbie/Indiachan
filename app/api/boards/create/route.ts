import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Boards } from '@/lib/db/boards';
import { Accounts } from '@/lib/db/accounts';
import { Binary } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    const uri = formData.get('uri') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!uri || !name) {
      return NextResponse.json(
        { error: 'Board URI and name required' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9]+$/.test(uri)) {
      return NextResponse.json(
        { error: 'Board URI must be lowercase alphanumeric' },
        { status: 400 }
      );
    }

    if (uri.length < 1 || uri.length > 10) {
      return NextResponse.json(
        { error: 'Board URI must be 1-10 characters' },
        { status: 400 }
      );
    }

    const existing = await Boards.findOne(uri);
    if (existing) {
      return NextResponse.json(
        { error: 'Board already exists' },
        { status: 400 }
      );
    }

    const defaultSettings = {
      name,
      description: description || '',
      defaultName: 'Anonymous',
      forceAnon: false,
      sageOnlyEmail: false,
      forceThreadSubject: false,
      forceThreadMessage: true,
      forceReplyMessage: false,
      forceThreadFile: false,
      forceReplyFile: false,
      minThreadMessageLength: 0,
      maxThreadMessageLength: 10000,
      minReplyMessageLength: 0,
      maxReplyMessageLength: 10000,
      maxFiles: 3,
      allowedFileTypes: {
        image: true,
        video: true,
        audio: true,
        other: false,
      },
      userPostSpoiler: true,
      userPostDelete: true,
      userPostUnlink: true,
      customFlags: false,
      geoFlags: false,
      enableTegaki: false,
      enableWeb3: false,
      captchaMode: 0,
      replyLimit: 500,
      theme: 'yotsuba-b',
      codeTheme: 'ir-black',
      language: 'en-GB',
      unlistedLocal: false,
      ids: false,
      reverseImageSearchLinks: false,
    };

    const ownerPermissions = Buffer.from([255, 255, 255, 255]).toString('base64');

    await Boards.insertOne({
      _id: uri,
      owner: session.user!,
      settings: defaultSettings,
      flags: {},
      banners: [],
      staff: {},
      lastPostTimestamp: new Date(),
    });

    await Boards.addStaff(uri, session.user!, ownerPermissions, true);

    await Accounts.addOwnedBoard(session.user!, uri);

    return NextResponse.redirect(new URL(`/${uri}/index.html`, request.url));
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
