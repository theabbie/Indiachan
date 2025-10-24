import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BoardHeader from '@/components/BoardHeader';
import { Boards } from '@/lib/db/boards';
import { getSessionUser } from '@/lib/session';
import { Accounts } from '@/lib/db/accounts';

export default async function StaffPage({ params }: { params: Promise<{ board: string }> }) {
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
            <BoardHeader board={board} subtitle="Staff" />
            <hr />
            <p>Only board owners can manage staff.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const staffEntries = Object.entries(board.staff || {}).sort((a: any, b: any) => 
    new Date(a[1].addedDate).getTime() - new Date(b[1].addedDate).getTime()
  );

  return (
    <>
      <Navbar board={board} modview={true} managePage="staff.html" />
      <main>
        <div className="container">
          <BoardHeader board={board} subtitle="Staff" />
          <br />
          <div className="pages">
            <a href={`/${boardId}/manage/index.html`}>[Back to manage]</a>
          </div>
          <hr />
          
          <div className="form-wrapper flexleft">
            <h4 className="no-m-p">Add Staff:</h4>
            <form className="form-post mv-5" action={`/api/boards/${boardId}/staff/add`} method="POST">
              <div className="row">
                <div className="label">Username</div>
                <input type="text" name="username" required />
              </div>
              <input type="submit" value="Add" />
            </form>
          </div>

          <hr />
          <h4 className="no-m-p">Current Staff:</h4>

          {staffEntries.length > 0 ? (
            <form className="form-post nogrow" action={`/api/boards/${boardId}/staff/delete`} method="POST">
              <div className="table-container flex-left mv-5 text-center">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Username</th>
                      <th>Date Added</th>
                      <th>Logs</th>
                      <th>Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffEntries.map(([staffUsername, staffData]: [string, any]) => (
                      <tr key={staffUsername}>
                        <td>
                          <input type="checkbox" name="checkedstaff" value={staffUsername} />
                        </td>
                        <td>
                          {staffUsername}
                          {username === staffUsername && ' (You)'}
                        </td>
                        <td>
                          <time className="reltime" dateTime={staffData.addedDate}>
                            {new Date(staffData.addedDate).toLocaleString('en-US', { hourCycle: 'h23' })}
                          </time>
                        </td>
                        <td>
                          <a href={`/${boardId}/manage/logs.html?username=${staffUsername}`}>[View]</a>
                        </td>
                        <td>
                          {username !== staffUsername ? (
                            <a href={`/${boardId}/manage/editstaff/${staffUsername}.html`}>[Edit]</a>
                          ) : (
                            <a href={`/${boardId}/manage/mypermissions.html`}>[View]</a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 className="no-m-p">Delete Selected:</h4>
              <input type="submit" value="Delete" />
            </form>
          ) : (
            <p>None</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
