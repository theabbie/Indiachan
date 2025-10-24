import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import Post from '@/components/Post';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { getCollection as getPostsCollection } from '@/lib/db/posts';

export default async function ReportsPage({ params }: { params: Promise<{ board: string }> }) {
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
            <BoardHeader board={board} subtitle="Reports" />
            <hr />
            <p>You do not have permission to manage this board.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const postsDb = await getPostsCollection();
  const reportedPosts = await postsDb.find({
    'board': boardId,
    'reports.0': { '$exists': true }
  }).sort({ '_id': -1 }).limit(50).toArray();

  return (
    <>
      <Navbar board={board} modview={true} managePage="reports.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Reports" />
          <br />
          <div className="pages">
            <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
          </div>
          <hr />
          <h4 className="no-m-p">Reports:</h4>
          
          {reportedPosts.length === 0 ? (
            <p>No reports.</p>
          ) : (
            <form action={`/api/boards/${boardId}/actions`} method="POST">
              {reportedPosts.map((post: any) => (
                <div key={post._id}>
                  <div className="thread">
                    <Post post={post} manage={true} />
                    {post.reports && post.reports.length > 0 && (
                      <div className="reports">
                        <h5>Reports:</h5>
                        {post.reports.map((report: any, idx: number) => (
                          <div key={idx} className="report">
                            <label>
                              <input 
                                type="checkbox" 
                                name="checkedreports" 
                                value={`${post._id}-${idx}`}
                              />
                              {' '}
                              <strong>{report.reason}</strong>
                              {' - '}
                              <time dateTime={new Date(report.date).toISOString()}>
                                {new Date(report.date).toLocaleString()}
                              </time>
                              {report.ip && (
                                <span> - IP: {report.ip.cloak}</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <hr />
                </div>
              ))}
              
              <div className="action-footer">
                <h4>Actions:</h4>
                <div className="row">
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="delete" value="true" />
                    {' '}Delete
                  </label>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="delete_file" value="true" />
                    {' '}Delete Files
                  </label>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="ban" value="true" />
                    {' '}Ban
                  </label>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="dismiss" value="true" />
                    {' '}Dismiss Reports
                  </label>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="report_ban" value="true" />
                    {' '}Ban Reporter
                  </label>
                </div>
                
                <div className="row">
                  <div className="label">Ban Reason:</div>
                  <input type="text" name="ban_reason" placeholder="Optional" />
                </div>
                
                <div className="row">
                  <div className="label">Ban Duration (ms):</div>
                  <input type="number" name="ban_duration" placeholder="0 = permanent" defaultValue={0} />
                </div>
                
                <div className="row">
                  <div className="label">Log Message:</div>
                  <input type="text" name="log_message" placeholder="Optional" />
                </div>
                
                <input type="submit" value="Submit" />
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
