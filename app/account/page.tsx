import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';

export default async function AccountPage() {
  const username = await getSessionUser();
  
  if (!username) {
    redirect('/login.html');
  }

  const account = await Accounts.findOne(username);

  if (!account) {
    redirect('/login.html');
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">Account</h1>
          <hr />
          
          <section className="form-wrapper flex-center">
            <div className="form-post">
              <div className="row">
                <div className="label">Username</div>
                <span>{account.original}</span>
              </div>
              
              <div className="row">
                <div className="label">Owned Boards</div>
                <div>
                  {account.ownedBoards && account.ownedBoards.length > 0 ? (
                    account.ownedBoards.map((board: string) => (
                      <div key={board}>
                        <Link href={`/${board}/manage/index.html`}>/{board}/</Link>
                      </div>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="label">Staff Boards</div>
                <div>
                  {account.staffBoards && account.staffBoards.length > 0 ? (
                    account.staffBoards.map((board: string) => (
                      <div key={board}>
                        <Link href={`/${board}/manage/index.html`}>/{board}/</Link>
                      </div>
                    ))
                  ) : (
                    <span>None</span>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="label">Two-Factor Auth</div>
                <span>{account.twofactor ? 'Enabled' : 'Disabled'}</span>
              </div>

              <hr />

              <div className="row">
                <Link href="/changepassword.html" className="postform-style ph-5">
                  Change Password
                </Link>
              </div>

              <div className="row">
                <Link href="/twofactor.html" className="postform-style ph-5">
                  {account.twofactor ? 'Disable' : 'Enable'} Two-Factor Auth
                </Link>
              </div>

              <div className="row">
                <Link href="/create.html" className="postform-style ph-5">
                  Create Board
                </Link>
              </div>

              <div className="row">
                <form action="/forms/logout" method="POST">
                  <input type="submit" value="Logout" />
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
