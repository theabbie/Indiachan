import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <div className="board-header">
            <h1 className="board-title">Indiachan</h1>
            <p>India's uncensored community where your voice is truly free</p>
          </div>
          <hr />
          <div className="pages">
            <Link href="/boards.html">View All Boards</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
