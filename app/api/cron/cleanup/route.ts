import { NextResponse } from 'next/server';
import { Captchas } from '@/lib/db/captchas';
import { Ratelimits } from '@/lib/db/ratelimits';
import { Files } from '@/lib/db/files';
import { Accounts } from '@/lib/db/accounts';
import { deleteFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      tasks: [] as string[],
    };

    const captchaResult = await Captchas.deleteExpired();
    results.tasks.push(`Deleted ${captchaResult.deletedCount} expired captchas`);

    const rateLimitResult = await Ratelimits.deleteExpired();
    results.tasks.push(`Deleted ${rateLimitResult.deletedCount} expired rate limits`);

    const unreferencedFiles = await Files.getUnreferenced();
    if (unreferencedFiles.length > 0) {
      await Files.deleteMany({ 'count': { '$lte': 0 } });
      await Promise.all(unreferencedFiles.map(async (file: any) => {
        await deleteFile(file._id);
        if (file.exts && file.exts.length > 0) {
          await Promise.all(file.exts.filter((ext: string) => ext).map((ext: string) => {
            const thumbName = file._id.split('.')[0] + ext;
            return deleteFile(`thumb/${thumbName}`);
          }));
        }
      }));
      results.tasks.push(`Pruned ${unreferencedFiles.length} unreferenced files`);
    }

    const MONTH = 30 * 24 * 60 * 60 * 1000;
    const inactiveAccounts = await Accounts.getInactive(3 * MONTH);
    if (inactiveAccounts.length > 0) {
      const usernames = inactiveAccounts.map((acc: any) => acc._id);
      await Accounts.clearStaffAndOwnedBoards(usernames);
      results.tasks.push(`Cleared staff positions from ${inactiveAccounts.length} inactive accounts`);
    }

    console.log('Daily cleanup completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Daily cleanup completed',
      results,
    });
  } catch (error: any) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
