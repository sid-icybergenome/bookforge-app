import type { Book } from '@/types/book';

const BOOKS_KEY = 'kdp_studio_books';
const CREDITS_KEY = 'kdp_studio_credits';
const EMAIL_KEY = 'kdp_studio_email';
const INITIAL_CREDITS = 25;

/* ── Safe localStorage access (SSR-safe) ───────────────────────────────────── */

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded or private mode — silently ignore */
  }
}

/* ── Books ──────────────────────────────────────────────────────────────────── */

export function loadBooks(): Book[] {
  const raw = getItem(BOOKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  setItem(BOOKS_KEY, JSON.stringify(books));
}

export function getBook(id: string): Book | undefined {
  return loadBooks().find((b) => b.id === id);
}

export function upsertBook(book: Book): void {
  const books = loadBooks();
  const idx = books.findIndex((b) => b.id === book.id);
  if (idx >= 0) {
    books[idx] = book;
  } else {
    books.unshift(book);
  }
  saveBooks(books);
}

export function deleteBook(id: string): void {
  saveBooks(loadBooks().filter((b) => b.id !== id));
}

/* ── Credits ────────────────────────────────────────────────────────────────── */

export function loadCredits(): number {
  const raw = getItem(CREDITS_KEY);
  if (raw === null) {
    setItem(CREDITS_KEY, String(INITIAL_CREDITS));
    return INITIAL_CREDITS;
  }
  const n = parseInt(raw, 10);
  return isNaN(n) ? INITIAL_CREDITS : n;
}

export function saveCredits(n: number): void {
  setItem(CREDITS_KEY, String(Math.max(0, n)));
}

export function deductCredits(amount: number): boolean {
  const current = loadCredits();
  if (current < amount) return false;
  saveCredits(current - amount);
  return true;
}

/* ── User email (admin bypass) ──────────────────────────────────────────────── */

export function loadEmail(): string {
  return getItem(EMAIL_KEY) ?? '';
}

export function saveEmail(email: string): void {
  setItem(EMAIL_KEY, email);
}

export function isAdmin(email: string): boolean {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

/* ── ID generation ──────────────────────────────────────────────────────────── */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
