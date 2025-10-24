'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      twofactor: formData.get('twofactor') as string,
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setError('Two-factor authentication code required');
        } else {
          setError(result.error || 'Login failed');
        }
        setLoading(false);
        return;
      }

      router.push('/account.html');
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="/css/themes/yotsuba-b.css" />
      </head>
      <body id="top">
        <main>
          <div className="container">
            <h1 className="board-title">Login</h1>
            <hr />
            
            <section className="form-wrapper flex-center">
              <form className="form-post" onSubmit={handleSubmit}>
                {error && (
                  <div className="row">
                    <p style={{ color: 'red' }}>{error}</p>
                  </div>
                )}

                <section className="row">
                  <div className="label">Username</div>
                  <input
                    type="text"
                    name="username"
                    required
                    maxLength={50}
                    autoComplete="username"
                  />
                </section>

                <section className="row">
                  <div className="label">Password</div>
                  <input
                    type="password"
                    name="password"
                    required
                    maxLength={100}
                    autoComplete="current-password"
                  />
                </section>

                {requiresTwoFactor && (
                  <section className="row">
                    <div className="label">2FA Code</div>
                    <input
                      type="text"
                      name="twofactor"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="000000"
                    />
                  </section>
                )}

                <input type="submit" value={loading ? 'Logging in...' : 'Login'} disabled={loading} />
              </form>
            </section>

            <hr />
            <p>
              Don't have an account? <Link href="/register.html">Register</Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
