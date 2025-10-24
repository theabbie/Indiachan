import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Post from '@/components/Post';
import { Posts } from '@/lib/db/posts';
import { Boards } from '@/lib/db/boards';

export default async function OverboardPage() {
  const boards = await Boards.find({ 'settings.unlistedLocal': { $ne: true } });
  const boardIds = boards.map((b: any) => b._id);
  const threads = await Posts.getRecent(boardIds, 1, 20, false, true);

  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <div className="board-header">
            <h1 className="board-title">Overboard</h1>
            <p>Recent posts from all boards</p>
          </div>
          <hr />
          
          {threads.length === 0 ? (
            <p>No posts.</p>
          ) : (
            threads.map((thread: any) => (
              <div key={`${thread.board}-${thread.postId}`}>
                <div className="thread">
                  <Post post={thread} truncate={true} overboard={true} />
                  {thread.replies?.slice(0, 3).map((reply: any) => (
                    <Post key={reply.postId} post={reply} truncate={true} overboard={true} />
                  ))}
                </div>
                <hr />
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
