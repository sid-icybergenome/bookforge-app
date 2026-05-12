'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { loadCredits, loadEmail, isAdmin } from '@/lib/storage';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const email = loadEmail();
    setCredits(loadCredits());
    setAdmin(isAdmin(email));

    /* Re-sync credits if another tab changes localStorage */
    function onStorage(e: StorageEvent) {
      if (e.key === 'kdp_studio_credits') {
        setCredits(loadCredits());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6"
      style={{
        height: 56,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        flexShrink: 0,
      }}
    >
      {/* Left: page title */}
      <h1 className="font-semibold truncate" style={{ fontSize: 16, color: '#111111' }}>
        {title}
      </h1>

      {/* Right: pills + credits + upgrade */}
      <div className="flex items-center gap-3">
        {/* Demo mode pill */}
        <span
          className="rounded-full px-3 py-1 font-medium"
          style={{ background: '#F3F4F6', color: '#555555', fontSize: 12 }}
        >
          Demo mode
        </span>

        {/* See Pricing link */}
        <Link
          href="/pricing"
          className="font-medium transition-colors"
          style={{ fontSize: 13, color: '#555555' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FF9900')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
        >
          See Pricing →
        </Link>

        {/* Credits counter */}
        {credits !== null && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{
              background: admin ? '#E6F4F1' : '#FFF8E7',
              border: `1px solid ${admin ? '#C3E4DE' : '#FFE4B5'}`,
              fontSize: 13,
              fontWeight: 500,
              color: admin ? '#067D62' : '#AA6600',
            }}
          >
            <span>🎨</span>
            <span>{admin ? '∞' : credits} credits</span>
          </div>
        )}

        {/* Upgrade button */}
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 rounded-lg font-semibold transition-colors"
          style={{
            background: '#FF9900',
            color: '#FFFFFF',
            padding: '7px 14px',
            fontSize: 13,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E68A00')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF9900')}
        >
          <Zap size={13} />
          Upgrade
        </Link>
      </div>
    </header>
  );
}
