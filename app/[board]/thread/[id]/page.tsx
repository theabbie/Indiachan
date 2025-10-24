import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import BoardNav from '@/components/BoardNav';
import PostForm from '@/components/PostForm';
import Post from '@/components/Post';
import { Boards } from '@/lib/db/boards';
import { Posts } from '@/lib/db/posts';

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}) {
  const { board: boardId, id } = await params;
  const board = await Boards.findOne(boardId);
  
  if (!board) {
    notFound();
  }

  const threadId = parseInt(id);
  const thread = await Posts.getThread(boardId, threadId);

  if (!thread) {
    notFound();
  }

  const reachedLimit = thread.replyposts >= board.settings.replyLimit && !thread.cyclic;

  return (
    <>
      <Navbar board={board} />
      <main>
        <div className="container">
          <BoardHeader board={board} />
          <br />
          {reachedLimit ? (
            <p className="title text-center">⊖ Thread has reached reply limit.</p>
          ) : (
            <>
              <PostForm board={board} thread={thread} />
              <br />
            </>
          )}
          <div className="pages">
            <BoardNav board={boardId} isCatalog={false} isThread={true} />
          </div>
          <form
            action={`/forms/board/${boardId}/actions`}
            method="POST"
            encType="application/x-www-form-urlencoded"
          >
            <hr />
            <div className="thread">
              <Post post={thread} />
              {thread.replies?.map((reply: any) => (
                <Post key={reply.postId} post={reply} />
              ))}
            </div>
            {reachedLimit ? (
              <p className="title text-center">⊖ Thread has reached reply limit.</p>
            ) : (
              <a className="bottom-reply no-decoration post-button" href="#postform">
                [New Reply]
              </a>
            )}
            <hr />
            <div className="wrapbar">
              <div className="pages">
                <BoardNav board={boardId} isCatalog={false} isThread={true} />
              </div>
              <div id="threadstats">
                <span>{thread.replyposts} replies</span>
                {' | '}
                <span>{thread.replyfiles + thread.files.length} files</span>
              </div>
            </div>
            <div className="jsonly" id="livetext">
              <div className="dot" id="livecolor"></div>
              {' '}Connecting...{' '}
              <input
                className="postform-style ml-5 di"
                id="updatepostsbutton"
                type="button"
                value="Update"
              />
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
