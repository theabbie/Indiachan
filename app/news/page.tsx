import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NewsPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">News</h1>
          <hr />
          <p>No news yet.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
