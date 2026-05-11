'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  bg: '#F9F9F9',
  surface: '#FFFFFF',
  surface2: '#F9F9F9',
  surface3: '#F0F0F0',
  border: '#E5E5E5',
  accent: '#FF9900',
  accentHover: '#E68A00',
  accentBg: '#FFF8EC',
  accentBg2: '#FFEDBA',
  text: '#111111',
  textMuted: '#555555',
  textFaint: '#AAAAAA',
  success: '#067D62',
  warning: '#D97706',
  error: '#DC2626',
  errorBg: '#FEF2F2',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BOOK_TYPES = [
  { id: 'coloring', label: 'Coloring Book', icon: '🎨', featured: true,
    desc: 'Line-art pages for kids or adults — bold outlines, simple shapes, or intricate designs' },
  { id: 'journal',  label: 'Journal & Planner', icon: '📓', featured: true,
    desc: 'Prompts, trackers, log templates, and planner layouts for daily use' },
  { id: 'storybook', label: 'Kids Storybook', icon: '📖', featured: false,
    desc: 'Age-appropriate stories written page-by-page with scene and illustration descriptions' },
  { id: 'activity',  label: 'Activity Book', icon: '✏️', featured: false,
    desc: 'Mazes, dot-to-dot, tracing, matching, alphabet & number practice pages' },
  { id: 'nonfiction', label: 'Non-Fiction / How-To', icon: '📚', featured: false,
    desc: 'Structured chapters, outlines, and body content for guides and educational books' },
];

const AGE_GROUPS = [
  { id: '1-3', label: 'Ages 1–3' },
  { id: '2-4', label: 'Ages 2–4' },
  { id: '4-8', label: 'Ages 4–8' },
  { id: '8-12', label: 'Ages 8–12' },
  { id: 'teens', label: 'Teens' },
  { id: 'adults', label: 'Adults' },
];

const TRIM_SIZES = [
  { id: '5x8',       label: '5″ × 8″',       desc: 'Pocket — Novels & Journals' },
  { id: '5.5x8.5',   label: '5.5″ × 8.5″',   desc: 'Digest — Most popular for journals' },
  { id: '6x9',       label: '6″ × 9″',        desc: 'Standard Trade', popular: true },
  { id: '6.14x9.21', label: '6.14″ × 9.21″',  desc: 'Trade Paperback' },
  { id: '7x10',      label: '7″ × 10″',       desc: 'Workbooks & Guides' },
  { id: '8x8.5',     label: '8″ × 8.5″',      desc: 'Square Activity' },
  { id: '8.5x8.5',   label: '8.5″ × 8.5″',    desc: 'Square Coloring' },
  { id: '8.5x11',    label: '8.5″ × 11″',     desc: 'Letter — Large Coloring / Activity' },
];

const THEME_SUGGESTIONS = {
  coloring: ['Animals', 'Flowers', 'Mandalas', 'Ocean', 'Space', 'Dinosaurs', 'Fairies', 'Nature', 'Geometric'],
  storybook: ['Friendship', 'Adventure', 'Bedtime', 'Seasons', 'Family', 'Magic', 'Animals', 'School'],
  activity: ['Alphabet', 'Numbers', 'Animals', 'Colors', 'Shapes', 'Space', 'Holidays', 'Sports'],
  nonfiction: ['Cooking', 'Fitness', 'Gardening', 'Business', 'Mindfulness', 'Travel', 'Parenting', 'DIY'],
  journal: ['Gratitude', 'Wellness', 'Travel', 'Prayer', 'Fitness', 'Baby Milestones', 'Goals', 'Dreams'],
};

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fd7943,#e84393)',
  'linear-gradient(135deg,#5ee7df,#b490ca)',
  'linear-gradient(135deg,#d4fc79,#96e6a1)',
  'linear-gradient(135deg,#f77062,#fe5196)',
];

const COVER_STYLES = [
  {
    id: 'professional',
    label: 'Professional',
    prompt: 'Clean professional commercial book cover design, modern bold typography layout, strong visual hierarchy, high-end publishing aesthetic, no text in image',
  },
  {
    id: 'childrens',
    label: "Children's",
    prompt: 'Colorful playful whimsical book cover illustration, cute friendly characters, bright happy colors, fun inviting design for children, no text in image',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    prompt: 'Elegant minimalist book cover, subtle geometric shapes or single focal illustration, clean white space, sophisticated muted palette, no text in image',
  },
];

const COLOR_THEMES = [
  { id: 'violet', label: 'Violet Dream', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'rose', label: 'Rose Gold', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'ocean', label: 'Ocean Blue', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'forest', label: 'Emerald', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'midnight', label: 'Midnight', gradient: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
];

const LAYOUTS = [
  { id: 'centered', label: 'Centered' },
  { id: 'offset', label: 'Offset' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
];

// ─── Plans & Credits ─────────────────────────────────────────────────────────

const INITIAL_CREDITS = 25;

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    images: 25,
    badge: null,
    highlight: false,
    features: [
      '25 image generations (lifetime)',
      'Unlimited text AI',
      'All book types',
      'KDP export tools',
      'Cover designer',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    images: 100,
    badge: null,
    highlight: false,
    features: [
      '100 image generations/month',
      'Unlimited text AI',
      'All book types',
      'KDP export tools',
      'Cover designer',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    images: 500,
    badge: 'Most Popular',
    highlight: true,
    features: [
      '500 image generations/month',
      'Unlimited text AI',
      'All book types',
      'KDP export tools',
      'Cover designer',
      'Priority support',
      'Batch illustration',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 39,
    images: Infinity,
    badge: null,
    highlight: false,
    features: [
      'Unlimited image generations',
      'Unlimited text AI',
      'All book types',
      'KDP export tools',
      'Cover designer',
      'Priority support',
      'Batch illustration',
      'Early access to new features',
    ],
  },
];

const creditLS = {
  getCredits: () => {
    try {
      const v = localStorage.getItem('bookforge:credits');
      return v !== null ? parseInt(v, 10) : null;
    } catch {
      return null;
    }
  },
  setCredits: (n) => {
    try { localStorage.setItem('bookforge:credits', String(n)); } catch {}
  },
  getEmail: () => {
    try { return localStorage.getItem('bookforge:email') || ''; } catch { return ''; }
  },
  setEmail: (e) => {
    try { localStorage.setItem('bookforge:email', e); } catch {}
  },
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const store = {
  get: async (key) => {
    try {
      return window.storage ? await window.storage.get(key) : null;
    } catch {
      return null;
    }
  },
  set: async (key, value) => {
    try {
      if (window.storage) await window.storage.set(key, value);
    } catch {}
  },
};

// ─── AI ───────────────────────────────────────────────────────────────────────

async function callClaude(system, userMsg, maxTokens = 2048) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': 'placeholder',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

function safeJSON(text) {
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 11);

const coverGradient = (id) => {
  const h = [...(id || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[h % GRADIENTS.length];
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const typeInfo = (id) => BOOK_TYPES.find((t) => t.id === id) || BOOK_TYPES[0];
const colorTheme = (id) => COLOR_THEMES.find((t) => t.id === id) || COLOR_THEMES[0];

function parseTrimSize(trimId) {
  const [w, h] = (trimId || '6x9').split('x');
  return [parseFloat(w), parseFloat(h)];
}

function kdpSpineIn(pages) {
  return Math.max(0.0625, pages * 0.002252);
}

async function svgToDataUrl(svgStr, width, height) {
  return new Promise((resolve) => {
    try {
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    } catch { resolve(null); }
  });
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

function Spinner({ size = 18 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid #FFE8B3`,
        borderTopColor: T.accent,
        borderRadius: '50%',
        animation: 'spin 0.65s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

function Btn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style = {},
  title,
}) {
  const sizes = {
    xs: { padding: '4px 10px', fontSize: 12, gap: 4 },
    sm: { padding: '6px 13px', fontSize: 13, gap: 5 },
    md: { padding: '9px 18px', fontSize: 14, gap: 6 },
    lg: { padding: '12px 26px', fontSize: 15, gap: 7 },
  };
  const vars = {
    primary: { background: T.accent, color: '#111111', border: 'none' },
    secondary: { background: T.surface3, color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: 'transparent', color: T.textMuted, border: 'none' },
    danger: { background: T.error, color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: T.accent, border: `1px solid ${T.accent}` },
  };
  const off = disabled || loading;
  return (
    <button
      onClick={off ? undefined : onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        fontFamily: 'inherit',
        fontWeight: 500,
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.55 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...vars[variant],
        ...style,
      }}
    >
      {loading && <Spinner size={size === 'xs' || size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, style = {}, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '9px 13px',
        background: T.surface2,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        color: T.text,
        fontSize: 14,
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.border)}
      {...rest}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, style = {} }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '9px 13px',
        background: T.surface2,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        color: T.text,
        fontSize: 14,
        fontFamily: 'inherit',
        outline: 'none',
        resize: 'vertical',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        lineHeight: 1.6,
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.border)}
    />
  );
}

function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: T.textMuted,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        marginBottom: 7,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {children}
    </div>
  );
}

function Badge({ children, color = T.accent }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 9px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: color + '28',
        color,
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style = {}, onClick, hoverable }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hov ? T.accent + '70' : T.border}`,
        borderRadius: 12,
        transition: 'all 0.15s',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 4px 16px rgba(0,0,0,0.08)` : `0 1px 4px rgba(0,0,0,0.05)`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.9 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: T.textMuted, maxWidth: 340, lineHeight: 1.6, marginBottom: 28 }}>
        {desc}
      </div>
      {cta}
    </div>
  );
}

