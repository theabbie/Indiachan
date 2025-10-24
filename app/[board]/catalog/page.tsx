import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import BoardNav from '@/components/BoardNav';
import PostForm from '@/components/PostForm';
import { Boards } from '@/lib/db/boards';
import { Posts } from '@/lib/db/posts';

export default async function CatalogPage({ params }: { params: Promise<{ board: string }> }) {
  const { board: boardId } = await params;
  const board = await Boards.findOne(boardId);
  
  if (!board) {
    notFound();
  }

  const threads = await Posts.getRecent(boardId, 1, 150, false, true);

  return (
    <>
      <Navbar board={board} />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Catalog" />
          <br />
          <PostForm board={board} />
          <br />
          <div className="wrapbar">
            <div className="pages">
              <BoardNav board={boardId} isCatalog={true} isThread={false} />
            </div>
            <div className="pages jsonly">
              <input id="catalogfilter" type="text" placeholder="Filter" />
              <select className="ml-5 right" id="catalogsort">
                <option value="" disabled selected hidden>
                  Sort By
                </option>
                <option value="bump">Bump Order</option>
                <option value="date">Creation Date</option>
                <option value="replies">Reply Count</option>
              </select>
            </div>
          </div>
          <form
            action={`/forms/board/${boardId}/actions`}
            method="POST"
            encType="application/x-www-form-urlencoded"
          >
            <hr />
            {threads.length === 0 ? (
              <p>No posts</p>
            ) : (
              <div className="catalog">
                {threads.map((thread: any, i: number) => (
                  <div key={thread.postId} className="catalog-tile">
                    <div className="catalog-thumb">
                      {thread.files.length > 0 ? (
                        <Link href={`/${boardId}/thread/${thread.postId}.html`}>
                          {thread.spoiler || thread.files[0].spoiler ? (
                            <div className="spoilerimg file-thumb"></div>
                          ) : thread.files[0].hasThumb ? (
                            <img
                              src={`/file/thumb/${thread.files[0].hash}${thread.files[0].thumbextension}`}
                              height={thread.files[0].geometry.thumbheight}
                              width={thread.files[0].geometry.thumbwidth}
                              loading="lazy"
                              alt=""
                            />
                          ) : (
                            <img
                              src={`/file/${thread.files[0].filename}`}
                              height={thread.files[0].geometry.height}
                              width={thread.files[0].geometry.width}
                              loading="lazy"
                              alt=""
                            />
                          )}
                        </Link>
                      ) : (
                        <div className="file-thumb"></div>
                      )}
                    </div>
                    <div className="catalog-stats">
                      R: {thread.replyposts} / F: {thread.replyfiles + thread.files.length}
                      {thread.sticky && <img className="icon" src="/img/sticky.png" height="16" width="16" alt="Sticky" />}
                      {thread.locked && <img className="icon" src="/img/locked.png" height="16" width="16" alt="Locked" />}
                      {thread.cyclic && <img className="icon" src="/img/cyclic.png" height="16" width="16" alt="Cyclic" />}
                      {thread.saged && <img className="icon" src="/img/saged.png" height="16" width="16" alt="Saged" />}
                    </div>
                    <div className="catalog-subject">
                      <Link href={`/${boardId}/thread/${thread.postId}.html`}>
                        {thread.subject || `No. ${thread.postId}`}
                      </Link>
                    </div>
                    <div className="catalog-message">
                      {thread.nomarkup ? (
                        thread.nomarkup.length > 100
                          ? `${thread.nomarkup.substring(0, 100)}...`
                          : thread.nomarkup
                      ) : (
                        'No message'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <hr />
            <div className="pages">
              <BoardNav board={boardId} isCatalog={true} isThread={false} />
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
