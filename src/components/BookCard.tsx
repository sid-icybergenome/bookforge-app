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

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/editor/${book.id}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-all"
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
            style={{
              background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)',
            }}
          >
            <span style={{ fontSize: 36 }}>🎨</span>
            <span style={{ fontSize: 11, color: '#AA6600', fontWeight: 500 }}>Coloring Book</span>
          </div>
        )}

        {/* Badge */}
        <span
          className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 font-semibold"
          style={{ background: '#FF9900', color: '#FFFFFF', fontSize: 10 }}
        >
          Coloring Book
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className="font-semibold leading-snug line-clamp-2"
          style={{ fontSize: 14, color: '#111111' }}
        >
          {book.title}
        </h3>

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
