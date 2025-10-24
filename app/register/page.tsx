'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login.html');
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
            <h1 className="board-title">Register</h1>
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
                    minLength={3}
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
                    minLength={6}
                    maxLength={100}
                    autoComplete="new-password"
                  />
                </section>

                <input type="submit" value={loading ? 'Registering...' : 'Register'} disabled={loading} />
              </form>
            </section>

            <hr />
            <p>
              Already have an account? <Link href="/login.html">Login</Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
