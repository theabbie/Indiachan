import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import BoardNav from '@/components/BoardNav';
import PostForm from '@/components/PostForm';
import Post from '@/components/Post';
import { Boards } from '@/lib/db/boards';
import { Posts } from '@/lib/db/posts';

export default async function BoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board: boardId } = await params;
  const board = await Boards.findOne(boardId);
  
  if (!board) {
    notFound();
  }

  const threads = await Posts.getRecent(boardId, 1, 10, false, true);

  return (
    <>
      <Navbar board={board} />
      <main>
        <div className="container">
          <BoardHeader board={board} />
          <br />
          <PostForm board={board} />
          <br />
          <div className="pages">
            <BoardNav board={boardId} isCatalog={false} isThread={false} />
          </div>
          <form
            action={`/forms/board/${boardId}/actions`}
            method="POST"
            encType="application/x-www-form-urlencoded"
          >
            <hr />
            {threads.length === 0 ? (
              <p>No posts.</p>
            ) : (
              threads.map((thread: any) => (
                <div key={thread.postId}>
                  <div className="thread">
                    <Post post={thread} truncate={true} />
                    {thread.replies?.map((reply: any) => (
                      <Post key={reply.postId} post={reply} truncate={true} />
                    ))}
                  </div>
                  <hr />
                </div>
              ))
            )}
            <div className="pages">
              <BoardNav board={boardId} isCatalog={false} isThread={false} />
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
