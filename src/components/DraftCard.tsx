'use client';

import Link from 'next/link';
import { Clock, FileText } from 'lucide-react';
import type { Book } from '@/types/book';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export default function DraftCard({ book }: { book: Book }) {
  const completedPages = book.pages.filter((p) => p.illustrationStatus === 'complete').length;
  const totalPages = book.pages.length;

  return (
    <Link
      href={`/editor/${book.id}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-all relative"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* DRAFT badge */}
      <span
        className="absolute top-2.5 right-2.5 z-10 rounded-full px-2.5 py-1 font-bold tracking-wide"
        style={{ background: '#FFF8E7', color: '#FF9900', fontSize: 10, border: '1px solid #FFE4B5' }}
      >
        DRAFT
      </span>

      {/* Cover thumbnail */}
      <div
        className="w-full flex items-center justify-center relative overflow-hidden"
        style={{ height: 180, background: '#F9F9F9', flexShrink: 0 }}
      >
        {book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2 w-full h-full"
            style={{ background: 'linear-gradient(135deg, #F9F9F9 0%, #F3F4F6 100%)' }}
          >
            <span style={{ fontSize: 36 }}>📝</span>
            <span style={{ fontSize: 11, color: '#888888', fontWeight: 500 }}>No cover yet</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className="font-semibold leading-snug line-clamp-2"
          style={{ fontSize: 14, color: '#111111' }}
        >
          {book.title}
        </h3>

        {/* Progress bar */}
        {totalPages > 0 && (
          <div>
            <div className="flex justify-between mb-1" style={{ fontSize: 11, color: '#888888' }}>
              <span>{completedPages} of {totalPages} pages complete</span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 4, background: '#E5E5E5' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0}%`,
                  background: '#FF9900',
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-auto" style={{ color: '#888888' }}>
          <span className="flex items-center gap-1" style={{ fontSize: 12 }}>
            <FileText size={12} />
            {book.pageCount} pages
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 12 }}>
            <Clock size={12} />
            {formatDate(book.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
