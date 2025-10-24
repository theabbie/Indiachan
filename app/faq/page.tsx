import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">FAQ</h1>
          <hr />
          
          <h3>What is Indiachan?</h3>
          <p>Indiachan is an Indian imageboard where you can discuss anything freely.</p>

          <h3>How do I post?</h3>
          <p>Click on a board, then fill out the form at the top to create a thread or reply.</p>

          <h3>Do I need an account?</h3>
          <p>No, posting is anonymous. Accounts are only needed for board management.</p>

          <h3>How do I create a board?</h3>
          <p>Register an account, then visit the account page to create a board.</p>

          <h3>How do I report posts?</h3>
          <p>Click the checkbox next to posts and use the report option at the bottom.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
