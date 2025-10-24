import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { Modlogs } from '@/lib/db/modlogs';

const ACTION_NAMES: { [key: number]: string } = {
  1: 'Delete',
  2: 'Delete by IP',
  3: 'Global Delete by IP',
  4: 'Ban',
  5: 'Global Ban',
  6: 'Spoiler Files',
  7: 'Unlink Files',
  8: 'Sticky',
  9: 'Lock',
  10: 'Bumplock',
  11: 'Cycle',
  12: 'Dismiss',
  13: 'Global Dismiss',
};

export default async function ModlogsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ board: string }>;
  searchParams: Promise<{ username?: string; page?: string }>;
}) {
  const { board: boardId } = await params;
  const search = await searchParams;
  const username = await getSessionUser();
  
  if (!username) {
    redirect('/login.html');
  }

  const board = await Boards.findOne(boardId);
  
  if (!board) {
    notFound();
  }

  const account = await Accounts.findOne(username);
  
  if (!account) {
    redirect('/login.html');
  }

  const isOwner = account.ownedBoards?.includes(boardId);
  const isStaff = account.staffBoards?.includes(boardId);

  if (!isOwner && !isStaff) {
    return (
      <>
        <Navbar board={board} modview={true} />
        <main>
          <div className="container">
            <BoardHeader board={board} subtitle="Logs" />
            <hr />
            <p>You do not have permission to manage this board.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const page = parseInt(search.page || '1');
  const filterUsername = search.username;
  
  const filter: any = { board: boardId };
  if (filterUsername) {
    filter.user = filterUsername;
  }

  const limit = 50;
  const offset = (page - 1) * limit;
  
  const logs = await Modlogs.find(filter, offset, limit);
  const totalLogs = await Modlogs.count(filter);
  const totalPages = Math.ceil(totalLogs / limit);

  return (
    <>
      <Navbar board={board} modview={true} managePage="logs.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Logs" />
          <br />
          <div className="pages">
            <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
          </div>
          <hr />
          
          <div className="form-wrapper flexleft">
            <h4 className="no-m-p">Search:</h4>
            <form className="form-post mv-5" action={`/${boardId}/manage/logs.html`} method="GET">
              <input type="hidden" name="page" value={page} />
              <div className="row">
                <div className="label">Username</div>
                <input type="text" name="username" defaultValue={filterUsername} />
              </div>
              <input type="submit" value="Filter" />
            </form>

            <h4 className="no-m-p">Logs:</h4>
            {logs && logs.length > 0 ? (
              <>
                <div className="table-container flex-center mv-10 text-center">
                  <table className="fw">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>IP</th>
                        <th>Actions</th>
                        <th>Links</th>
                        <th>Log Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: any) => (
                        <tr key={log._id}>
                          <td>
                            <time className="reltime" dateTime={new Date(log.date).toISOString()}>
                              {new Date(log.date).toLocaleString('en-US', { hourCycle: 'h23' })}
                            </time>
                          </td>
                          <td>
                            {log.showUser ? (
                              <>
                                {log.user}
                                {' '}
                                <a href={`?username=${log.user}`}>[+]</a>
                              </>
                            ) : (
                              'Hidden'
                            )}
                          </td>
                          <td>
                            <code>{log.ip?.cloak || 'N/A'}</code>
                          </td>
                          <td>
                            {log.actions.map((a: number) => ACTION_NAMES[a] || `Action ${a}`).join(', ')}
                          </td>
                          <td>
                            {log.showLinks ? (
                              log.postLinks.map((link: any, idx: number) => (
                                <span key={idx}>
                                  <a href={`/${link.board}/thread/${link.thread || link.postId}.html#${link.postId}`}>
                                    #{link.postId}
                                  </a>
                                  {' '}
                                </span>
                              ))
                            ) : (
                              log.postLinks.map((l: any) => l.postId).join(', ')
                            )}
                          </td>
                          <td>{log.message || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pages mv-5">
                    {page > 1 && (
                      <>
                        <a href={`?page=1${filterUsername ? `&username=${filterUsername}` : ''}`}>[1]</a>
                        {' '}
                        <a href={`?page=${page - 1}${filterUsername ? `&username=${filterUsername}` : ''}`}>[Previous]</a>
                        {' '}
                      </>
                    )}
                    <span>[{page}]</span>
                    {page < totalPages && (
                      <>
                        {' '}
                        <a href={`?page=${page + 1}${filterUsername ? `&username=${filterUsername}` : ''}`}>[Next]</a>
                        {' '}
                        <a href={`?page=${totalPages}${filterUsername ? `&username=${filterUsername}` : ''}`}>[{totalPages}]</a>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>No logs.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
