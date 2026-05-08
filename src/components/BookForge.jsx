'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  bg: '#0f1117',
  surface: '#181b28',
  surface2: '#1f2235',
  surface3: '#272b42',
  border: '#2a2f4a',
  accent: '#a78bfa',
  accentHover: '#c4b5fd',
  accentBg: '#1e1b4b',
  accentBg2: '#2d265a',
  text: '#e2e8f0',
  textMuted: '#8892a4',
  textFaint: '#3d4568',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  errorBg: '#3b0d0d',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BOOK_TYPES = [
  {
    id: 'coloring',
    label: 'Coloring Book',
    icon: '🎨',
    desc: 'Line-art pages for kids or adults — bold outlines, simple shapes, or intricate designs',
  },
  {
    id: 'storybook',
    label: 'Kids Storybook',
    icon: '📖',
    desc: 'Age-appropriate stories written page-by-page with scene and illustration descriptions',
  },
  {
    id: 'activity',
    label: 'Activity Book',
    icon: '✏️',
    desc: 'Mazes, dot-to-dot, tracing, matching, alphabet & number practice pages',
  },
  {
    id: 'nonfiction',
    label: 'Non-Fiction / How-To',
    icon: '📚',
    desc: 'Structured chapters, outlines, and body content for guides and educational books',
  },
  {
    id: 'journal',
    label: 'Journal & Planner',
    icon: '📔',
    desc: 'Prompts, trackers, log templates, and planner layouts for daily use',
  },
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
  { id: '6x9', label: '6 × 9 in', desc: 'Standard' },
  { id: '8x10', label: '8 × 10 in', desc: 'Square-ish' },
  { id: '8.5x11', label: '8.5 × 11 in', desc: 'Full page' },
  { id: '5x8', label: '5 × 8 in', desc: 'Pocket' },
  { id: '5.5x8.5', label: '5.5 × 8.5 in', desc: 'Half letter' },
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

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

function Spinner({ size = 18 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${T.accentBg2}`,
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
    primary: { background: T.accent, color: '#fff', border: 'none' },
    secondary: {
      background: T.surface3,
      color: T.text,
      border: `1px solid ${T.border}`,
    },
    ghost: { background: 'transparent', color: T.textMuted, border: 'none' },
    danger: { background: T.error, color: '#fff', border: 'none' },
    outline: {
      background: 'transparent',
      color: T.accent,
      border: `1px solid ${T.accent}`,
    },
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
        boxShadow: hov ? `0 8px 24px rgba(0,0,0,0.25)` : 'none',
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ view, navigate, projectCount }) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '22px 18px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 19,
              boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
            }}
          >
            📚
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.text, letterSpacing: '-0.02em' }}>
              BookForge
            </div>
            <div style={{ fontSize: 11, color: T.textMuted }}>AI Studio</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: '14px 10px', flex: 1 }}>
        {[
          { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
          { id: 'wizard', icon: '✦', label: 'New Book' },
        ].map((item) => {
          const active = view === item.id || (item.id === 'dashboard' && ['editor', 'cover', 'preview', 'export'].includes(view));
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

      <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textFaint }}>Powered by Claude Sonnet</div>
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <DashHeader title="My Books" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon="📚"
            title="Your studio is empty"
            desc="Create your first AI-powered book in minutes. Pick a type, set your theme, and let the AI do the heavy lifting."
            cta={
              <Btn onClick={onNew} size="lg">
                ✦ Create Your First Book
              </Btn>
            }
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
          {[{ id: 'all', label: 'All' }, ...BOOK_TYPES.map((t) => ({ id: t.id, label: t.icon + ' ' + t.label.split(' ')[0] }))].map(
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

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 36px' }}>
        {visible.length === 0 ? (
          <EmptyState icon="🔍" title="Nothing found" desc="Try a different search or filter." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
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
        padding: '28px 36px 20px',
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
          height: 155,
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
  return (
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        What type of book are you creating?
      </div>
      <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
        Choose the format that best describes your project.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 13 }}>
        {BOOK_TYPES.map((t) => (
          <div
            key={t.id}
            onClick={() => set('type', t.id)}
            style={{
              padding: '20px 18px',
              borderRadius: 12,
              border: `2px solid ${data.type === t.id ? T.accent : T.border}`,
              background: data.type === t.id ? T.accentBg : T.surface,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 5 }}>{t.label}</div>
            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.55 }}>{t.desc}</div>
          </div>
        ))}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
          {TRIM_SIZES.map((ts) => (
            <div
              key={ts.id}
              onClick={() => set('trimSize', ts.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${data.trimSize === ts.id ? T.accent : T.border}`,
                background: data.trimSize === ts.id ? T.accentBg : T.surface2,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: data.trimSize === ts.id ? T.accent : T.text }}>
                {ts.label}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{ts.desc}</div>
            </div>
          ))}
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

