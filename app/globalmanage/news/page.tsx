import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';
import { News } from '@/lib/db/news';

export default async function GlobalNewsPage() {
  const username = await getSessionUser();
  
  if (!username) {
    redirect('/login.html');
  }

  const account = await Accounts.findOne(username);
  
  if (!account) {
    redirect('/login.html');
  }

  const news = await News.find();

  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">Global Management</h1>
          <br />
          <div className="pages">
            <Link href="/globalmanage/recent.html">Recent</Link>
            {' | '}
            <Link href="/globalmanage/reports.html">Reports</Link>
            {' | '}
            <Link href="/globalmanage/bans.html">Bans</Link>
            {' | '}
            <Link href="/globalmanage/boards.html">Boards</Link>
            {' | '}
            <Link href="/globalmanage/accounts.html">Accounts</Link>
            {' | '}
            <strong>News</strong>
            {' | '}
            <Link href="/globalmanage/settings.html">Settings</Link>
          </div>
          <hr />

          <h4 className="no-m-p">Add News:</h4>
          <div className="form-wrapper flexleft">
            <form className="form-post" action="/api/globalmanage/news/add" method="POST">
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

          {news.length > 0 && (
            <>
              <hr />
              <h4 className="no-m-p">Manage News:</h4>
              <div className="form-wrapper flexleft">
                <form className="form-post" action="/api/globalmanage/news/delete" method="POST">
                  {news.map((post: any) => (
                    <div key={post._id} className="news-post">
                      <div className="post-container">
                        <div className="post-info">
                          <label>
                            <input type="checkbox" name="checkednews" value={post._id} />
                            {' '}
                            <span className="post-subject">{post.title}</span>
                            {' '}
                            <time className="post-date" dateTime={new Date(post.date).toISOString()}>
                              {new Date(post.date).toLocaleDateString()}
                            </time>
                          </label>
                          {' '}
                          <Link href={`/globalmanage/editnews/${post._id}.html`}>[Edit]</Link>
                        </div>
                        <div className="post-message" dangerouslySetInnerHTML={{ __html: post.message.markdown || post.message.raw }} />
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
