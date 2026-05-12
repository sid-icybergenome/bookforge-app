'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Palette,
  BookOpen,
  PenLine,
  FileText,
  Ruler,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { loadEmail, saveEmail, isAdmin, loadCredits } from '@/lib/storage';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  starred?: boolean;
}

const DASHBOARD_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/', icon: <LayoutDashboard size={16} /> },
];

const GENERATOR_ITEMS: NavItem[] = [
  { label: 'Coloring Books', href: '/', icon: <Palette size={16} />, starred: true },
  { label: 'Journals',       href: '#', icon: <BookOpen size={16} />, comingSoon: true },
  { label: 'Kids Books',     href: '#', icon: <PenLine size={16} />,  comingSoon: true },
  { label: 'Non-Fiction',    href: '#', icon: <FileText size={16} />, comingSoon: true },
];

const TOOLS_ITEMS: NavItem[] = [
  { label: 'Cover Designer',   href: '#',                 icon: <Palette size={16} /> },
  { label: 'Trim Calculator',  href: '/trim-calculator',  icon: <Ruler size={16} />   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = loadEmail();
    setEmail(stored);
    setEmailInput(stored);
  }, []);

  function handleEmailSave() {
    saveEmail(emailInput.trim());
    setEmail(emailInput.trim());
    setEditingEmail(false);
  }

  const admin = mounted && isAdmin(email);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
      style={{
        background: '#FFFFFF',
        borderRight: '1px solid #E5E5E5',
        minWidth: 240,
        maxWidth: 240,
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid #E5E5E5' }}>
        <div
          className="flex items-center justify-center rounded-lg text-white text-lg font-bold"
          style={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, #FF9900 0%, #E68A00 100%)',
            flexShrink: 0,
          }}
        >
          📚
        </div>
        <div>
          <div className="font-bold leading-tight" style={{ fontSize: 14, color: '#111111' }}>
            KDP Studio AI
          </div>
          <div style={{ fontSize: 11, color: '#888888' }}>Coloring Book Studio</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        <NavSection label="DASHBOARD" items={DASHBOARD_ITEMS} isActive={isActive} />
        <NavSection label="BOOK GENERATORS" items={GENERATOR_ITEMS} isActive={isActive} />
        <NavSection label="KDP TOOLS" items={TOOLS_ITEMS} isActive={isActive} />
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 pb-4 flex flex-col gap-2" style={{ borderTop: '1px solid #E5E5E5', paddingTop: 12 }}>
        {/* Upgrade button */}
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-1.5 w-full rounded-lg font-semibold transition-colors"
          style={{
            background: '#FF9900',
            color: '#FFFFFF',
            padding: '9px 14px',
            fontSize: 13,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E68A00')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9900')}
        >
          <Zap size={14} />
          Upgrade to Pro
        </Link>

        {/* Email / admin */}
        {editingEmail ? (
          <div className="flex gap-1">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSave()}
              placeholder="your@email.com"
              className="flex-1 rounded px-2 py-1 text-xs"
              style={{
                border: '1px solid #E5E5E5',
                color: '#111111',
                background: '#FFFFFF',
                outline: 'none',
              }}
              autoFocus
            />
            <button
              onClick={handleEmailSave}
              className="text-xs px-2 py-1 rounded font-medium"
              style={{ background: '#FF9900', color: '#FFFFFF' }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingEmail(true)}
            className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded transition-colors"
            style={{ color: '#555555' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F9F9F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: admin ? '#067D62' : '#888888', fontSize: 10 }}
            >
              {mounted && email ? email[0].toUpperCase() : '?'}
            </span>
            <span className="flex-1 truncate" style={{ fontSize: 12 }}>
              {mounted && email ? email : 'Set your email'}
            </span>
            {admin && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{ background: '#E6F4F1', color: '#067D62', fontSize: 10 }}
              >
                Admin
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}

/* ── Nav section ── */
function NavSection({
  label,
  items,
  isActive,
}: {
  label: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
}) {
  return (
    <div>
      <div
        className="font-semibold tracking-wider mb-1 px-2"
        style={{ fontSize: 10, color: '#888888', letterSpacing: '0.08em' }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavItemRow key={item.label} item={item} active={!item.comingSoon && isActive(item.href)} />
        ))}
      </div>
    </div>
  );
}

function NavItemRow({ item, active }: { item: NavItem; active: boolean }) {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 10px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: item.comingSoon ? 'default' : 'pointer',
    transition: 'background 150ms, color 150ms',
    textDecoration: 'none',
    color: item.comingSoon ? '#888888' : active ? '#111111' : '#555555',
    background: active ? '#FFF8E7' : 'transparent',
    borderLeft: active ? '3px solid #FF9900' : '3px solid transparent',
    userSelect: 'none',
    position: 'relative',
  };

  const inner = (
    <>
      <span style={{ color: item.comingSoon ? '#BBBBBB' : active ? '#FF9900' : '#888888', flexShrink: 0 }}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.starred && !item.comingSoon && (
        <ChevronRight size={12} style={{ color: '#FF9900', opacity: 0.7 }} />
      )}
      {item.comingSoon && (
        <span
          className="text-xs rounded px-1.5 py-0.5"
          style={{ background: '#F3F4F6', color: '#888888', fontSize: 10, fontWeight: 500 }}
        >
          soon
        </span>
      )}
    </>
  );

  if (item.comingSoon) {
    return <div style={base}>{inner}</div>;
  }

  return (
    <Link
      href={item.href}
      style={base}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = '#F9F9F9';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {inner}
    </Link>
  );
}
