import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RulesPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">Rules</h1>
          <hr />
          <ol>
            <li>Follow Indian law</li>
            <li>No spam or flooding</li>
            <li>Respect board-specific rules</li>
            <li>No illegal content</li>
            <li>Use common sense</li>
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
