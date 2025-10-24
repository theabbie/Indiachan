import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ChangePasswordPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <h1 className="board-title">Change Password</h1>
          <div className="form-wrapper flex-center mv-10">
            <form className="form-post" action="/api/auth/changepassword" method="POST">
              <div className="row">
                <div className="label">Username</div>
                <input type="text" name="username" maxLength={50} required />
              </div>
              <div className="row">
                <div className="label">Existing Password</div>
                <input type="password" name="password" maxLength={100} required />
              </div>
              <div className="row">
                <div className="label">New Password</div>
                <input type="password" name="newpassword" maxLength={100} required />
              </div>
              <div className="row">
                <div className="label">Confirm New Password</div>
                <input type="password" name="newpasswordconfirm" maxLength={100} required />
              </div>
              <div className="row">
                <div className="label">2FA Code</div>
                <input type="number" name="twofactor" placeholder="if enabled" />
              </div>
              <input type="submit" value="Change Password" />
            </form>
            <p><Link href="/login.html">Login</Link></p>
            <p><Link href="/register.html">Register</Link></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
