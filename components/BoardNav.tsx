import Link from 'next/link';

export default function BoardNav({
  board,
  page,
  isCatalog,
  isThread,
}: {
  board: string;
  page?: string | null;
  isCatalog?: boolean;
  isThread?: boolean;
}) {
  return (
    <div className="pages">
      {!isCatalog && <Link href={`/${board}/catalog.html`}>[Catalog]</Link>}
      {' '}
      {!isThread && <Link href={`/${board}/index.html`}>[Index]</Link>}
      {' '}
      <Link href={`/${board}/logs.html`}>[Logs]</Link>
    </div>
  );
}
