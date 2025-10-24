import Link from 'next/link';

export default function Footer({ minimal }: { minimal?: boolean }) {
  if (minimal) return null;
  
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE;
  
  return (
    <small className="footer" id="bottom">
      - <Link href="/news.html">news</Link>
      {' '}- <Link href="/rules.html">rules</Link>
      {' '}- <Link href="/faq.html">faq</Link>
      {discordInvite && (
        <>
          {' '}- <a href={discordInvite} target="_blank" rel="noopener noreferrer">discord</a>
        </>
      )}
    </small>
  );
}
