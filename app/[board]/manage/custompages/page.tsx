import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { CustomPages } from '@/lib/db/custompages';

export default async function CustomPagesManagePage({ params }: { params: Promise<{ board: string }> }) {
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

  if (!isOwner) {
    return (
      <>
        <Navbar board={board} modview={true} />
        <main>
          <div className="container">
            <BoardHeader board={board} subtitle="Custom Pages" />
            <hr />
            <p>Only board owners can manage custom pages.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const customPages = await CustomPages.find(boardId);

  return (
    <>
      <Navbar board={board} modview={true} managePage="custompages.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Custom Pages" />
          <br />
          <div className="pages">
            <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
          </div>
          <hr />

          <h4 className="mv-5">Add Custom Page:</h4>
          <div className="form-wrapper flexleft">
            <form className="form-post" action={`/api/boards/${boardId}/custompages/add`} method="POST">
              <div className="row">
                <div className="label">.html name</div>
                <input type="text" name="page" pattern="[a-zA-Z0-9-_]+" placeholder="a-zA-Z0-9-_ only" required />
              </div>
              <div className="row">
                <div className="label">Title</div>
                <input type="text" name="title" required />
              </div>
              <div className="row">
                <div className="label">Message</div>
                <textarea name="message" rows={10} placeholder="Supports post styling" required></textarea>
              </div>
              <input type="submit" value="Submit" />
            </form>
          </div>

          {customPages.length > 0 && (
            <>
              <hr />
              <h4 className="no-m-p">Manage Custom Pages:</h4>
              <div className="form-wrapper flexleft">
                <form className="form-post" action={`/api/boards/${boardId}/custompages/delete`} method="POST">
                  {customPages.map((page: any) => (
                    <div key={page._id} className="custom-page">
                      <div className="post-container">
                        <div className="post-info">
                          <label>
                            <input type="checkbox" name="checkedpages" value={page.page} />
                            {' '}
                            <span className="post-subject">{page.title}</span>
                            {' '}
                            <a href={`/${boardId}/${page.page}.html`}>[View]</a>
                            {' '}
                            <Link href={`/${boardId}/manage/editcustompage/${page._id}.html`}>[Edit]</Link>
                          </label>
                        </div>
                        <div className="post-message" dangerouslySetInnerHTML={{ __html: page.message.markdown || page.message.raw }} />
                      </div>
                      <hr />
                    </div>
                  ))}
                  <input type="submit" value="Delete" />
                </form>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
