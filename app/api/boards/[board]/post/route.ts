import { NextResponse } from 'next/server';
import { Boards } from '@/lib/db/boards';
import { Posts } from '@/lib/db/posts';
import { getClientIp } from '@/lib/ip';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';
import { verifyCaptcha } from '@/lib/captcha';
import { uploadFile, validateImageFile } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ board: string }> }
) {
  try {
    const { board: boardId } = await params;
    const board = await Boards.findOne(boardId);
    
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }
    const thread = formData.get('thread') as string | null;
    const name = formData.get('name') as string || board.settings.defaultName;
    const email = formData.get('email') as string || '';
    const subject = formData.get('subject') as string || '';
    const message = formData.get('message') as string || '';
    const captcha = formData.get('captcha') as string || '';
    const files = formData.getAll('file') as File[];

    const ip = await getClientIp();
    const identifier = getRateLimitIdentifier(ip);

    const isThread = !thread;
    const action = isThread ? 'thread' : 'post';

    try {
      await checkRateLimit(identifier, action);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    const messageRequired = (isThread && board.settings.forceThreadMessage) || 
                           (!isThread && board.settings.forceReplyMessage);
    const subjectRequired = isThread && board.settings.forceThreadSubject;

    if (messageRequired && !message) {
      return NextResponse.json(
        { error: 'Message required' },
        { status: 400 }
      );
    }

    if (subjectRequired && !subject) {
      return NextResponse.json(
        { error: 'Subject required' },
        { status: 400 }
      );
    }

    if (((board.settings.captchaMode === 1 && isThread) || board.settings.captchaMode === 2) && captcha) {
      try {
        await verifyCaptcha(captcha, ip);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    const uploadedFiles: any[] = [];
    const validFiles = files.filter(f => f && f.size > 0);
    
    if (validFiles.length > 0) {
      if (validFiles.length > (board.settings.maxFiles || 1)) {
        return NextResponse.json(
          { error: `Maximum ${board.settings.maxFiles || 1} file(s) allowed` },
          { status: 400 }
        );
      }

      for (const file of validFiles) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }

        try {
          const timestamp = Date.now();
          const filename = `${boardId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          const url = await uploadFile(file, filename);
          
          uploadedFiles.push({
            filename,
            originalFilename: file.name,
            url,
            size: file.size,
            mimetype: file.type,
          });
        } catch (error: any) {
          return NextResponse.json(
            { error: error.message || 'Image upload failed' },
            { status: 500 }
          );
        }
      }
    }

    const fileRequired = (isThread && board.settings.forceThreadFile) || 
                        (!isThread && board.settings.forceReplyFile);
    
    if (fileRequired && uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'File required' },
        { status: 400 }
      );
    }

    const postId = Math.floor(Math.random() * 1000000);

    const post = {
      board: boardId,
      postId,
      thread: thread ? parseInt(thread) : null,
      name,
      email,
      subject,
      message,
      nomarkup: message.replace(/<[^>]*>/g, ''),
      date: new Date().toISOString(),
      files: uploadedFiles,
      spoiler: false,
      ip: {
        cloak: ip,
        raw: ip,
      },
      replyposts: 0,
      replyfiles: 0,
      sticky: false,
      locked: false,
      cyclic: false,
      saged: false,
      bumped: new Date().toISOString(),
    };

    await Posts.insertOne(post);

    if (!isThread) {
      const threadData = await Posts.getThread(boardId, parseInt(thread!));
      if (threadData) {
        await Posts.updateThreadAggregates(
          boardId,
          parseInt(thread!),
          (threadData.replyposts || 0) + 1,
          threadData.replyfiles || 0,
          new Date()
        );
      }
    }

    const redirectUrl = isThread 
      ? `/${boardId}/thread/${postId}.html`
      : `/${boardId}/thread/${thread}.html#${postId}`;
    
    const url = new URL(redirectUrl, request.url);
    return NextResponse.redirect(url, 303);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
