import type { Metadata } from 'next';
import './styles/jschan.css';

export const metadata: Metadata = {
  title: 'Indiachan',
  description: "India's uncensored community where your voice is truly free",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#282A2E" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#DDDDDD" media="(prefers-color-scheme: light)" />
        <link id="theme" rel="stylesheet" data-theme="yotsuba-b" href="/css/themes/yotsuba-b.css" />
        {recaptchaSiteKey && (
          <>
            <script
              src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
              async
              defer
            />
            <script src="/js/recaptcha.js" defer />
          </>
        )}
        <script src="/js/live.js" defer />
        <script src="/js/settings.js" defer />
        <noscript>
          <style>{`.jsonly { display: none!important; } .user-id { cursor: auto!important; }`}</style>
        </noscript>
      </head>
      <body id="top">
        {children}
      </body>
    </html>
  );
}