function BookEditor({ project, onUpdate, onBack, subView, setSubView }) {
  const [pages, setPages] = useState([...(project.pages || [])].sort((a, b) => a.order - b.order));
  const [selId, setSelId] = useState(pages[0]?.id || null);
  const [aiLoading, setAiLoading] = useState({});
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);

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
    const key = pageId + 'illustrate';
    setAiLoading((l) => ({ ...l, [key]: true }));
    try {
      const isColoring = project.type === 'coloring';
      const system = isColoring
        ? 'You are an SVG illustrator for coloring books. Generate clean SVG with bold black outlines (stroke-width 3-5), fill="none" or fill="white" only — no color fills. White background. Thick, clear lines suitable for printing and coloring with crayons or markers.'
        : 'You are an SVG illustrator for children\'s storybooks. Generate colorful, friendly SVG scenes with simple shapes, vibrant fills, and clear outlines. Use cheerful, age-appropriate imagery.';
      const info = typeInfo(project.type);
      const userMsg = `Create an SVG illustration for a ${info.label} page.
Book title: "${project.title}"
Theme: ${project.theme}
Audience: ${project.ageGroup}
Page title: "${page.title}"
Page description: "${page.content || page.title}"

Requirements:
- viewBox="0 0 400 300", width="400", height="300"
- Self-contained SVG (no external resources, no scripts)
${isColoring
  ? '- Bold outlines only: stroke="black" stroke-width="3" to stroke-width="5", fill="none" or fill="white"\n- Simple, clear line art perfect for coloring'
  : '- Colorful fills with stroke outlines\n- Bright, cheerful palette\n- Simple friendly shapes'}
- Return ONLY the SVG markup starting with <svg and ending with </svg>`;

      const result = await callClaude(system, userMsg, 4096);
      const svgMatch = result.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        updatePage(pageId, { illustration: svgMatch[0] });
      }
    } catch {}
    setAiLoading((l) => ({ ...l, [key]: false }));
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
    '6x9': '6/9',
    '8x10': '8/10',
    '8.5x11': '8.5/11',
    '5x8': '5/8',
    '5.5x8.5': '5.5/8.5',
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
                <Btn
                  variant="outline"
                  size="sm"
                  loading={!!aiLoading[selPage.id + 'illustrate']}
                  onClick={() => generateIllustration(selPage.id)}
                  title={`Generate a ${project.type === 'coloring' ? 'coloring book line-art' : 'colorful scene'} illustration`}
                >
                  {selPage.illustration ? '✦ Regenerate Illustration' : '✦ Generate Illustration'}
                </Btn>
              </div>

              {/* Page Preview */}
              <Field label="Page Preview">
                {aiLoading[selPage.id + 'illustrate'] ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '18px 22px',
                      background: T.accentBg,
                      borderRadius: 10,
                      border: `1px solid ${T.accent}40`,
                      maxWidth: 340,
                    }}
                  >
                    <Spinner size={22} />
                    <span style={{ color: T.accent, fontSize: 13 }}>
                      Generating {project.type === 'coloring' ? 'line-art' : 'scene'} illustration…
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 6,
                      padding: selPage.illustration ? '16px 16px 10px' : '28px 32px',
                      maxWidth: 340,
                      boxShadow: '0 6px 28px rgba(0,0,0,0.35)',
                      aspectRatio: trimAspect,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontSize: 9, color: '#bbb', textAlign: 'center', marginBottom: 8 }}>
                      {project.trimSize} · {project.interiorStyle}-sided
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#111',
                        textAlign: 'center',
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {selPage.title}
                    </div>
                    {selPage.illustration ? (
                      <div
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{ __html: selPage.illustration }}
                      />
                    ) : (
                      <div style={{ fontSize: 10, color: '#555', lineHeight: 1.7, flex: 1 }}>
                        {selPage.content || (
                          <span style={{ color: '#ccc', fontStyle: 'italic' }}>No content yet…</span>
                        )}
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 14,
                        fontSize: 9,
                        color: '#ccc',
                      }}
                    >
                      {pages.findIndex((p) => p.id === selPage.id) + 1}
                    </div>
                  </div>
                )}

                {/* Illustration controls */}
                {selPage.illustration && !aiLoading[selPage.id + 'illustrate'] && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
                    <Btn
                      variant="secondary"
                      size="xs"
                      loading={!!aiLoading[selPage.id + 'illustrate']}
                      onClick={() => generateIllustration(selPage.id)}
                    >
                      ↺ Regenerate
                    </Btn>
                    <Btn variant="secondary" size="xs" onClick={() => downloadSVG(selPage)}>
                      ↓ SVG
                    </Btn>
                    <Btn variant="secondary" size="xs" onClick={() => downloadPNG(selPage)}>
                      ↓ PNG
                    </Btn>
                    <Btn
                      variant="ghost"
                      size="xs"
                      onClick={() => updatePage(selPage.id, { illustration: null })}
                      style={{ color: T.error }}
                    >
                      × Remove
                    </Btn>
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

  const theme = colorTheme(cover.colorTheme);
  const pageCount = project.pages?.length || 24;
  const spineW = Math.max(12, Math.round(pageCount * 0.052 * 25.4));

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
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, flex: 1 }}>Cover Designer</div>
      </div>

      <EditorTabBar view={subView} setView={setSubView} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Controls */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            overflow: 'auto',
            padding: '22px 20px',
          }}
        >
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

          <Field label="Color Theme">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {COLOR_THEMES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => set('colorTheme', ct.id)}
                  title={ct.label}
                  style={{
                    height: 44,
                    borderRadius: 8,
                    border: `3px solid ${cover.colorTheme === ct.id ? '#fff' : 'transparent'}`,
                    background: ct.gradient,
                    cursor: 'pointer',
                    boxShadow: cover.colorTheme === ct.id ? '0 0 0 1px ' + T.accent : 'none',
                    transition: 'all 0.12s',
                  }}
                />
              ))}
            </div>
          </Field>

          <Field label="Layout">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {LAYOUTS.map((l) => (
                <ToggleChip
                  key={l.id}
                  active={cover.layout === l.id}
                  onClick={() => set('layout', l.id)}
                  style={{ justifyContent: 'center' }}
                >
                  {l.label}
                </ToggleChip>
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

        {/* Preview */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090b14',
            overflow: 'auto',
            padding: 40,
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>
            KDP Cover Preview — {project.trimSize}
          </div>
          <div
            style={{
              display: 'flex',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {/* Back */}
            <CoverBack cover={cover} theme={theme} width={180} />
            {/* Spine */}
            <div
              style={{
                width: spineW,
                background: theme.gradient,
                filter: 'brightness(0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  writingMode: 'vertical-rl',
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 700,
                  letterSpacing: 1,
                  overflow: 'hidden',
                  maxHeight: 220,
                  textOverflow: 'ellipsis',
                }}
              >
                {cover.title || project.title}
              </div>
            </div>
            {/* Front */}
            <CoverFront cover={cover} project={project} theme={theme} width={180} />
          </div>
          <div style={{ fontSize: 11, color: T.textFaint }}>
            Spine approx. {spineW}px based on {pageCount} pages
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

  return (
    <div
      style={{
        width,
        minHeight: width * (11 / 8.5),
        background: theme.gradient,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: centered ? 'center' : 'flex-end',
        alignItems: centered ? 'center' : 'flex-start',
        textAlign: centered ? 'center' : 'left',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {layout === 'bold' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)' }} />
      )}
      {layout === 'offset' && (
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: '70%',
            height: '70%',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: layout === 'bold' ? 32 : 26, marginBottom: 10 }}>{info.icon}</div>
        <div
          style={{
            fontSize: layout === 'bold' ? 15 : 13,
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            marginBottom: 5,
            lineHeight: 1.25,
          }}
        >
          {cover.title || project.title}
        </div>
        {(cover.subtitle || project.subtitle) && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.82)', marginBottom: 8, lineHeight: 1.4 }}>
            {cover.subtitle || project.subtitle}
          </div>
        )}
        {cover.tagline && (
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: 12 }}>
            {cover.tagline}
          </div>
        )}
        {cover.author && (
          <div
            style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.9)',
              marginTop: 14,
              fontWeight: 600,
            }}
          >
            {cover.author}
          </div>
        )}
      </div>
    </div>
  );
}

