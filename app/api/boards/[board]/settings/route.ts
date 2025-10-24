import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { Boards } from '@/lib/db/boards';
import { Accounts } from '@/lib/db/accounts';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ board: string }> }
) {
  try {
    const { board: boardId } = await params;
    const session = await requireSession();
    const formData = await request.formData();
    
    const board = await Boards.findOne(boardId);
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    const account = await Accounts.findOne(session.user!);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const isOwner = account.ownedBoards?.includes(boardId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Only board owners can update settings' },
        { status: 403 }
      );
    }

    const settings: any = {};

    if (formData.has('name')) settings.name = formData.get('name');
    if (formData.has('description')) settings.description = formData.get('description');
    if (formData.has('default_name')) settings.defaultName = formData.get('default_name');
    if (formData.has('theme')) settings.theme = formData.get('theme');
    if (formData.has('code_theme')) settings.codeTheme = formData.get('code_theme');
    
    settings.ids = formData.has('ids');
    settings.geoFlags = formData.has('geo_flags');
    settings.customFlags = formData.has('custom_flags');
    settings.reverseImageSearchLinks = formData.has('reverse_image_search_links');
    settings.enableTegaki = formData.has('enable_tegaki');
    settings.enableWeb3 = formData.has('enable_web3');
    settings.unlistedLocal = formData.has('unlisted_local');
    settings.userPostDelete = formData.has('user_post_delete');
    settings.userPostSpoiler = formData.has('user_post_spoiler');
    settings.userPostUnlink = formData.has('user_post_unlink');
    settings.forceAnon = formData.has('force_anon');
    settings.sageOnlyEmail = formData.has('sage_only_email');
    settings.forceThreadSubject = formData.has('force_thread_subject');
    settings.forceThreadMessage = formData.has('force_thread_message');
    settings.forceThreadFile = formData.has('force_thread_file');
    settings.forceReplyMessage = formData.has('force_reply_message');
    settings.forceReplyFile = formData.has('force_reply_file');

    if (formData.has('min_thread_message_length')) {
      settings.minThreadMessageLength = parseInt(formData.get('min_thread_message_length') as string);
    }
    if (formData.has('min_reply_message_length')) {
      settings.minReplyMessageLength = parseInt(formData.get('min_reply_message_length') as string);
    }
    if (formData.has('max_thread_message_length')) {
      settings.maxThreadMessageLength = parseInt(formData.get('max_thread_message_length') as string);
    }
    if (formData.has('max_reply_message_length')) {
      settings.maxReplyMessageLength = parseInt(formData.get('max_reply_message_length') as string);
    }
    if (formData.has('max_files')) {
      settings.maxFiles = parseInt(formData.get('max_files') as string);
    }
    if (formData.has('reply_limit')) {
      settings.replyLimit = parseInt(formData.get('reply_limit') as string);
    }
    if (formData.has('thread_limit')) {
      settings.threadLimit = parseInt(formData.get('thread_limit') as string);
    }
    if (formData.has('captcha_mode')) {
      settings.captchaMode = parseInt(formData.get('captcha_mode') as string);
    }

    settings.allowedFileTypes = {
      image: formData.has('allow_image_files'),
      video: formData.has('allow_video_files'),
      audio: formData.has('allow_audio_files'),
      other: false
    };

    await Boards.updateSettings(boardId, settings);

    return NextResponse.redirect(new URL(`/${boardId}/manage/settings.html`, request.url));

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
