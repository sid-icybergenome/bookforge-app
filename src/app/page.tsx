'use client';

import { useEffect, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BookCard from '@/components/BookCard';
import DraftCard from '@/components/DraftCard';
import { loadBooks } from '@/lib/storage';
import type { Book } from '@/types/book';

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBooks(loadBooks());
  }, []);

  const published = books.filter((b) => b.status === 'published');
  const drafts = books.filter((b) => b.status === 'draft');
  const isEmpty = books.length === 0;

  return (
    <div className="flex h-screen" style={{ background: '#F9F9F9' }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div className="flex flex-col flex-1 min-w-0" style={{ marginLeft: 240 }}>
        <TopBar title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-6">
          {!mounted ? null : isEmpty ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-10 max-w-6xl">
              {/* Create button */}
              <div className="flex justify-end">
                <CreateButton />
              </div>

              {/* My Books */}
              {published.length > 0 && (
                <Section title="My Books">
                  <BooksGrid>
                    {published.map((b) => (
                      <BookCard key={b.id} book={b} />
                    ))}
                  </BooksGrid>
                </Section>
              )}

              {/* Drafts */}
              {drafts.length > 0 && (
                <Section title="Drafts">
                  <BooksGrid>
                    {drafts.map((b) => (
                      <DraftCard key={b.id} book={b} />
                    ))}
                  </BooksGrid>
                </Section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-bold mb-4" style={{ fontSize: 18, color: '#111111' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function BooksGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
    >
      {children}
    </div>
  );
}

function CreateButton() {
  return (
    <button
      className="flex items-center gap-2 rounded-xl font-semibold transition-colors"
      style={{
        background: '#FF9900',
        color: '#FFFFFF',
        padding: '10px 20px',
        fontSize: 14,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#E68A00')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9900')}
      onClick={() => {
        /* CreateBookModal wired in Step 6 */
        alert('Create New Coloring Book — coming in Step 6!');
      }}
    >
      <Plus size={16} />
      Create New Coloring Book
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-24">
      {/* Illustration */}
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 96, height: 96, background: '#FFF8E7' }}
      >
        <BookOpen size={48} style={{ color: '#FF9900' }} />
      </div>

      <div className="text-center">
        <h2 className="font-bold mb-2" style={{ fontSize: 22, color: '#111111' }}>
          Create your first coloring book!
        </h2>
        <p style={{ fontSize: 15, color: '#555555', maxWidth: 400 }}>
          Go from idea to Amazon KDP-ready in under 30 minutes. AI generates your
          outline, descriptions, and illustrations automatically.
        </p>
      </div>

      <button
        className="flex items-center gap-2 rounded-xl font-semibold transition-colors"
        style={{
          background: '#FF9900',
          color: '#FFFFFF',
          padding: '12px 28px',
          fontSize: 15,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#E68A00')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9900')}
        onClick={() => {
          /* CreateBookModal wired in Step 6 */
          alert('Create New Coloring Book — coming in Step 6!');
        }}
      >
        <Plus size={18} />
        Create New Coloring Book
      </button>

      {/* Feature hints */}
      <div className="flex gap-6 mt-4">
        {[
          { icon: '✨', text: 'AI-generated outline & illustrations' },
          { icon: '🎨', text: 'Professional KDP-ready cover' },
          { icon: '📥', text: 'Print-ready PDF export' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2" style={{ fontSize: 13, color: '#555555' }}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
