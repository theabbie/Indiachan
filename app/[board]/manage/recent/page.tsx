import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import Post from '@/components/Post';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { getCollection as getPostsCollection } from '@/lib/db/posts';

export default async function RecentPostsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ board: string }>;
  searchParams: Promise<{ ip?: string; postid?: string; page?: string }>;
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
            <BoardHeader board={board} subtitle="Recent Posts" />
            <hr />
            <p>You do not have permission to manage this board.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const page = parseInt(search.page || '1');
  const queryIp = search.ip;
  const postId = search.postid;
  const limit = 20;
  const skip = (page - 1) * limit;

  const postsDb = await getPostsCollection();
  let query: any = { 'board': boardId };

  if (queryIp) {
    query['ip.cloak'] = queryIp;
  } else if (postId) {
    const post = await postsDb.findOne({ 
      'board': boardId, 
      'postId': parseInt(postId) 
    });
    if (post && post.ip) {
      query['ip.cloak'] = post.ip.cloak;
    }
  }

  const posts = await postsDb.find(query)
    .sort({ '_id': -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const totalPosts = await postsDb.countDocuments(query);
  const totalPages = Math.ceil(totalPosts / limit);

  return (
    <>
      <Navbar board={board} modview={true} managePage="recent.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Recent Posts" />
          <br />
          <div className="wrapbar">
            <div className="pages">
              <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
            </div>
          </div>

          {posts.length === 0 ? (
            <>
              <hr />
              <p>No posts.</p>
            </>
          ) : (
            <form action={`/api/boards/${boardId}/actions`} method="POST">
              <hr />
              {(postId || queryIp) && posts[0]?.ip && (
                <>
                  <h4 className="no-m-p">
                    Post history for {posts[0].ip.cloak}
                  </h4>
                  <hr />
                </>
              )}

              {posts.map((post: any) => (
                <div key={post._id}>
                  <div className="thread">
                    <Post post={post} truncate={true} manage={true} />
                  </div>
                  <hr />
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pages mv-5">
                  {page > 1 && (
                    <>
                      <a href={`?page=1${queryIp ? `&ip=${queryIp}` : ''}${postId ? `&postid=${postId}` : ''}`}>[1]</a>
                      {' '}
                      <a href={`?page=${page - 1}${queryIp ? `&ip=${queryIp}` : ''}${postId ? `&postid=${postId}` : ''}`}>[Previous]</a>
                      {' '}
                    </>
                  )}
                  <span>[{page}]</span>
                  {page < totalPages && (
                    <>
                      {' '}
                      <a href={`?page=${page + 1}${queryIp ? `&ip=${queryIp}` : ''}${postId ? `&postid=${postId}` : ''}`}>[Next]</a>
                      {' '}
                      <a href={`?page=${totalPages}${queryIp ? `&ip=${queryIp}` : ''}${postId ? `&postid=${postId}` : ''}`}>[{totalPages}]</a>
                    </>
                  )}
                </div>
              )}

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
                    <input type="checkbox" name="spoiler" value="true" />
                    {' '}Spoiler
                  </label>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="delete_ip_board" value="true" />
                    {' '}Delete by IP (Board)
                  </label>
                  <label className="postform-style ph-5">
                    <input type="checkbox" name="delete_ip_global" value="true" />
                    {' '}Delete by IP (Global)
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
