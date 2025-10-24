import Link from 'next/link';

export default function Navbar({ board, modview, managePage }: { 
  board?: { _id: string } | null;
  modview?: boolean;
  managePage?: string;
}) {
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE;
  
  return (
    <nav className="navbar">
      <Link href="/index.html" className="nav-item">Home</Link>
      <Link href="/boards.html" className="nav-item">
        Boards
      </Link>
      <Link href="/overboard.html" className="nav-item" id="overboardlink">Overboard</Link>
      {discordInvite && (
        <a href={discordInvite} target="_blank" rel="noopener noreferrer" className="nav-item">Discord</a>
      )}
      <Link href="/account.html" className="nav-item">Account</Link>
      {!modview && board && (
        <Link href={`/${board._id}/manage/${managePage || 'index.html'}`} className="nav-item">
          Manage
        </Link>
      )}
      <a className="jsonly nav-item right" id="settings" data-label="Settings"></a>
    </nav>
  );
}