function ErrBanner({ msg, onDismiss }) {
  if (!msg) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 16px',
        background: T.errorBg,
        border: `1px solid ${T.error}50`,
        borderRadius: 8,
        color: T.error,
        fontSize: 13,
        marginBottom: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <span>⚠</span>
      <span style={{ flex: 1 }}>{msg}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: T.error, cursor: 'pointer', fontSize: 16 }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ navigate, onNew, credits, isAdmin }) {
  const creditsLow = !isAdmin && credits <= 5 && credits > 0;
  const creditsGone = !isAdmin && credits <= 0;
  return (
    <div
      style={{
        height: 56,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        flexShrink: 0,
        boxShadow: '0 1px 0 #E5E5E5',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#FF9900,#E65A00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}
        >
          📚
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, color: T.text, letterSpacing: '-0.02em' }}>
          BookForge
        </span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Credits */}
      <button
        onClick={() => navigate('pricing')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: creditsGone ? T.errorBg : creditsLow ? '#FFF3E0' : T.accentBg,
          border: `1px solid ${creditsGone ? T.error + '40' : creditsLow ? T.warning + '40' : T.accent + '40'}`,
          borderRadius: 20, padding: '5px 14px',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 14 }}>🎨</span>
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: creditsGone ? T.error : creditsLow ? T.warning : T.accent,
        }}>
          {isAdmin ? 'Unlimited' : creditsGone ? 'No credits' : `${credits} credit${credits === 1 ? '' : 's'}`}
        </span>
      </button>

      <div style={{ flex: 1 }} />

      {/* New Book */}
      <Btn onClick={onNew} size="sm">
        + New Book
      </Btn>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ view, navigate, projectCount, userEmail, onEmailChange }) {
  const [emailDraft, setEmailDraft] = useState(userEmail);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'wizard', icon: '✦', label: 'New Book' },
    { id: 'pricing', icon: '💎', label: 'Pricing' },
  ];

  return (
    <aside style={{ width: 200, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 8 }}>
      <nav style={{ padding: '8px 10px', flex: 1 }}>
        {navItems.map((item) => {
          const active =
            view === item.id ||
            (item.id === 'dashboard' && ['editor', 'cover', 'preview', 'export'].includes(view));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: active ? T.accentBg : 'transparent',
                color: active ? T.accent : T.textMuted,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                fontWeight: active ? 600 : 400,
                marginBottom: 3,
                transition: 'all 0.12s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
              {item.id === 'dashboard' && projectCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: T.surface3,
                    color: T.textMuted,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 20,
                  }}
                >
                  {projectCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}` }}>
        {showEmailInput ? (
          <div>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>Your email (for admin access)</div>
            <input
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              onBlur={() => {
                onEmailChange(emailDraft.trim());
                setShowEmailInput(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onEmailChange(emailDraft.trim());
                  setShowEmailInput(false);
                }
                if (e.key === 'Escape') setShowEmailInput(false);
              }}
              autoFocus
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: T.surface3,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: '6px 9px',
                color: T.text,
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => { setEmailDraft(userEmail); setShowEmailInput(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: T.textFaint,
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
              width: '100%',
              textAlign: 'left',
            }}
          >
            {userEmail ? `⚙ ${userEmail}` : '⚙ Set email…'}
          </button>
        )}
      </div>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ projects, onOpen, onNew, onDelete, onDuplicate }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const visible = useMemo(() => {
    return projects
      .filter((p) => {
        const ms = p.title.toLowerCase().includes(search.toLowerCase());
        const mt = filter === 'all' || p.type === filter;
        return ms && mt;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [projects, search, filter]);

  if (!projects.length) {
    return (
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg }}>
        <DashHeader title="My Books" />
        {/* Welcome banner */}
        <div style={{
          margin: '28px 36px 0',
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #FFF8EC, #FFEDBA)',
          border: `1px solid ${T.accent}40`,
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8 }}>
              Create your first KDP-ready book in minutes 🚀
            </div>
            <div style={{ fontSize: 14, color: T.textMuted, maxWidth: 480, lineHeight: 1.6 }}>
              BookForge uses AI to generate your entire book outline, page content, and illustrations.
              Perfect for coloring books and journals — no design skills needed.
            </div>
          </div>
          <Btn onClick={onNew} size="lg">
            ✦ Create Your First Book
          </Btn>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon="📚"
            title="Your studio is empty"
            desc="Create your first AI-powered book. Pick a type, set your theme, and let the AI do the heavy lifting."
          />
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DashHeader title="My Books">
        <Btn onClick={onNew}>✦ New Book</Btn>
      </DashHeader>

      <div
        style={{
          padding: '16px 36px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books…"
          style={{ maxWidth: 240 }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{ id: 'all', label: 'All' }, ...BOOK_TYPES.filter(t => t.featured).map((t) => ({ id: t.id, label: t.icon + ' ' + t.label.split(' ')[0] }))].map(
            (f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 8,
                  border: 'none',
                  background: filter === f.id ? T.accent : T.surface2,
                  color: filter === f.id ? '#fff' : T.textMuted,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  fontWeight: filter === f.id ? 700 : 400,
                  transition: 'all 0.12s',
                }}
              >
                {f.label}
              </button>
            )
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
        {visible.length === 0 ? (
          <EmptyState icon="🔍" title="Nothing found" desc="Try a different search or filter." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
              gap: 18,
            }}
          >
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => onOpen(p)}
                onDelete={() => onDelete(p.id)}
                onDuplicate={() => onDuplicate(p)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DashHeader({ title, children }) {
  return (
    <div
      style={{
        padding: '32px 40px 24px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{title}</h1>
      {children}
    </div>
  );
}

function ProjectCard({ project, onOpen, onDelete, onDuplicate }) {
  const [menu, setMenu] = useState(false);
  const info = typeInfo(project.type);
  const statusColor = { draft: T.warning, complete: T.success, published: T.accent };

  return (
    <Card hoverable style={{ overflow: 'hidden' }}>
      <div
        onClick={onOpen}
        style={{
          height: 180,
          background: coverGradient(project.id),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', padding: 12 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>{info.icon}</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.title}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.45)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 10,
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}
        >
          {project.pages?.length || 0}p
        </div>
      </div>

      <div style={{ padding: '11px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.title}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {info.label} · {fmtDate(project.updatedAt)}
            </div>
          </div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu((m) => !m);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: T.textMuted,
                cursor: 'pointer',
                padding: '2px 5px',
                fontSize: 17,
                borderRadius: 6,
                lineHeight: 1,
              }}
            >
              ⋯
            </button>
            {menu && (
              <div
                onMouseLeave={() => setMenu(false)}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 50,
                  background: T.surface2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  minWidth: 150,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.12s ease',
                }}
              >
                {[
                  { label: 'Open', icon: '📂', fn: onOpen },
                  { label: 'Duplicate', icon: '📋', fn: onDuplicate },
                  { label: 'Delete', icon: '🗑️', fn: onDelete, danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenu(false);
                      item.fn();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '9px 14px',
                      background: 'transparent',
                      border: 'none',
                      color: item.danger ? T.error : T.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 9 }}>
          <Badge color={statusColor[project.status] || T.accent}>{project.status || 'draft'}</Badge>
        </div>
      </div>
    </Card>
  );
}

// ─── New Book Wizard ──────────────────────────────────────────────────────────

const WIZARD_DEFAULT = {
  type: '',
  title: '',
  subtitle: '',
  theme: '',
  description: '',
  ageGroup: 'adults',
  trimSize: '8.5x11',
  pageCount: 24,
  complexity: 'medium',
  interiorStyle: 'single',
};

function NewBookWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(WIZARD_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const canNext = () => {
    if (step === 1) return !!data.type;
    if (step === 2) return !!data.title.trim() && !!data.theme.trim();
    if (step === 3) return !!data.ageGroup && !!data.trimSize;
    return true;
  };

  const generate = async () => {
    setLoading(true);
    setErr('');
    try {
      const info = typeInfo(data.type);
      const text = await callClaude(
        'You are a book content planner. Respond ONLY with valid JSON, no markdown, no backticks.',
        `Create a complete outline for a ${info.label} titled "${data.title}" about "${data.theme}" for ${data.ageGroup} readers.
Trim size: ${data.trimSize}. Complexity: ${data.complexity}. Interior: ${data.interiorStyle}-sided.
${data.description ? 'Additional context: ' + data.description : ''}

Return exactly ${data.pageCount} pages in this JSON format:
{"pages":[{"title":"string","content":"string"}]}

Each "content" should be 2-4 sentences describing what appears on the page. Generate all ${data.pageCount} entries.`,
        8192
      );
      const parsed = safeJSON(text);
      if (!parsed?.pages?.length) throw new Error('AI returned an unexpected format. Please try again.');

      const pages = parsed.pages.slice(0, data.pageCount).map((p, i) => ({
        id: genId(),
        order: i,
        title: p.title || `Page ${i + 1}`,
        content: p.content || '',
        notes: '',
      }));

      onComplete({
        id: genId(),
        ...data,
        pages,
        cover: {
          title: data.title,
          subtitle: data.subtitle,
          author: '',
          tagline: '',
          colorTheme: 'violet',
          layout: 'centered',
          backBlurb: '',
        },
        meta: {},
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setErr(e.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['Book Type', 'Details', 'Settings', 'Generate'];

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 36px 18px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: T.textMuted,
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
            Create New Book
          </h1>
        </div>
        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: done ? T.success : active ? T.accent : T.surface3,
                      color: done || active ? '#fff' : T.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      transition: 'all 0.2s',
                    }}
                  >
                    {done ? '✓' : n}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: active ? T.accent : T.textMuted,
                      fontWeight: active ? 700 : 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </div>
                </div>
                {i < 3 && (
                  <div
                    style={{
                      width: 56,
                      height: 2,
                      background: done ? T.success : T.surface3,
                      margin: '0 8px 18px',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
        {step === 1 && <WStep1 data={data} set={set} />}
        {step === 2 && <WStep2 data={data} set={set} />}
        {step === 3 && <WStep3 data={data} set={set} />}
        {step === 4 && <WStep4 data={data} loading={loading} err={err} onDismissErr={() => setErr('')} />}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 36px',
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Btn variant="ghost" onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}>
          {step === 1 ? 'Cancel' : '← Back'}
        </Btn>
        {step < 4 ? (
          <Btn onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Continue →
          </Btn>
        ) : (
          <Btn onClick={generate} loading={loading} disabled={loading} size="lg">
            ✦ Generate Book with AI
          </Btn>
        )}
      </div>
    </main>
  );
}

function WStep1({ data, set }) {
  const featured = BOOK_TYPES.filter((t) => t.featured);
  const coming = BOOK_TYPES.filter((t) => !t.featured);
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        What type of book are you creating?
      </div>
      <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
        Choose the format that best describes your project.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, marginBottom: 32 }}>
        {featured.map((t) => (
          <div
            key={t.id}
            onClick={() => set('type', t.id)}
            style={{
              padding: '22px 20px',
              borderRadius: 12,
              border: `2px solid ${data.type === t.id ? T.accent : T.border}`,
              background: data.type === t.id ? T.accentBg : T.surface,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: data.type === t.id ? `0 0 0 3px ${T.accent}25` : 'none',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>{t.label}</div>
            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.55 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>
            More types — coming soon
          </span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          {coming.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '16px 16px',
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.surface2,
                opacity: 0.55,
                cursor: 'not-allowed',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: T.textFaint, lineHeight: 1.45 }}>{t.desc}</div>
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: T.surface3, color: T.textMuted,
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              }}>
                Soon
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WStep2({ data, set }) {
  const suggestions = THEME_SUGGESTIONS[data.type] || [];
  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 24 }}>Book details</div>
      <Field label="Title *">
        <Input
          value={data.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. The Enchanted Forest Coloring Book"
        />
      </Field>
      <Field label="Subtitle">
        <Input
          value={data.subtitle}
          onChange={(e) => set('subtitle', e.target.value)}
          placeholder="e.g. 30 Magical Illustrations for Adults"
        />
      </Field>
      <Field label="Theme / Topic *">
        <Input
          value={data.theme}
          onChange={(e) => set('theme', e.target.value)}
          placeholder="Describe the main theme…"
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => set('theme', s)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: `1px solid ${data.theme === s ? T.accent : T.border}`,
                background: data.theme === s ? T.accent : T.surface2,
                color: data.theme === s ? '#fff' : T.textMuted,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Description (optional)">
        <Textarea
          value={data.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Style notes, special requirements, or extra context for the AI…"
          rows={3}
        />
      </Field>
    </div>
  );
}

function WStep3({ data, set }) {
  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 24 }}>Book settings</div>

      <Field label="Age Group">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AGE_GROUPS.map((ag) => (
            <ToggleChip
              key={ag.id}
              active={data.ageGroup === ag.id}
              onClick={() => set('ageGroup', ag.id)}
            >
              {ag.label}
            </ToggleChip>
          ))}
        </div>
      </Field>

      <Field label="KDP Trim Size">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {TRIM_SIZES.map((ts) => (
            <div
              key={ts.id}
              onClick={() => set('trimSize', ts.id)}
              style={{
                padding: '10px 10px',
                borderRadius: 8,
                border: `2px solid ${data.trimSize === ts.id ? T.accent : T.border}`,
                background: data.trimSize === ts.id ? T.accentBg : T.surface2,
                cursor: 'pointer',
                transition: 'all 0.12s',
                position: 'relative',
              }}
            >
              {ts.popular && (
                <span style={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 9, background: T.accent, color: '#111', borderRadius: 10,
                  padding: '1px 7px', fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  Most Popular
                </span>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: data.trimSize === ts.id ? T.accent : T.text }}>
                {ts.label}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3, lineHeight: 1.35 }}>{ts.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 8 }}>
          All sizes are KDP-approved for paperback printing.
        </div>
      </Field>

      <Field label={`Page Count — ${data.pageCount} pages`}>
        <input
          type="range"
          min={5}
          max={120}
          step={1}
          value={data.pageCount}
          onChange={(e) => set('pageCount', Number(e.target.value))}
          style={{ width: '100%', accentColor: T.accent }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted, marginTop: 4 }}>
          <span>5 pages</span>
          <span>120 pages</span>
        </div>
      </Field>

      <Field label="Complexity">
        <div style={{ display: 'flex', gap: 8 }}>
          {['simple', 'medium', 'detailed'].map((c) => (
            <ToggleChip key={c} active={data.complexity === c} onClick={() => set('complexity', c)} style={{ flex: 1, justifyContent: 'center' }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </ToggleChip>
          ))}
        </div>
      </Field>

      <Field label="Interior Style">
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ id: 'single', label: 'Single-sided' }, { id: 'double', label: 'Double-sided' }].map((s) => (
            <ToggleChip key={s.id} active={data.interiorStyle === s.id} onClick={() => set('interiorStyle', s.id)} style={{ flex: 1, justifyContent: 'center' }}>
              {s.label}
            </ToggleChip>
          ))}
        </div>
      </Field>
    </div>
  );
}

function WStep4({ data, loading, err, onDismissErr }) {
  const info = typeInfo(data.type);
  return (
    <div style={{ maxWidth: 460 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>Ready to generate</div>
      <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
        Review your settings and click Generate — the AI will create your complete {data.pageCount}-page book outline.
      </div>

      <ErrBanner msg={err} onDismiss={onDismissErr} />

      <Card style={{ padding: '0 4px', marginBottom: 16 }}>
        {[
          ['Type', `${info.icon} ${info.label}`],
          ['Title', data.title],
          data.subtitle && ['Subtitle', data.subtitle],
          ['Theme', data.theme],
          ['Age Group', data.ageGroup],
          ['Trim Size', data.trimSize],
          ['Pages', `${data.pageCount} pages`],
          ['Complexity', data.complexity],
          ['Interior', data.interiorStyle + '-sided'],
        ]
          .filter(Boolean)
          .map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 14px',
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <span style={{ fontSize: 13, color: T.textMuted }}>{k}</span>
              <span style={{ fontSize: 13, color: T.text, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
                {v}
              </span>
            </div>
          ))}
      </Card>

      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            background: T.accentBg,
            borderRadius: 10,
            border: `1px solid ${T.accent}40`,
          }}
        >
          <Spinner size={22} />
          <span style={{ color: T.accent, fontSize: 14 }}>
            Generating {data.pageCount}-page outline with AI…
          </span>
        </div>
      )}
    </div>
  );
}

function ToggleChip({ children, active, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '7px 15px',
        borderRadius: 8,
        border: `1px solid ${active ? T.accent : T.border}`,
        background: active ? T.accentBg : T.surface2,
        color: active ? T.accent : T.textMuted,
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'inherit',
        fontWeight: active ? 700 : 400,
        transition: 'all 0.12s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        background: T.surface2,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '13px 24px',
        color: T.text,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 10px 36px rgba(0,0,0,0.6)',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 18 }}>⚠️</span>
      {msg}
    </div>
  );
}

// ─── Paywall Modal ────────────────────────────────────────────────────────────

function PaywallModal({ onClose, onViewPricing }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9990,
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: '40px 36px',
          maxWidth: 420,
          width: '90%',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 52, marginBottom: 18 }}>🎨</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 12, letterSpacing: '-0.02em' }}>
          You&apos;ve used all free credits
        </h2>
        <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.75, marginBottom: 30 }}>
          Your 25 free illustration credits are gone. Upgrade to keep generating
          illustrations — all text AI features remain free forever.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn size="lg" onClick={onViewPricing}>
            View Plans
          </Btn>
          <Btn variant="secondary" size="lg" onClick={onClose}>
            Maybe later
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────

function PlanCard({ plan }) {
  return (
    <div
      style={{
        background: plan.highlight ? T.accentBg2 : T.surface2,
        border: `2px solid ${plan.highlight ? T.accent : T.border}`,
        borderRadius: 16,
        padding: 28,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {plan.badge && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: T.accent,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 14px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
          }}
        >
          {plan.badge}
        </div>
      )}
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>{plan.name}</div>
      <div style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 38, fontWeight: 800, color: plan.highlight ? T.accent : T.text }}>
          ${plan.price}
        </span>
        {plan.price > 0 && (
          <span style={{ fontSize: 14, color: T.textMuted }}>/month</span>
        )}
      </div>
      <ul style={{ listStyle: 'none', marginBottom: 28, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ fontSize: 13, color: T.textMuted, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span style={{ color: T.success, flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div style={{ position: 'relative' }}>
        <Btn
          variant={plan.highlight ? 'primary' : 'outline'}
          disabled
          style={{ width: '100%', justifyContent: 'center', pointerEvents: 'none' }}
        >
          {plan.price === 0 ? 'Current Plan' : 'Subscribe'}
        </Btn>
        {plan.price > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -9,
              right: -4,
              background: T.warning,
              color: '#000',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 9px',
              borderRadius: 20,
              whiteSpace: 'nowrap',
            }}
          >
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPage({ onBack }) {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DashHeader title="Pricing">
        <Btn variant="secondary" onClick={onBack}>
          ← Back
        </Btn>
      </DashHeader>
      <div style={{ flex: 1, overflow: 'auto', padding: '36px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.6 }}>
            Text generation is always <strong style={{ color: T.success }}>free</strong> and unlimited.
            Credits apply only to AI illustration generation.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            maxWidth: 980,
            margin: '0 auto',
          }}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <p style={{ textAlign: 'center', color: T.textFaint, fontSize: 12, marginTop: 36 }}>
          Payments not yet enabled. Subscribe buttons will activate in a future update.
        </p>
      </div>
    </main>
  );
}

// ─── Editor Tab Bar ───────────────────────────────────────────────────────────

function EditorTabBar({ view, setView }) {
  const tabs = [
    { id: 'editor', label: '✏️ Editor' },
    { id: 'cover', label: '🎨 Cover' },
    { id: 'preview', label: '👁 Preview' },
    { id: 'export', label: '📤 Export' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          style={{
            flex: 1,
            padding: '11px 8px',
            border: 'none',
            borderBottom: `2px solid ${view === tab.id ? T.accent : 'transparent'}`,
            background: 'transparent',
            color: view === tab.id ? T.accent : T.textMuted,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            fontWeight: view === tab.id ? 700 : 400,
            transition: 'all 0.12s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Book Editor ──────────────────────────────────────────────────────────────

function BookEditor({ project, onUpdate, onBack, subView, setSubView, credits, isAdmin, onUseCredit, onShowPaywall }) {
  const [pages, setPages] = useState([...(project.pages || [])].sort((a, b) => a.order - b.order));
  const [selId, setSelId] = useState(pages[0]?.id || null);
  const [aiLoading, setAiLoading] = useState({});
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [illustrationCandidates, setIllustrationCandidates] = useState(null); // { pageId, a: svg|null, b: svg|null }
  const [illustrationError, setIllustrationError] = useState(null); // { pageId, msg }

  const selPage = pages.find((p) => p.id === selId);

  const save = useCallback(
    (newPages) => {
      setPages(newPages);
      onUpdate({ ...project, pages: newPages, updatedAt: new Date().toISOString() });
    },
    [project, onUpdate]
  );

  const updatePage = useCallback(
    (id, changes) => {
      save(pages.map((p) => (p.id === id ? { ...p, ...changes } : p)));
    },
    [pages, save]
  );

  const addPage = () => {
    const np = { id: genId(), order: pages.length, title: `Page ${pages.length + 1}`, content: '', notes: '' };
    const updated = [...pages, np];
    save(updated);
    setSelId(np.id);
  };

  const delPage = (id) => {
    const updated = pages.filter((p) => p.id !== id);
    save(updated);
    if (selId === id) setSelId(updated[0]?.id || null);
  };

  const aiPageAction = async (action, pageId) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    const key = pageId + action;
    setAiLoading((l) => ({ ...l, [key]: true }));
    try {
      const info = typeInfo(project.type);
      const prompts = {
        regenerate: [
          `You are a creative writer specializing in ${info.label} content.`,
          `Rewrite this page for a ${info.label} titled "${project.title}". Page: "${page.title}". Current content: "${page.content}". Create a fresh, different version. Return only the page content text.`,
        ],
        expand: [
          `You are a creative writer specializing in ${info.label} content.`,
          `Expand this page content with more detail and depth: "${page.content}". Keep the same tone and style. Return only the expanded content text.`,
        ],
        rewrite: [
          `You are a creative writer specializing in ${info.label} content.`,
          `Rewrite this content for ${project.ageGroup} readers. Adjust vocabulary, complexity, and tone appropriately. Content: "${page.content}". Return only the rewritten content text.`,
        ],
      };
      const [sys, usr] = prompts[action];
      const result = await callClaude(sys, usr, 1024);
      updatePage(pageId, { content: result.trim() });
    } catch {}
    setAiLoading((l) => ({ ...l, [key]: false }));
  };

  const addFiveWithAI = async () => {
    setAiLoading((l) => ({ ...l, bulk: true }));
    try {
      const info = typeInfo(project.type);
      const text = await callClaude(
        'You are a book content planner. Respond ONLY with valid JSON, no markdown, no backticks.',
        `Add 5 new pages to this ${info.label} about "${project.theme}". Existing page titles: ${pages.map((p) => p.title).join(', ')}.
Return exactly: {"pages":[{"title":"string","content":"string"}]} with 5 entries.`
      );
      const parsed = safeJSON(text);
      if (parsed?.pages) {
        const newPages = [
          ...pages,
          ...parsed.pages.slice(0, 5).map((p, i) => ({
            id: genId(),
            order: pages.length + i,
            title: p.title,
            content: p.content,
            notes: '',
          })),
        ];
        save(newPages);
      }
    } catch {}
    setAiLoading((l) => ({ ...l, bulk: false }));
  };

  const generateIllustration = async (pageId) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    if (!isAdmin && credits <= 0) { onShowPaywall(); return; }
    const key = pageId + 'illustrate';
    setAiLoading((l) => ({ ...l, [key]: true }));
    setIllustrationCandidates(null);
    setIllustrationError(null);
    try {
      const system =
        'You are an SVG illustrator that creates simple, bold line art for coloring books. ' +
        'Respond ONLY with valid SVG code, no explanation, no markdown, no backticks. ' +
        "The SVG must be exactly 600x600 pixels with viewBox='0 0 600 600'. " +
        "Use only black strokes (#000000) with stroke-width='3' on a white background. " +
        'No fill colors. No gradients. Simple, recognizable shapes only — toddler-friendly with thick outlines.';

      const basePrompt =
        `Create a coloring page SVG illustration of: ${page.title}. ` +
        `Scene: ${page.content || page.title}. ` +
        'Style: simple bold outlines, suitable for toddlers to color.';

      const callApi = (userMsg) =>
        Promise.race([
          fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': 'placeholder',
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5',
              max_tokens: 4096,
              system,
              messages: [{ role: 'user', content: userMsg }],
            }),
          }).then(async (r) => {
            if (!r.ok) {
              const err = await r.json().catch(() => ({}));
              throw new Error(err?.error?.message || `API error ${r.status}`);
            }
            const data = await r.json();
            const text = data.content?.[0]?.text || '';
            const m = text.match(/<svg[\s\S]*?<\/svg>/i);
            return m ? m[0] : null;
          }),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('Timed out after 30 s')), 30000)
          ),
        ]);

      const [r1, r2] = await Promise.allSettled([
        callApi(basePrompt + ' Draw with extra detail and intricate line work.'),
        callApi(basePrompt + ' Draw with minimal shapes and broad, simple strokes.'),
      ]);

      const svgA = r1.status === 'fulfilled' ? r1.value : null;
      const svgB = r2.status === 'fulfilled' ? r2.value : null;

      if (!svgA && !svgB) {
        const msg = r1.reason?.message || r2.reason?.message || 'Both attempts failed.';
        throw new Error(msg);
      }

      setIllustrationCandidates({ pageId, a: svgA, b: svgB });
      onUseCredit();
    } catch (e) {
      setIllustrationError({ pageId, msg: e.message || 'Generation failed. Please retry.' });
    }
    setAiLoading((l) => ({ ...l, [key]: false }));
  };

  const selectIllustration = (svg) => {
    if (!illustrationCandidates) return;
    updatePage(illustrationCandidates.pageId, { illustration: svg });
    setIllustrationCandidates(null);
  };

  const downloadSVG = (page) => {
    const blob = new Blob([page.illustration], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(page.title || 'illustration').replace(/[^a-z0-9]/gi, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPNG = (page) => {
    const blob = new Blob([page.illustration], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);
      ctx.drawImage(img, 0, 0, 800, 600);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `${(page.title || 'illustration').replace(/[^a-z0-9]/gi, '_')}.png`;
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  };

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOver(null);
      return;
    }
    const fromIdx = pages.findIndex((p) => p.id === dragId);
    const toIdx = pages.findIndex((p) => p.id === targetId);
    const reordered = [...pages];
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);
    save(reordered.map((p, i) => ({ ...p, order: i })));
    setDragId(null);
    setDragOver(null);
  };

  const trimAspect = {
    '5x8': '5/8',
    '5.5x8.5': '5.5/8.5',
    '6x9': '6/9',
    '6.14x9.21': '6.14/9.21',
    '7x10': '7/10',
    '8x8.5': '8/8.5',
    '8.5x8.5': '1/1',
    '8.5x11': '8.5/11',
  }[project.trimSize] || '8.5/11';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div
        style={{
          padding: '13px 22px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 18 }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: T.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.title}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted }}>
            {typeInfo(project.type).label} · {pages.length} pages
          </div>
        </div>
        <Badge color={T.accent}>
          {typeInfo(project.type).icon} {typeInfo(project.type).label}
        </Badge>
      </div>

      <EditorTabBar view={subView} setView={setSubView} />

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Page list */}
        <div
          style={{
            width: 268,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex',
              gap: 7,
            }}
          >
            <Btn variant="secondary" size="sm" onClick={addPage} style={{ flex: 1 }}>
              + Add Page
            </Btn>
            <Btn
              variant="secondary"
              size="sm"
              onClick={addFiveWithAI}
              loading={aiLoading.bulk}
              title="Add 5 pages with AI"
            >
              ✦ +5 AI
            </Btn>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {pages.map((page, i) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => setDragId(page.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(page.id);
                }}
                onDrop={() => handleDrop(page.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setDragOver(null);
                }}
                onClick={() => setSelId(page.id)}
                style={{
                  padding: '9px 13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${selId === page.id ? T.accent : 'transparent'}`,
                  background:
                    selId === page.id
                      ? T.accentBg
                      : dragOver === page.id
                      ? T.surface3
                      : 'transparent',
                  borderBottom: `1px solid ${T.border}`,
                  transition: 'background 0.1s',
                  opacity: dragId === page.id ? 0.4 : 1,
                }}
              >
                <div style={{ fontSize: 10, color: T.textFaint, width: 18, textAlign: 'right', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: selId === page.id ? 700 : 500,
                      color: selId === page.id ? T.accent : T.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {page.title || `Page ${i + 1}`}
                    {page.illustration && (
                      <span style={{ marginLeft: 5, fontSize: 9, color: T.success, verticalAlign: 'middle' }} title="Has illustration">⬛</span>
                    )}
                  </div>
                  {page.content && (
                    <div
                      style={{
                        fontSize: 11,
                        color: T.textMuted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 1,
                      }}
                    >
                      {page.content.slice(0, 55)}…
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    delPage(page.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: T.textFaint,
                    cursor: 'pointer',
                    fontSize: 15,
                    padding: '0 2px',
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor panel */}
        {selPage ? (
          <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
            <div style={{ maxWidth: 660 }}>
              <Field label="Page Title">
                <Input
                  value={selPage.title}
                  onChange={(e) => updatePage(selPage.id, { title: e.target.value })}
                  placeholder="Page title…"
                  style={{ fontSize: 15, fontWeight: 600 }}
                />
              </Field>

              <Field label="Content / Description">
                <Textarea
                  value={selPage.content}
                  onChange={(e) => updatePage(selPage.id, { content: e.target.value })}
                  placeholder="Describe what appears on this page…"
                  rows={9}
                />
              </Field>

              {/* AI Actions */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap' }}>
                {[
                  { action: 'regenerate', label: '✦ Regenerate' },
                  { action: 'expand', label: '✦ Expand' },
                  { action: 'rewrite', label: '✦ Rewrite for age group' },
                ].map(({ action, label }) => (
                  <Btn
                    key={action}
                    variant="secondary"
                    size="sm"
                    loading={!!aiLoading[selPage.id + action]}
                    onClick={() => aiPageAction(action, selPage.id)}
                  >
                    {label}
                  </Btn>
                ))}
              </div>

              {/* Illustration Panel */}
              <Field label="Page Illustration">
                {aiLoading[selPage.id + 'illustrate'] ? (
                  /* Loading skeleton — two placeholders for the two parallel calls */
                  <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      {[1, 2].map((n) => (
                        <div
                          key={n}
                          style={{
                            flex: 1,
                            height: 200,
                            borderRadius: 10,
                            background: 'linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.4s infinite',
                            border: `1px solid ${T.border}`,
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.textMuted, fontSize: 13 }}>
                      <Spinner size={16} />
                      Generating 2 variations…
                    </div>
                  </div>
                ) : illustrationError?.pageId === selPage.id ? (
                  /* Error state */
                  <div
                    style={{
                      padding: '16px 18px',
                      background: T.errorBg,
                      border: `1px solid ${T.error}40`,
                      borderRadius: 10,
                      color: T.error,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>⚠ {illustrationError.msg}</div>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => { setIllustrationError(null); generateIllustration(selPage.id); }}
                    >
                      Retry
                    </Btn>
                  </div>
                ) : illustrationCandidates?.pageId === selPage.id ? (
                  /* Pick your favourite */
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>
                      Pick your favourite:
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {[illustrationCandidates.a, illustrationCandidates.b].map((svg, idx) =>
                        svg ? (
                          <div key={idx} style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div
                              style={{
                                background: '#fff',
                                border: `2px solid ${T.border}`,
                                borderRadius: 10,
                                overflow: 'hidden',
                                padding: 6,
                                cursor: 'pointer',
                                transition: 'border-color 0.15s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
                              onClick={() => selectIllustration(svg)}
                              dangerouslySetInnerHTML={{ __html: svg }}
                            />
                            <Btn
                              variant="primary"
                              size="sm"
                              style={{ justifyContent: 'center' }}
                              onClick={() => selectIllustration(svg)}
                            >
                              ✓ Use this one
                            </Btn>
                          </div>
                        ) : (
                          <div
                            key={idx}
                            style={{
                              flex: '1 1 200px',
                              minWidth: 0,
                              height: 200,
                              borderRadius: 10,
                              border: `1px dashed ${T.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: T.textFaint,
                              fontSize: 12,
                            }}
                          >
                            Failed
                          </div>
                        )
                      )}
                    </div>
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <Btn
                        variant="secondary"
                        size="sm"
                        loading={!!aiLoading[selPage.id + 'illustrate']}
                        onClick={() => generateIllustration(selPage.id)}
                      >
                        ↺ Regenerate Illustration Illustration
                      </Btn>
                      <Btn variant="ghost" size="sm" onClick={() => setIllustrationCandidates(null)}>
                        Dismiss
                      </Btn>
                    </div>
                  </div>
                ) : selPage.illustration ? (
                  /* Selected illustration viewer */
                  <div>
                    <div
                      style={{
                        background: '#fff',
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        overflow: 'hidden',
                        padding: 8,
                        marginBottom: 10,
                        maxWidth: 360,
                      }}
                    >
                      <div
                        style={{ width: '100%', aspectRatio: '1/1' }}
                        dangerouslySetInnerHTML={{ __html: selPage.illustration }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      <Btn
                        variant="secondary"
                        size="xs"
                        loading={!!aiLoading[selPage.id + 'illustrate']}
                        onClick={() => generateIllustration(selPage.id)}
                      >
                        ↺ Regenerate Illustration
                      </Btn>
                      <Btn variant="secondary" size="xs" onClick={() => downloadSVG(selPage)}>↓ SVG</Btn>
                      <Btn variant="secondary" size="xs" onClick={() => downloadPNG(selPage)}>↓ PNG</Btn>
                      <Btn
                        variant="ghost"
                        size="xs"
                        onClick={() => updatePage(selPage.id, { illustration: null })}
                        style={{ color: T.error }}
                      >
                        × Remove
                      </Btn>
                    </div>
                  </div>
                ) : (
                  /* Empty — no illustration yet */
                  <div>
                    <div
                      style={{
                        height: 120,
                        border: `2px dashed ${T.border}`,
                        borderRadius: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: T.textMuted,
                        fontSize: 13,
                        marginBottom: 12,
                        background: T.surface2,
                      }}
                    >
                      <span style={{ fontSize: 28, marginBottom: 8 }}>🎨</span>
                      No illustration yet
                    </div>
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <Btn
                        variant={!isAdmin && credits <= 0 ? 'secondary' : 'outline'}
                        size="sm"
                        loading={!!aiLoading[selPage.id + 'illustrate']}
                        onClick={() => generateIllustration(selPage.id)}
                        title={!isAdmin && credits <= 0 ? 'No credits — upgrade to continue' : 'Generate SVG illustration with AI'}
                      >
                        ✦ Generate Illustration
                      </Btn>
                      {!isAdmin && credits <= 0 && (
                        <span
                          style={{
                            position: 'absolute', top: -7, right: -7,
                            background: T.error, color: '#fff',
                            fontSize: 9, fontWeight: 800,
                            padding: '1px 6px', borderRadius: 20,
                            pointerEvents: 'none',
                          }}
                        >
                          0 left
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Field>

              <Field label="Private Notes">
                <Textarea
                  value={selPage.notes}
                  onChange={(e) => updatePage(selPage.id, { notes: e.target.value })}
                  placeholder="Reminder notes for yourself (not exported)…"
                  rows={2}
                />
              </Field>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState
              icon="📄"
              title="No page selected"
              desc="Click a page in the list to start editing it."
              cta={
                <Btn variant="secondary" onClick={addPage}>
                  + Add First Page
                </Btn>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cover Designer ───────────────────────────────────────────────────────────

function CoverDesigner({ project, onUpdate, subView, setSubView, onBack }) {
  const [cover, setCover] = useState(project.cover || {});
  const [genLoading, setGenLoading] = useState(false);
  const [coverGenLoading, setCoverGenLoading] = useState(false);
  const [coverCandidates, setCoverCandidates] = useState(null);
  const [coverError, setCoverError] = useState('');

  const set = (k, v) => {
    const updated = { ...cover, [k]: v };
    setCover(updated);
    onUpdate({ ...project, cover: updated, updatedAt: new Date().toISOString() });
  };

  const generateBlurb = async () => {
    setGenLoading(true);
    try {
      const text = await callClaude(
        'You are a book marketing copywriter. Write compelling Amazon book descriptions that drive sales.',
        `Write a 100-120 word back cover blurb for "${project.title}", a ${typeInfo(project.type).label} about "${project.theme}" for ${project.ageGroup} readers. Be benefit-focused and engaging. Return only the blurb text.`,
        512
      );
      set('backBlurb', text.trim());
    } catch {}
    setGenLoading(false);
  };

  const generateCoverImage = async () => {
    setCoverGenLoading(true);
    setCoverError('');
    setCoverCandidates(null);
    const title = cover.title || project.title;
    const generateOne = async (style) => {
      const prompt = `${style.prompt}. This is a book cover for "${title}" — a ${typeInfo(project.type).label} about "${project.theme || title}" for ${project.ageGroup || 'adults'} readers. Create a striking, eye-catching Amazon KDP book cover image. Square composition. Do not include any text or lettering in the image.`;
      const res = await fetch('/api/generate-cover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `${style.label} generation failed`);
      }
      const data = await res.json();
      return { style: style.id, label: style.label, b64: data.b64 };
    };
    const results = await Promise.allSettled(COVER_STYLES.map(generateOne));
    const successful = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    if (successful.length === 0) {
      const first = results.find((r) => r.status === 'rejected');
      setCoverError(first?.reason?.message || 'Cover generation failed. Check OPENAI_API_KEY in .env.local.');
    } else {
      setCoverCandidates(successful);
    }
    setCoverGenLoading(false);
  };

  const selectCoverImage = (b64) => {
    set('aiImage', b64);
    setCoverCandidates(null);
  };

  const theme = colorTheme(cover.colorTheme);
  const pageCount = project.pages?.length || 24;
  const spineIn = kdpSpineIn(pageCount);
  const [trimW, trimH] = parseTrimSize(project.trimSize);
  const fullW = trimW * 2 + spineIn + 0.25;
  const fullH = trimH + 0.25;
  const previewScale = 460 / (fullW * 96);
  const previewFrontW = Math.round(trimW * 96 * previewScale);
  const previewSpineW = Math.max(8, Math.round(spineIn * 96 * previewScale));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '13px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 18 }}>←</button>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, flex: 1 }}>Cover Designer</div>
        <div style={{ fontSize: 11, color: T.textFaint }}>
          Wraparound: {fullW.toFixed(3)}″ × {fullH.toFixed(3)}″ · Spine: {spineIn.toFixed(3)}″
        </div>
      </div>

      <EditorTabBar view={subView} setView={setSubView} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Controls panel */}
        <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${T.border}`, overflow: 'auto', padding: '22px 20px' }}>
          <Field label="Title">
            <Input value={cover.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Cover title" />
          </Field>
          <Field label="Subtitle">
            <Input value={cover.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="Subtitle" />
          </Field>
          <Field label="Author Name">
            <Input value={cover.author || ''} onChange={(e) => set('author', e.target.value)} placeholder="Your name or pen name" />
          </Field>
          <Field label="Tagline">
            <Input value={cover.tagline || ''} onChange={(e) => set('tagline', e.target.value)} placeholder="Short tagline" />
          </Field>

          {/* AI Cover Generation */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Cover Image
            </div>
            {cover.aiImage && (
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <img
                  src={`data:image/png;base64,${cover.aiImage}`}
                  alt="AI cover"
                  style={{ width: '100%', borderRadius: 8, border: `1px solid ${T.border}` }}
                />
                <button
                  onClick={() => set('aiImage', null)}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, padding: '2px 7px' }}
                >
                  ×
                </button>
              </div>
            )}
            {coverError && (
              <div style={{ fontSize: 11, color: T.error, background: T.errorBg, padding: '8px 10px', borderRadius: 6, marginBottom: 8, lineHeight: 1.5 }}>
                {coverError}
              </div>
            )}
            {coverGenLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                <Spinner size={14} />
                <span style={{ fontSize: 12, color: T.textMuted }}>Generating 3 styles…</span>
              </div>
            ) : (
              <Btn variant="secondary" size="sm" onClick={generateCoverImage} style={{ width: '100%' }}>
                ✦ Generate AI Cover (3 styles)
              </Btn>
            )}
          </div>

          <Field label="Color Theme (fallback)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {COLOR_THEMES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => set('colorTheme', ct.id)}
                  title={ct.label}
                  style={{ height: 44, borderRadius: 8, border: `3px solid ${cover.colorTheme === ct.id ? '#fff' : 'transparent'}`, background: ct.gradient, cursor: 'pointer', boxShadow: cover.colorTheme === ct.id ? '0 0 0 1px ' + T.accent : 'none', transition: 'all 0.12s' }}
                />
              ))}
            </div>
          </Field>

          <Field label="Text Layout">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {LAYOUTS.map((l) => (
                <ToggleChip key={l.id} active={cover.layout === l.id} onClick={() => set('layout', l.id)} style={{ justifyContent: 'center' }}>
                  {l.label}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Text Color">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['#ffffff', '#000000', '#FFE066', '#FF9900', '#1a1a2e'].map((color) => (
                <button
                  key={color}
                  onClick={() => set('textColor', color)}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: color, border: `3px solid ${cover.textColor === color ? T.accent : T.border}`, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                />
              ))}
            </div>
          </Field>

          <Field label="Back Cover Blurb">
            <Textarea
              value={cover.backBlurb || ''}
              onChange={(e) => set('backBlurb', e.target.value)}
              placeholder="Back cover description…"
              rows={5}
              style={{ marginBottom: 8 }}
            />
            <Btn variant="secondary" size="sm" onClick={generateBlurb} loading={genLoading}>
              ✦ Generate with AI
            </Btn>
          </Field>
        </div>

        {/* Preview area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090b14', overflow: 'auto' }}>
          {/* Candidate picker */}
          {coverCandidates && (
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e2030', background: '#0f1120', flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12, textAlign: 'center' }}>
                Pick a cover style — click to use it:
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {coverCandidates.map((c) => (
                  <div key={c.style} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img
                      src={`data:image/png;base64,${c.b64}`}
                      alt={c.label}
                      style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 8, border: '2px solid #2a2d3e', cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = T.accent; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#2a2d3e'; }}
                      onClick={() => selectCoverImage(c.b64)}
                    />
                    <button
                      onClick={() => selectCoverImage(c.b64)}
                      style={{ background: T.accent, color: '#000', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✓ {c.label}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setCoverCandidates(null)}
                  style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 22, padding: 4 }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* 3-panel KDP wrap preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>
              KDP Wraparound Preview · {project.trimSize} · {pageCount} pages
            </div>
            <div style={{ display: 'flex', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', borderRadius: 6, overflow: 'hidden' }}>
              <CoverBack cover={cover} theme={theme} width={previewFrontW} />
              <div style={{ width: previewSpineW, background: theme.gradient, filter: 'brightness(0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ writingMode: 'vertical-rl', fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '80%' }}>
                  {cover.title || project.title}
                </div>
              </div>
              <CoverFront cover={cover} project={project} theme={theme} width={previewFrontW} />
            </div>
            <div style={{ fontSize: 10, color: '#444' }}>
              Bleed guides omitted · Export PDF includes proper 0.125″ bleed on all sides
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverFront({ cover, project, theme, width = 280 }) {
  const layout = cover.layout || 'centered';
  const centered = layout === 'centered' || layout === 'minimal';
  const info = typeInfo(project.type);
  const textColor = cover.textColor || '#ffffff';
  const height = Math.round(width * (11 / 8.5));
  const hasAi = !!cover.aiImage;

  const textJustify = centered ? 'center' : layout === 'top' ? 'flex-start' : 'flex-end';
  const textAlign = centered ? 'center' : 'left';

  const scrimGradient = hasAi
    ? layout === 'top'
      ? 'linear-gradient(rgba(0,0,0,0.55) 0%, transparent 55%)'
      : 'linear-gradient(transparent 35%, rgba(0,0,0,0.72) 100%)'
    : layout === 'bold'
    ? 'rgba(0,0,0,0.38)'
    : 'none';

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', background: theme.gradient, display: 'flex', flexDirection: 'column', justifyContent: textJustify, alignItems: centered ? 'center' : 'flex-start', textAlign }}>
      {hasAi && (
        <img
          src={`data:image/png;base64,${cover.aiImage}`}
          alt="cover"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {!hasAi && layout === 'offset' && (
        <div style={{ position: 'absolute', right: -20, top: -20, width: '70%', height: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: scrimGradient }} />
      <div style={{ position: 'relative', zIndex: 1, padding: Math.round(width * 0.075) }}>
        {!hasAi && <div style={{ fontSize: Math.round(width * (layout === 'bold' ? 0.12 : 0.09)), marginBottom: 8 }}>{info.icon}</div>}
        <div style={{ fontSize: Math.round(width * (layout === 'bold' ? 0.058 : 0.048)), fontWeight: 800, color: textColor, textShadow: '0 2px 12px rgba(0,0,0,0.6)', marginBottom: 4, lineHeight: 1.2 }}>
          {cover.title || project.title}
        </div>
        {(cover.subtitle || project.subtitle) && (
          <div style={{ fontSize: Math.round(width * 0.034), color: textColor, opacity: 0.88, marginBottom: 6, lineHeight: 1.4 }}>
            {cover.subtitle || project.subtitle}
          </div>
        )}
        {cover.tagline && (
          <div style={{ fontSize: Math.round(width * 0.03), color: textColor, opacity: 0.75, fontStyle: 'italic', marginBottom: 10 }}>
            {cover.tagline}
          </div>
        )}
        {cover.author && (
          <div style={{ fontSize: Math.round(width * 0.033), color: textColor, opacity: 0.9, marginTop: 10, fontWeight: 600 }}>
            {cover.author}
          </div>
        )}
      </div>
    </div>
  );
}

function CoverBack({ cover, theme, width = 180 }) {
  const height = Math.round(width * (11 / 8.5));
  const fs = Math.max(7, Math.round(width * 0.048));
  return (
    <div style={{ width, height, background: theme.gradient, filter: 'brightness(0.78)', padding: Math.round(width * 0.085), display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
      <div style={{ fontSize: fs, color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, flex: 1, overflow: 'hidden' }}>
        {cover.backBlurb || <span style={{ opacity: 0.45, fontStyle: 'italic' }}>Back cover blurb appears here.</span>}
      </div>
      <div style={{ fontSize: Math.max(6, fs - 2), color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>ISBN</div>
    </div>
  );
}

// ─── Book Preview ─────────────────────────────────────────────────────────────

function BookPreview({ project, subView, setSubView, onBack }) {
  const pages = [...(project.pages || [])].sort((a, b) => a.order - b.order);
  const [idx, setIdx] = useState(-1);
  const thumbRef = useRef(null);

  const isFront = idx === -1;
  const isBack = idx === pages.length;
  const curPage = !isFront && !isBack ? pages[idx] : null;
  const theme = colorTheme(project.cover?.colorTheme);

  useEffect(() => {
    if (!thumbRef.current) return;
    const el = thumbRef.current.querySelector(`[data-thumb="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [idx]);

  const thumbBox = (active) => ({
    flexShrink: 0, cursor: 'pointer',
    border: `2px solid ${active ? T.accent : 'transparent'}`,
    borderRadius: 4, overflow: 'hidden',
    opacity: active ? 1 : 0.55,
    transition: 'all 0.15s',
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '13px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 18 }}>←</button>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: T.text }}>Book Preview</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {isFront ? 'Front Cover' : isBack ? 'Back Cover' : `Page ${idx + 1} of ${pages.length}`}
        </div>
      </div>

      <EditorTabBar view={subView} setView={setSubView} />

      {/* Main viewer */}
      <div style={{ flex: 1, background: '#07090f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflow: 'auto' }}>
        {isFront ? (
          <div style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.7)', borderRadius: 6, overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
            <CoverFront cover={project.cover || {}} project={project} theme={theme} width={300} />
          </div>
        ) : isBack ? (
          <div style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.7)', borderRadius: 6, overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
            <CoverBack cover={project.cover || {}} theme={theme} width={300} />
          </div>
        ) : (
          <div style={{ width: 300, background: '#fff', borderRadius: 4, boxShadow: '0 24px 80px rgba(0,0,0,0.7)', overflow: 'hidden', animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column' }}>
            {curPage?.illustration ? (
              <div
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, background: '#fff', minHeight: 360 }}
                dangerouslySetInnerHTML={{ __html: curPage.illustration }}
              />
            ) : (
              <div style={{ flex: 1, minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎨</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#222', marginBottom: 6, textAlign: 'center' }}>{curPage?.title}</div>
                <div style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}>No illustration yet — generate one in the editor</div>
              </div>
            )}
            <div style={{ padding: '7px 12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#ccc' }}>{idx + 1}</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav bar */}
      <div style={{ padding: '10px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexShrink: 0 }}>
        <Btn variant="secondary" onClick={() => setIdx((i) => i - 1)} disabled={isFront}>← Prev</Btn>
        <div style={{ fontSize: 13, color: T.textMuted, minWidth: 120, textAlign: 'center' }}>
          {isFront ? 'Front Cover' : isBack ? 'Back Cover' : `${idx + 1} / ${pages.length}`}
        </div>
        <Btn variant="secondary" onClick={() => setIdx((i) => i + 1)} disabled={isBack}>Next →</Btn>
      </div>

      {/* Thumbnail strip */}
      <div ref={thumbRef} style={{ display: 'flex', overflowX: 'auto', gap: 8, padding: '10px 14px', borderTop: `1px solid ${T.border}`, background: T.surface2, flexShrink: 0, scrollbarWidth: 'thin' }}>
        <div data-thumb={-1} style={thumbBox(idx === -1)} onClick={() => setIdx(-1)}>
          <CoverFront cover={project.cover || {}} project={project} theme={theme} width={40} />
        </div>
        {pages.map((p, i) => (
          <div key={p.id} data-thumb={i} style={thumbBox(idx === i)} onClick={() => setIdx(i)}>
            {p.illustration ? (
              <div
                style={{ width: 40, height: 52, background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 0 }}
                dangerouslySetInnerHTML={{ __html: p.illustration.replace(/(<svg[^>]*)\s+width="[^"]*"/, '$1 width="40"').replace(/(<svg[^>]*)\s+height="[^"]*"/, '$1 height="52"') }}
              />
            ) : (
              <div style={{ width: 40, height: 52, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                <span style={{ fontSize: 7, color: '#bbb', textAlign: 'center', lineHeight: 1.3 }}>{p.title?.slice(0, 12)}</span>
              </div>
            )}
          </div>
        ))}
        <div data-thumb={pages.length} style={thumbBox(idx === pages.length)} onClick={() => setIdx(pages.length)}>
          <CoverBack cover={project.cover || {}} theme={theme} width={40} />
        </div>
      </div>
    </div>
  );
}

// ─── Export / Publish ─────────────────────────────────────────────────────────

function ExportSettings({ project, onUpdate, subView, setSubView, onBack }) {
  const [meta, setMeta] = useState(project.meta || {});
  const [keywords, setKeywords] = useState(
    (project.meta?.keywords?.length === 7 ? project.meta.keywords : Array(7).fill(''))
  );
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState('');

  const downloadInteriorPdf = async () => {
    setLoading((l) => ({ ...l, pdf: true }));
    try {
      const { jsPDF } = await import('jspdf');
      const [tw, th] = parseTrimSize(project.trimSize);
      const margin = 0.5;
      const doc = new jsPDF({ unit: 'in', format: [tw, th] });
      const sortedPages = [...(project.pages || [])].sort((a, b) => a.order - b.order);

      for (let i = 0; i < sortedPages.length; i++) {
        if (i > 0) doc.addPage([tw, th]);
        const page = sortedPages[i];
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, tw, th, 'F');

        if (page.illustration) {
          const px = Math.round(tw * 150);
          const py = Math.round(th * 150);
          const jpegData = await svgToDataUrl(page.illustration, px, py);
          if (jpegData) {
            const imgW = tw - margin * 2;
            const imgH = th - margin * 2 - 0.25;
            doc.addImage(jpegData, 'JPEG', margin, margin, imgW, imgH);
          }
        } else {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 30, 30);
          doc.text(page.title || '', tw / 2, margin + 0.45, { align: 'center' });
          if (page.content) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const lines = doc.splitTextToSize(page.content, tw - margin * 2);
            doc.text(lines, margin, margin + 0.85);
          }
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text(String(i + 1), tw / 2, th - 0.22, { align: 'center' });
      }

      doc.save(`${project.title || 'book'}-interior.pdf`);
    } catch (err) {
      alert('PDF generation failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading((l) => ({ ...l, pdf: false }));
  };

  const downloadCoverPdf = async () => {
    setLoading((l) => ({ ...l, coverpdf: true }));
    try {
      const { jsPDF } = await import('jspdf');
      const cover = project.cover || {};
      const [tw, th] = parseTrimSize(project.trimSize);
      const pageCount = project.pages?.length || 24;
      const spineIn = kdpSpineIn(pageCount);
      const bleed = 0.125;
      const totalW = tw * 2 + spineIn + bleed * 2;
      const totalH = th + bleed * 2;

      const doc = new jsPDF({ unit: 'in', format: [totalW, totalH], orientation: 'landscape' });

      // Background: approximate gradient with solid fill from first color
      const themeObj = colorTheme(cover.colorTheme);
      const hex = (themeObj.gradient.match(/#([0-9a-fA-F]{6})/g) || ['#667eea'])[0].slice(1);
      doc.setFillColor(parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16));
      doc.rect(0, 0, totalW, totalH, 'F');

      // AI cover image on front panel
      if (cover.aiImage) {
        const fx = bleed + tw + spineIn;
        doc.addImage(`data:image/png;base64,${cover.aiImage}`, 'PNG', fx, bleed, tw, th);
      }

      // Front text
      const textColor = cover.textColor || '#ffffff';
      const tc = textColor.slice(1);
      doc.setTextColor(parseInt(tc.slice(0,2),16), parseInt(tc.slice(2,4),16), parseInt(tc.slice(4,6),16));
      const ftx = bleed + tw + spineIn + tw / 2;
      doc.setFontSize(Math.max(14, tw * 8));
      doc.setFont('helvetica', 'bold');
      doc.text(cover.title || project.title || '', ftx, bleed + th * 0.62, { align: 'center', maxWidth: tw - 0.4 });
      if (cover.author) {
        doc.setFontSize(Math.max(9, tw * 5));
        doc.setFont('helvetica', 'normal');
        doc.text(cover.author, ftx, bleed + th * 0.8, { align: 'center', maxWidth: tw - 0.4 });
      }

      // Spine text (rotated)
      if (spineIn >= 0.2) {
        doc.setFontSize(Math.max(7, spineIn * 28));
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        const sx = bleed + tw + spineIn / 2;
        doc.text(cover.title || project.title || '', sx, bleed + th / 2, { angle: 90, align: 'center' });
      }

      // Back blurb
      if (cover.backBlurb) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(240, 240, 240);
        const lines = doc.splitTextToSize(cover.backBlurb, tw - 0.5);
        doc.text(lines, bleed + 0.25, bleed + 0.4);
      }

      // Crop/bleed guide lines
      doc.setDrawColor(220, 40, 40);
      doc.setLineWidth(0.004);
      doc.line(bleed, 0, bleed, totalH);
      doc.line(totalW - bleed, 0, totalW - bleed, totalH);
      doc.line(0, bleed, totalW, bleed);
      doc.line(0, totalH - bleed, totalW, totalH - bleed);
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.003);
      doc.line(bleed + tw, 0, bleed + tw, totalH);
      doc.line(bleed + tw + spineIn, 0, bleed + tw + spineIn, totalH);

      doc.save(`${project.title || 'book'}-cover.pdf`);
    } catch (err) {
      alert('Cover PDF failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading((l) => ({ ...l, coverpdf: false }));
  };

  const setM = (k, v) => {
    const updated = { ...meta, [k]: v };
    setMeta(updated);
    onUpdate({ ...project, meta: updated, status: 'complete', updatedAt: new Date().toISOString() });
  };

  const saveKeywords = (kw) => {
    setKeywords(kw);
    setM('keywords', kw);
  };

  const genKeywords = async () => {
    setLoading((l) => ({ ...l, kw: true }));
    try {
      const text = await callClaude(
        'You are an Amazon KDP keyword specialist. Generate 7 high-converting, specific long-tail keywords. Respond with ONLY a JSON array of 7 strings, no markdown, no explanation.',
        `Generate 7 KDP long-tail keywords for a ${typeInfo(project.type).label} titled "${project.title}" about "${project.theme}" for ${project.ageGroup} readers. Prioritize buyer-intent phrases.`
      );
      const parsed = safeJSON(text);
      if (Array.isArray(parsed)) saveKeywords([...parsed.slice(0, 7), ...Array(7).fill('')].slice(0, 7));
    } catch {}
    setLoading((l) => ({ ...l, kw: false }));
  };

  const genDescription = async () => {
    setLoading((l) => ({ ...l, desc: true }));
    try {
      const text = await callClaude(
        'You are a book marketing copywriter. Write compelling Amazon book descriptions that drive sales.',
        `Write a 200-250 word Amazon book description for "${project.title}", a ${typeInfo(project.type).label} about "${project.theme}" for ${project.ageGroup} readers. Include key benefits, features, and a strong call to action. Use HTML-compatible formatting with paragraphs.`,
        768
      );
      setM('description', text.trim());
    } catch {}
    setLoading((l) => ({ ...l, desc: false }));
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {}
  };

  const pageCount = project.pages?.length || 24;
  const printCost = (0.85 + pageCount * 0.012).toFixed(2);
  const minPrice = (Number(printCost) * 2.5).toFixed(2);
  const recPrice = (Number(printCost) * 4).toFixed(2);

  const checklist = [
    { label: 'Book title', pass: !!project.title },
    { label: 'Author name', pass: !!project.cover?.author },
    { label: 'Book description written', pass: !!meta.description },
    { label: 'All 7 keywords entered', pass: keywords.filter((k) => k.trim()).length === 7 },
    { label: 'Pages generated', pass: pageCount > 0 },
    { label: 'Cover designed', pass: !!project.cover?.colorTheme },
    { label: 'Back cover blurb', pass: !!project.cover?.backBlurb },
  ];
  const score = checklist.filter((c) => c.pass).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          padding: '13px 22px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 18 }}
        >
          ←
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, flex: 1 }}>Export & Publish</div>
        <Badge color={score === checklist.length ? T.success : T.warning}>
          {score}/{checklist.length} ready
        </Badge>
      </div>

      <EditorTabBar view={subView} setView={setSubView} />

      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, maxWidth: 980 }}>
          {/* Left: Metadata */}
          <div>
            <SectionTitle>KDP Metadata</SectionTitle>

            {[
              { label: 'Title', key: 'title', fallback: project.title || '' },
              { label: 'Subtitle', key: 'subtitle', fallback: project.subtitle || '' },
              { label: 'Author', key: 'author', fallback: project.cover?.author || '' },
            ].map(({ label, key, fallback }) => {
              const val = meta[key] || fallback;
              return (
                <Field key={key} label={label}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Input value={val} onChange={(e) => setM(key, e.target.value)} style={{ flex: 1 }} />
                    {val && (
                      <button
                        onClick={() => copyToClipboard(val, key)}
                        style={{ flexShrink: 0, background: T.surface3, border: `1px solid ${T.border}`, borderRadius: 6, color: copied === key ? T.success : T.textMuted, cursor: 'pointer', fontSize: 11, padding: '0 10px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                      >
                        {copied === key ? '✓' : 'Copy'}
                      </button>
                    )}
                  </div>
                </Field>
              );
            })}

            <Field label="Book Description">
              <div style={{ position: 'relative' }}>
                <Textarea
                  value={meta.description || ''}
                  onChange={(e) => setM('description', e.target.value)}
                  placeholder="Your Amazon book description…"
                  rows={8}
                />
                {meta.description && (
                  <button
                    onClick={() => copyToClipboard(meta.description, 'desc')}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: T.surface3,
                      border: `1px solid ${T.border}`,
                      borderRadius: 6,
                      color: copied === 'desc' ? T.success : T.textMuted,
                      cursor: 'pointer',
                      fontSize: 11,
                      padding: '3px 8px',
                      fontFamily: 'inherit',
                    }}
                  >
                    {copied === 'desc' ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <Btn variant="secondary" size="sm" onClick={genDescription} loading={loading.desc}>
                  ✦ Generate with AI
                </Btn>
              </div>
            </Field>

            <Field label="Keywords (7 — one per field)">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <Btn variant="secondary" size="sm" onClick={genKeywords} loading={loading.kw}>
                  ✦ Generate with AI
                </Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {keywords.map((kw, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 12, color: T.textFaint, width: 16, textAlign: 'right', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <Input
                      value={kw}
                      onChange={(e) => {
                        const nk = [...keywords];
                        nk[i] = e.target.value;
                        saveKeywords(nk);
                      }}
                      placeholder={`Keyword ${i + 1}…`}
                    />
                  </div>
                ))}
              </div>
              {keywords.filter((k) => k.trim()).length === 7 && (
                <div style={{ marginTop: 8 }}>
                  <Btn
                    variant="ghost"
                    size="xs"
                    onClick={() => copyToClipboard(keywords.join('\n'), 'kw')}
                    style={{ color: copied === 'kw' ? T.success : T.textMuted }}
                  >
                    {copied === 'kw' ? '✓ Copied all keywords' : 'Copy all keywords'}
                  </Btn>
                </div>
              )}
            </Field>
          </div>

          {/* Right: Checklist + Pricing */}
          <div>
            <SectionTitle>KDP Readiness</SectionTitle>
            <Card style={{ padding: '4px 0', marginBottom: 24 }}>
              {checklist.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 16px',
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{item.pass ? '✅' : '⬜'}</span>
                  <span style={{ fontSize: 13, color: item.pass ? T.text : T.textMuted }}>{item.label}</span>
                </div>
              ))}
              <div style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: score === checklist.length ? T.success : T.accent,
                  }}
                >
                  {score}/{checklist.length}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>items complete</div>
              </div>
            </Card>

            <SectionTitle>Price Estimate</SectionTitle>
            <Card style={{ padding: '4px 0', marginBottom: 24 }}>
              <div style={{ padding: '10px 16px', fontSize: 12, color: T.textMuted, borderBottom: `1px solid ${T.border}` }}>
                Based on {pageCount} pages · {project.trimSize}
              </div>
              {[
                ['Est. Printing Cost', `$${printCost}`],
                ['Minimum List Price', `$${minPrice}`],
                ['Recommended Price', `$${recPrice}`, true],
              ].map(([label, val, bold]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 16px',
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: bold ? 800 : 600,
                      color: bold ? T.accent : T.text,
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
              <div style={{ padding: '10px 16px', fontSize: 11, color: T.textFaint }}>
                Estimates only. Verify on KDP royalties calculator.
              </div>
            </Card>

            <SectionTitle>Download PDFs</SectionTitle>
            <Card style={{ padding: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Btn onClick={downloadInteriorPdf} loading={loading.pdf} style={{ width: '100%', justifyContent: 'center' }}>
                  📥 Download Interior PDF
                </Btn>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, marginTop: -4 }}>
                  {pageCount} pages · {project.trimSize} trim · SVG illustrations embedded
                </div>
                <Btn onClick={downloadCoverPdf} loading={loading.coverpdf} style={{ width: '100%', justifyContent: 'center' }}>
                  📥 Download KDP Cover PDF
                </Btn>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, marginTop: -4 }}>
                  Full wraparound · back + spine + front · 0.125″ bleed included · crop guides
                </div>
              </div>
            </Card>

            <SectionTitle>KDP Upload Instructions</SectionTitle>
            <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              {[
                { step: 1, label: 'Go to kdp.amazon.com → Create → Paperback' },
                { step: 2, label: `Set trim size to ${project.trimSize} inches` },
                { step: 3, label: `Upload interior PDF (${pageCount} pages, no bleed)` },
                { step: 4, label: 'Upload cover wraparound PDF (includes bleed)' },
                { step: 5, label: `Price at minimum $${minPrice} — recommended $${recPrice}` },
              ].map(({ step, label }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 16px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: T.accentBg, color: T.accent, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step}</div>
                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, paddingTop: 2 }}>{label}</div>
                </div>
              ))}
              <div style={{ padding: '10px 16px' }}>
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const content = [
                      project.title,
                      project.subtitle && `Subtitle: ${project.subtitle}`,
                      `Type: ${typeInfo(project.type).label}`,
                      `Trim: ${project.trimSize}`,
                      `Pages: ${pageCount}`,
                      '',
                      '--- PAGES ---',
                      ...(project.pages || [])
                        .sort((a, b) => a.order - b.order)
                        .map((p, i) => `\nPage ${i + 1}: ${p.title}\n${p.content}`),
                    ].filter(Boolean).join('\n');
                    copyToClipboard(content, 'export');
                  }}
                >
                  {copied === 'export' ? '✓ Copied!' : '📋 Copy All Page Content'}
                </Btn>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: T.text,
        marginBottom: 16,
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const EDITOR_VIEWS = ['editor', 'cover', 'preview', 'export'];

export default function BookForgeApp() {
  const [view, setView] = useState('dashboard');
  const [subView, setSubView] = useState('editor');
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Credits & identity
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [userEmail, setUserEmail] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState(null);

  const isAdmin = Boolean(
    ADMIN_EMAIL && userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  useEffect(() => {
    const stored = creditLS.getCredits();
    setCredits(stored !== null ? stored : INITIAL_CREDITS);
    if (stored === null) creditLS.setCredits(INITIAL_CREDITS);
    setUserEmail(creditLS.getEmail());
  }, []);

  const handleEmailChange = (email) => {
    setUserEmail(email);
    creditLS.setEmail(email);
  };

  const handleUseCredit = useCallback(() => {
    if (isAdmin) return;
    setCredits((prev) => {
      const next = Math.max(0, prev - 1);
      creditLS.setCredits(next);
      if (next === 5) setToast('5 illustration credits remaining — consider upgrading!');
      if (next === 1) setToast('Only 1 illustration credit left!');
      if (next === 0) setToast('You\'ve used your last illustration credit.');
      return next;
    });
  }, [isAdmin]);

  useEffect(() => {
    (async () => {
      const saved = await store.get('bookforge:projects');
      if (Array.isArray(saved)) setProjects(saved);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) store.set('bookforge:projects', projects);
  }, [projects, loaded]);

  const saveProject = useCallback((project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      return exists ? prev.map((p) => (p.id === project.id ? project : p)) : [...prev, project];
    });
  }, []);

  const handleWizardComplete = (project) => {
    saveProject(project);
    setSelectedId(project.id);
    setSubView('editor');
    setView('editor');
  };

  const handleOpen = (project) => {
    setSelectedId(project.id);
    setSubView('editor');
    setView('editor');
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setView('dashboard');
    }
  };

  const handleDuplicate = (project) => {
    const dup = {
      ...project,
      id: genId(),
      title: project.title + ' (Copy)',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, dup]);
  };

  const handleUpdate = useCallback(
    (updated) => {
      saveProject(updated);
    },
    [saveProject]
  );

  const navigate = (dest) => {
    if (dest === 'wizard') {
      setView('wizard');
    } else if (dest === 'dashboard') {
      setSelectedId(null);
      setView('dashboard');
    } else if (dest === 'pricing') {
      setView('pricing');
    }
  };

  const currentProject = useMemo(
    () => projects.find((p) => p.id === selectedId) || null,
    [projects, selectedId]
  );

  const isEditorArea = EDITOR_VIEWS.includes(view);

  const editorProps = {
    project: currentProject,
    onUpdate: handleUpdate,
    onBack: () => setView('dashboard'),
    subView,
    setSubView: (v) => {
      setSubView(v);
      setView(v);
    },
    credits,
    isAdmin,
    onUseCredit: handleUseCredit,
    onShowPaywall: () => setShowPaywall(true),
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: 'inherit', overflow: 'hidden' }}>
      <TopBar
        navigate={navigate}
        onNew={() => setView('wizard')}
        credits={credits}
        isAdmin={isAdmin}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <Sidebar
        view={view}
        navigate={navigate}
        projectCount={projects.length}
        userEmail={userEmail}
        onEmailChange={handleEmailChange}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {view === 'dashboard' && (
          <Dashboard
            projects={projects}
            onOpen={handleOpen}
            onNew={() => setView('wizard')}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        )}

        {view === 'wizard' && (
          <NewBookWizard
            onComplete={handleWizardComplete}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'pricing' && (
          <PricingPage onBack={() => setView('dashboard')} />
        )}

        {view === 'editor' && currentProject && (
          <BookEditor key={currentProject.id} {...editorProps} />
        )}

        {view === 'cover' && currentProject && (
          <CoverDesigner key={currentProject.id + 'cover'} {...editorProps} />
        )}

        {view === 'preview' && currentProject && (
          <BookPreview key={currentProject.id + 'preview'} {...editorProps} />
        )}

        {view === 'export' && currentProject && (
          <ExportSettings key={currentProject.id + 'export'} {...editorProps} />
        )}

        {isEditorArea && !currentProject && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState
              icon="🔍"
              title="No book selected"
              desc="Go back to the dashboard and open a book to edit."
              cta={
                <Btn onClick={() => setView('dashboard')} variant="secondary">
                  ← Back to Dashboard
                </Btn>
              }
            />
          </div>
        )}
      </div>

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onViewPricing={() => { setShowPaywall(false); navigate('pricing'); }}
        />
      )}

      {toast && (
        <Toast msg={toast} onDone={() => setToast(null)} />
      )}
      </div>
    </div>
  );
}
