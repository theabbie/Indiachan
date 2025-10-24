import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';

export default async function ManagePage({ params }: { params: Promise<{ board: string }> }) {
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
            <BoardHeader board={board} subtitle="Manage" />
            <hr />
            <p>You do not have permission to manage this board.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar board={board} modview={true} managePage="index.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Manage" />
          <hr />
          
          <div className="pages">
            <h3>Board Management</h3>
            <ul>
              <li><Link href={`/${boardId}/manage/recent.html`}>Recent Posts</Link></li>
              <li><Link href={`/${boardId}/manage/reports.html`}>Reports</Link></li>
              <li><Link href={`/${boardId}/manage/bans.html`}>Bans</Link></li>
              <li><Link href={`/${boardId}/manage/logs.html`}>Logs</Link></li>
              {isOwner && (
                <>
                  <li><Link href={`/${boardId}/manage/settings.html`}>Settings</Link></li>
                  <li><Link href={`/${boardId}/manage/staff.html`}>Staff</Link></li>
                  <li><Link href={`/${boardId}/manage/assets.html`}>Assets</Link></li>
                  <li><Link href={`/${boardId}/manage/custompages.html`}>Custom Pages</Link></li>
                  <li><Link href={`/${boardId}/manage/filters.html`}>Filters</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
