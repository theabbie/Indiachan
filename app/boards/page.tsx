import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Boards } from '@/lib/db/boards';
import { Board } from '@/types/board';

export default async function BoardListPage() {
  const boards = await Boards.find({ 'settings.unlistedLocal': { $ne: true } });

  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">Boards</h1>
          <hr />
          
          {boards.length === 0 ? (
            <p>No boards yet.</p>
          ) : (
            <table className="board-table">
              <thead>
                <tr>
                  <th>Board</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Posts</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board: Board) => (
                  <tr key={board._id}>
                    <td>
                      <Link href={`/${board._id}/index.html`}>/{board._id}/</Link>
                    </td>
                    <td>{board.settings.name}</td>
                    <td>{board.settings.description || '-'}</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
