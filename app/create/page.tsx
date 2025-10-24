import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSessionUser } from '@/lib/session';

export default async function CreateBoardPage() {
  const username = await getSessionUser();
  
  if (!username) {
    redirect('/login.html');
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">Create Board</h1>
          <div className="form-wrapper flex-center mv-10">
            <form className="form-post" action="/api/boards/create" method="POST">
              <div className="row">
                <div className="label">URI e.g. /uri/</div>
                <input 
                  type="text" 
                  name="uri" 
                  maxLength={50} 
                  pattern="[a-zA-Z0-9]+" 
                  required 
                  title="alphanumeric only" 
                />
              </div>
              <div className="row">
                <div className="label">Name</div>
                <input type="text" name="name" maxLength={50} required />
              </div>
              <div className="row">
                <div className="label">Description</div>
                <input type="text" name="description" maxLength={200} />
              </div>
              <div className="row">
                <div className="label">Tags</div>
                <textarea name="tags" placeholder="Newline separated, max 10"></textarea>
              </div>
              <input type="submit" value="Create" />
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
