import Link from 'next/link';
import type { Board } from '@/types/board';

export default function BoardHeader({ board, subtitle }: { board: Board; subtitle?: string | null }) {
  return (
    <div className="board-header">
      <h1 className="board-title">
        /{board._id}/ - {board.settings.name}
      </h1>
      {subtitle && <h4 className="board-subtitle">{subtitle}</h4>}
      {board.settings.description && (
        <p className="board-description">{board.settings.description}</p>
      )}
    </div>
  );
}