function CoverBack({ cover, theme, width = 180 }) {
  return (
    <div
      style={{
        width,
        minHeight: width * (11 / 8.5),
        background: theme.gradient,
        filter: 'brightness(0.78)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
        {cover.backBlurb || (
          <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Back cover blurb appears here.</span>
        )}
      </div>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>ISBN</div>
    </div>
  );
}

// ─── Book Preview ─────────────────────────────────────────────────────────────

function BookPreview({ project, subView, setSubView, onBack }) {
  const pages = [...(project.pages || [])].sort((a, b) => a.order - b.order);
  const [idx, setIdx] = useState(-1);

  const isFront = idx === -1;
  const isBack = idx === pages.length;
  const curPage = !isFront && !isBack ? pages[idx] : null;
  const theme = colorTheme(project.cover?.colorTheme);

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
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: T.text }}>Book Preview</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {isFront ? 'Front Cover' : isBack ? 'Back Cover' : `Page ${idx + 1} of ${pages.length}`}
        </div>
      </div>

      <EditorTabBar view={subView} setView={setSubView} />

      <div
        style={{
          flex: 1,
          background: '#07090f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          overflow: 'auto',
        }}
      >
        {isFront ? (
          <div style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.7)', borderRadius: 6, overflow: 'hidden' }}>
            <CoverFront cover={project.cover || {}} project={project} theme={theme} width={300} />
          </div>
        ) : isBack ? (
          <div style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.7)', borderRadius: 6, overflow: 'hidden' }}>
            <CoverBack cover={project.cover || {}} theme={theme} width={300} />
          </div>
        ) : (
          <div
            style={{
              width: 300,
              background: '#fff',
              borderRadius: 4,
              padding: '36px 40px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#111',
                textAlign: 'center',
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              {curPage?.title}
            </div>
            <div style={{ fontSize: 10, color: '#444', lineHeight: 1.9, flex: 1 }}>
              {curPage?.content || <span style={{ color: '#bbb', fontStyle: 'italic' }}>No content</span>}
            </div>
            <div style={{ textAlign: 'center', fontSize: 9, color: '#ccc', marginTop: 16 }}>
              {idx + 1}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: '14px 24px',
          borderTop: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <Btn variant="secondary" onClick={() => setIdx((i) => i - 1)} disabled={isFront}>
          ← Prev
        </Btn>
        <div style={{ fontSize: 13, color: T.textMuted, minWidth: 120, textAlign: 'center' }}>
          {isFront ? 'Front Cover' : isBack ? 'Back Cover' : `${idx + 1} / ${pages.length}`}
        </div>
        <Btn variant="secondary" onClick={() => setIdx((i) => i + 1)} disabled={isBack}>
          Next →
        </Btn>
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

            <Field label="Title">
              <Input value={meta.title || project.title || ''} onChange={(e) => setM('title', e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <Input value={meta.subtitle || project.subtitle || ''} onChange={(e) => setM('subtitle', e.target.value)} />
            </Field>
            <Field label="Author">
              <Input value={meta.author || project.cover?.author || ''} onChange={(e) => setM('author', e.target.value)} />
            </Field>

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

            <SectionTitle>Export</SectionTitle>
            <Card style={{ padding: 16 }}>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 14, lineHeight: 1.6 }}>
                BookForge generates AI content and structure. Use your page content in a layout tool (Canva, Adobe InDesign, Google Docs) to create the final print-ready PDF.
              </div>
              <Btn
                variant="outline"
                size="sm"
                onClick={() => {
                  const content = [
                    project.title,
                    project.subtitle && `Subtitle: ${project.subtitle}`,
                    `Type: ${typeInfo(project.type).label}`,
                    `Pages: ${pageCount}`,
                    `Trim: ${project.trimSize}`,
                    '',
                    '--- PAGES ---',
                    ...(project.pages || [])
                      .sort((a, b) => a.order - b.order)
                      .map((p, i) => `\nPage ${i + 1}: ${p.title}\n${p.content}`),
                  ]
                    .filter(Boolean)
                    .join('\n');
                  copyToClipboard(content, 'export');
                }}
              >
                {copied === 'export' ? '✓ Copied!' : '📋 Copy All Content'}
              </Btn>
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
  };

  return (
    <div style={{ height: '100vh', display: 'flex', background: T.bg, fontFamily: 'inherit', overflow: 'hidden' }}>
      <Sidebar
        view={view}
        navigate={navigate}
        projectCount={projects.length}
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
    </div>
  );
}
