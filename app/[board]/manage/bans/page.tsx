import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { Bans } from '@/lib/db/bans';

export default async function BansPage({ params }: { params: Promise<{ board: string }> }) {
  const { board: boardId } = await params;
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
            <BoardHeader board={board} subtitle="Bans" />
            <hr />
            <p>You do not have permission to manage this board.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const bans = await Bans.find(null, boardId);

  return (
    <>
      <Navbar board={board} modview={true} managePage="bans.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Bans & Appeals" />
          <br />
          <div className="pages">
            <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
          </div>
          <hr />
          <h4 className="mv-5">Bans & Appeals:</h4>
          
          {bans.length === 0 ? (
            <p>No bans.</p>
          ) : (
            <form action={`/api/boards/${boardId}/bans/edit`} method="POST">
              <table className="ban-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>IP</th>
                    <th>Reason</th>
                    <th>Issuer</th>
                    <th>Date</th>
                    <th>Expires</th>
                    <th>Appeal</th>
                    <th>Posts</th>
                  </tr>
                </thead>
                <tbody>
                  {bans.map((ban: any) => (
                    <tr key={ban._id}>
                      <td>
                        <input type="checkbox" name="checkedbans" value={ban._id} />
                      </td>
                      <td>
                        <code>{ban.ip?.cloak || 'N/A'}</code>
                      </td>
                      <td>{ban.reason}</td>
                      <td>{ban.issuer}</td>
                      <td>
                        <time dateTime={new Date(ban.date).toISOString()}>
                          {new Date(ban.date).toLocaleDateString()}
                        </time>
                      </td>
                      <td>
                        {ban.expireAt ? (
                          <time dateTime={new Date(ban.expireAt).toISOString()}>
                            {new Date(ban.expireAt).toLocaleDateString()}
                          </time>
                        ) : (
                          'Never'
                        )}
                      </td>
                      <td>
                        {ban.appeal ? (
                          <details>
                            <summary>View Appeal</summary>
                            <p>{ban.appeal}</p>
                          </details>
                        ) : (
                          ban.allowAppeal ? 'Allowed' : 'Not allowed'
                        )}
                      </td>
                      <td>
                        {ban.posts && ban.posts.length > 0 ? (
                          <ul>
                            {ban.posts.map((post: any, idx: number) => (
                              <li key={idx}>
                                <a href={`/${post.board}/thread/${post.thread || post.postId}.html#${post.postId}`}>
                                  /{post.board}/ #{post.postId}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'None'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="action-wrapper mv-10">
                <div className="row">
                  <div className="label">Unban</div>
                  <label className="postform-style ph-5">
                    <input type="radio" name="option" value="unban" defaultChecked />
                  </label>
                </div>
                <div className="row">
                  <div className="label">Deny Appeal</div>
                  <label className="postform-style ph-5">
                    <input type="radio" name="option" value="deny_appeal" />
                  </label>
                </div>
                <div className="row">
                  <div className="label">Edit Duration</div>
                  <label className="postform-style ph-5 mr-1">
                    <input type="radio" name="option" value="edit_duration" />
                  </label>
                  <input type="number" name="ban_duration" placeholder="Duration in ms" />
                </div>
                <div className="row">
                  <div className="label">Edit Reason</div>
                  <label className="postform-style ph-5 mr-1">
                    <input type="radio" name="option" value="edit_reason" />
                  </label>
                  <input type="text" name="ban_reason" placeholder="New reason" />
                </div>
              </div>
              <input type="submit" value="Submit" />
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
