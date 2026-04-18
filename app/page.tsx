'use client';

import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
const P = {
  // Base
  bg: "#f7f5f1",
  white: "#ffffff",
  card: "#faf9f6",
  cardAlt: "#f3f1ec",
  // Borders
  border: "#e6e0d6",
  borderLight: "#ede9e1",
  // Ink
  ink: "#1a1713",
  inkMid: "#4a453e",
  inkSoft: "#7a7268",
  inkFaint: "#aaa49a",
  // Accent palette
  lavender: "#c2aee8", lavSoft: "#ede8f9", lavDeep: "#7c5cbf",
  rose: "#e8afc0", roseSoft: "#fce8ed", roseDeep: "#b8607a",
  sage: "#a8ce9e", sageSoft: "#e4f2e2", sageDeep: "#4a8e56",
  butter: "#ecd898", butterSoft: "#faf4d6", butterDeep: "#9a7c0a",
  peach: "#edb898", peachSoft: "#fdeee2", peachDeep: "#b86830",
  sky: "#a8cce8", skySoft: "#e0eefa", skyDeep: "#3878b8",
  // Dark surface
  dark: "#151210",
  darkCard: "#1e1a16",
  darkBorder: "#2e2822",
  darkText: "#c8c0b4",
  darkMuted: "#7a7268",
  // Shadows
  shadowSm: "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)",
  shadowLg: "0 16px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)",
  shadowGlow: (color: string) => `0 8px 32px ${color}35, 0 2px 8px ${color}20`,
};

const F = {
  display: "'Fraunces', serif",
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

// ── SPRING ─────────────────────────────────────────────────────────────────
const spring = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const smooth = "cubic-bezier(0.4, 0, 0.2, 1)";

// ── UTILS ──────────────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function calcEstDate(current: number, goal: number, monthlyRate: number): string {
  if (monthlyRate <= 0 || current >= goal) return '—';
  const monthsLeft = Math.ceil((goal - current) / monthlyRate);
  if (monthsLeft > 120) return '10+ years';
  return new Date(Date.now() + monthsLeft * 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── COUNT UP HOOK ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900, delay = 0): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const begin = Date.now() + delay;
    const tick = () => {
      const now = Date.now();
      if (now < begin) { raf = requestAnimationFrame(tick); return; }
      if (!start) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

// ── SPARKLINE ──────────────────────────────────────────────────────────────
const Spark = ({ data, color, h = 40 }: { data: number[]; color: string; h?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(200);
  useEffect(() => { if (ref.current) setW(ref.current.offsetWidth || 200); }, []);
  if (data.length < 2) return <div ref={ref} style={{ height: h }} />;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = pts.split(' ').pop()!.split(',');
  return (
    <div ref={ref} style={{ width: '100%', height: h }}>
      <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={`g${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g${color.replace('#', '')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
      </svg>
    </div>
  );
};

// ── RING ───────────────────────────────────────────────────────────────────
const Ring = ({ val, color, size = 52 }: { val: number; color: string; size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(val, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, filter: val > 0 ? `drop-shadow(0 0 6px ${color}60)` : 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={P.borderLight} strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: `stroke-dasharray 1.2s ${smooth}` }} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill={val === 0 ? P.inkFaint : P.ink} fontFamily={F.display}>{val === 0 ? '—' : val}</text>
    </svg>
  );
};

// ── MINI BAR ───────────────────────────────────────────────────────────────
const MiniBar = ({ val, max, color }: { val: number; max: number; color: string }) => (
  <div style={{ background: P.borderLight, borderRadius: 99, height: 4, flex: 1, overflow: 'hidden' }}>
    <div style={{ background: color, height: 4, width: `${Math.min(100, (val / Math.max(max, 1)) * 100)}%`, borderRadius: 99 }} />
  </div>
);

// ── PILL TAG ───────────────────────────────────────────────────────────────
const Tag = ({ children, color = P.lavDeep, bg = P.lavSoft }: { children: React.ReactNode; color?: string; bg?: string }) => (
  <span className="btn-spring" style={{ background: bg, color, borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.03em', display: 'inline-block', fontFamily: F.mono, boxShadow: `0 1px 3px ${color}20` }}>{children}</span>
);

// ── LIVE DOT ───────────────────────────────────────────────────────────────
const LiveDot = ({ color = P.sageDeep }: { color?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', color }} />
  </span>
);

// ── SECTION HEADER ─────────────────────────────────────────────────────────
const SH = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div style={{ marginTop: 24, marginBottom: 10 }}>
    <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: P.inkFaint, fontFamily: F.mono, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ display: 'inline-block', width: 14, height: 1, background: P.borderLight }} />
      {children}
    </div>
    {sub && <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 3, paddingLeft: 20 }}>{sub}</div>}
  </div>
);

// ── STAT CARD ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, live, children }: {
  label: string; value?: string; sub?: string; accent: string; live?: boolean; children?: React.ReactNode;
}) => (
  <div className="card-lift" style={{
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid rgba(255,255,255,0.7)`,
    borderRadius: 18,
    padding: '15px 16px',
    borderTop: `2.5px solid ${accent}`,
    boxShadow: `${P.shadowSm}, 0 0 0 0.5px ${accent}20 inset`,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Subtle glow behind accent */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, background: `linear-gradient(180deg, ${accent}12 0%, transparent 100%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, position: 'relative' }}>
      <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: F.mono, flex: 1 }}>{label}</div>
      {live && <LiveDot color={P.sageDeep} />}
    </div>
    {value && <div className="fade-up" style={{ fontSize: 22, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em', lineHeight: 1.2, position: 'relative' }}>{value}</div>}
    {sub && <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 3, position: 'relative' }}>{sub}</div>}
    {children}
  </div>
);

// ── GOAL BAR ───────────────────────────────────────────────────────────────
const GoalBar = ({ label, current, goal, color, colorSoft, pace, paceSource, estDate, onGoalChange }: {
  label: string; current: number; goal: number; color: string; colorSoft: string;
  pace: string; paceSource?: string; estDate: string; onGoalChange?: (v: number) => void;
}) => {
  const pct = Math.min(100, (current / Math.max(goal, 1)) * 100);
  const paceLabel = paceSource === 'estimated_baseline' ? pace + ' (est.)' :
    paceSource === 'early_estimate' ? pace + ' (early data)' :
    paceSource === 'historical_data' ? pace + ' ✓' : pace;

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(255,255,255,0.9), ${colorSoft}80)`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${color}35`,
      borderRadius: 16,
      padding: '15px 16px',
      marginBottom: 10,
      boxShadow: `0 4px 16px ${color}12`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: P.ink, fontFamily: F.body }}>{label}</div>
        {onGoalChange ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: P.inkSoft }}>Goal:</span>
            <input type="number" value={goal}
              onChange={e => { const v = parseInt(e.target.value); if (v > 0) onGoalChange(v); }}
              style={{ width: 72, border: `1px solid ${color}60`, borderRadius: 8, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, background: 'rgba(255,255,255,0.8)', color: P.ink, textAlign: 'right' }}
            />
          </div>
        ) : (
          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: F.mono }}>{current.toLocaleString()} / {goal.toLocaleString()}</div>
        )}
      </div>
      {onGoalChange && (
        <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 8, fontFamily: F.mono }}>{current.toLocaleString()} / {goal.toLocaleString()}</div>
      )}
      <div style={{ background: `${color}20`, borderRadius: 99, height: 8, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(90deg, ${color}, ${colorSoft ? color : color})`, height: 8, width: `${pct}%`, borderRadius: 99, transition: `width 1.2s ${smooth}`, boxShadow: `0 0 8px ${color}60` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: F.mono }}>{paceLabel}</div>
        <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>Est. {estDate}</div>
      </div>
    </div>
  );
};

// ── POST CARD ──────────────────────────────────────────────────────────────
function isTrending(post: any): { trending: boolean; label: string; urgency: 'fire' | 'hot' | 'rising' } {
  const likes = post.like_count ?? post.likes ?? 0;
  const views = post.view_count ?? post.views ?? likes;
  const hours = post.hours ?? post.age_hours ?? null;
  const reach = Math.max(likes, views);
  if (hours !== null) {
    if (reach >= 1000000 && hours <= 720) return { trending: true, label: '1M+ in a month', urgency: 'fire' };
    if (reach >= 100000 && hours <= 24) return { trending: true, label: '100K same day', urgency: 'fire' };
    if (reach >= 100000 && hours <= 72) return { trending: true, label: '100K in 3 days', urgency: 'hot' };
    if (reach >= 50000 && hours <= 24) return { trending: true, label: '50K same day', urgency: 'rising' };
  } else {
    if (reach >= 1000000) return { trending: true, label: '1M+ reach', urgency: 'fire' };
    if (reach >= 100000) return { trending: true, label: '100K+ reach', urgency: 'hot' };
  }
  return { trending: false, label: '', urgency: 'rising' };
}

const PostCard = ({ post, accent, accentSoft, accentDeep }: { post: any; accent: string; accentSoft: string; accentDeep: string }) => {
  const ICONS: Record<string, string> = { VIDEO: '🎬', REEL: '🎬', CAROUSEL_ALBUM: '🖼️', IMAGE: '📸' };
  const maxVal = Math.max(post.like_count ?? 0, (post.saves ?? 0) * 3, (post.comments_count ?? 0) * 15);
  return (
    <div className="card-lift" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid rgba(255,255,255,0.65)`, borderRadius: 16, overflow: 'hidden', marginBottom: 8, boxShadow: P.shadowSm }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 68, background: `linear-gradient(135deg, ${accentSoft}, ${accent}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, borderRight: `1px solid ${accent}20` }}>
          {ICONS[post.media_type] ?? '📱'}
        </div>
        <div style={{ flex: 1, padding: '11px 13px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: P.ink, lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.caption ?? 'No caption'}
          </div>
          {[
            { label: 'Likes', val: post.like_count ?? 0, color: accent },
            { label: 'Cmts', val: post.comments_count ?? 0, color: P.skyDeep },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <div style={{ fontSize: 9, color: P.inkFaint, width: 26, fontFamily: F.mono }}>{s.label}</div>
              <MiniBar val={s.val} max={maxVal} color={s.color} />
              <div style={{ fontSize: 10, color: P.inkMid, width: 36, textAlign: 'right', fontFamily: F.mono }}>{fmtNum(s.val)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── COMMENT CARD ───────────────────────────────────────────────────────────
const CmtCard = ({ c, accent, accentSoft }: { c: any; accent: string; accentSoft: string }) => (
  <div style={{ background: accentSoft, borderRadius: 11, padding: '11px 13px', marginBottom: 7 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: P.white, flexShrink: 0 }}>
        {(c.user ?? '?').replace('@', '').charAt(0).toUpperCase()}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>{c.user}</div>
        <div style={{ fontSize: 10, color: P.inkFaint }}>{c.platform} · ♥ {c.likes}</div>
      </div>
    </div>
    <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.65, fontStyle: 'italic' }}>"{c.text}"</div>
  </div>
);

// ── AI INSIGHT BLOCK ───────────────────────────────────────────────────────
const AIInsight = ({ text, platform }: { text: string; platform: string }) => (
  <div className="liquid-glass-dark" style={{ borderRadius: 16, padding: '16px 18px', marginTop: 8, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${P.lavender}20, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${P.lavSoft}, ${P.lavender})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, boxShadow: `0 2px 8px ${P.lavDeep}40` }}>✦</div>
      <div style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono }}>AI Insight · {platform}</div>
    </div>
    <div style={{ fontSize: 13, color: P.darkText, lineHeight: 1.85, fontFamily: F.display, fontStyle: 'italic', position: 'relative' }}>{text}</div>
  </div>
);

// ── WHAT'S WORKING ─────────────────────────────────────────────────────────
const WW = ({ working, flopping }: { working: string; flopping: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
    <div className="card-lift" style={{ background: `linear-gradient(135deg, ${P.sageSoft}, rgba(255,255,255,0.9))`, border: `1px solid ${P.sage}50`, borderRadius: 14, padding: '13px', boxShadow: `0 4px 16px ${P.sage}15` }}>
      <div style={{ fontSize: 9, color: P.sageDeep, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: F.mono, marginBottom: 7, fontWeight: 700 }}>✓ Working</div>
      <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.75 }}>{working}</div>
    </div>
    <div className="card-lift" style={{ background: `linear-gradient(135deg, ${P.roseSoft}, rgba(255,255,255,0.9))`, border: `1px solid ${P.rose}50`, borderRadius: 14, padding: '13px', boxShadow: `0 4px 16px ${P.rose}15` }}>
      <div style={{ fontSize: 9, color: P.roseDeep, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: F.mono, marginBottom: 7, fontWeight: 700 }}>✗ Flopping</div>
      <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.75 }}>{flopping}</div>
    </div>
  </div>
);

// ── GLOBE FEED ─────────────────────────────────────────────────────────────
const FEED_EVENTS = [
  { flag: "🇺🇸", action: "followed Macros Wit Matt", user: "@hungry_tyler", loc: "Los Angeles, CA" },
  { flag: "🇲🇽", action: "liked 'BEST Ramen in LA'", user: "@foodie_mx", loc: "Mexico City" },
  { flag: "🇬🇧", action: "saved the birria video", user: "@londonbites_", loc: "London, UK" },
  { flag: "🇨🇦", action: "commented 'need to visit LA'", user: "@torontoeats", loc: "Toronto, CA" },
  { flag: "🇯🇵", action: "followed Macros Wit Matt", user: "@ramen_japan_", loc: "Tokyo, Japan" },
  { flag: "🇦🇺", action: "liked 3 videos", user: "@sydneyfood22", loc: "Sydney, AU" },
  { flag: "🇧🇷", action: "shared the ramen video", user: "@comidabr_", loc: "São Paulo" },
  { flag: "🇩🇪", action: "followed Mason", user: "@berlin_food", loc: "Berlin, DE" },
  { flag: "🇰🇷", action: "saved birria video", user: "@seoul_eats", loc: "Seoul, KR" },
  { flag: "🇵🇭", action: "commented 'wow the food'", user: "@manila_tasty", loc: "Manila, PH" },
];

const GlobeFeed = () => {
  const [items, setItems] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(194);
  const idxRef = useRef(0);
  useEffect(() => {
    const add = () => {
      const e = FEED_EVENTS[idxRef.current % FEED_EVENTS.length];
      idxRef.current++;
      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setItems((prev: any[]) => [{ ...e, t, id: Date.now() }, ...prev].slice(0, 18));
      if (e.action.includes("followed")) setFollowerCount((c: number) => c + 1);
    };
    add();
    const interval = setInterval(add, 2800);
    return () => clearInterval(interval);
  }, []);

  const DOTS = [
    { x: 22, y: 42, color: P.sage }, { x: 50, y: 38, color: P.lavender },
    { x: 75, y: 35, color: P.rose }, { x: 17, y: 58, color: P.butter },
    { x: 65, y: 48, color: P.sky }, { x: 42, y: 62, color: P.sage },
    { x: 88, y: 42, color: P.lavender }, { x: 32, y: 30, color: P.peach },
    { x: 58, y: 27, color: P.sage }, { x: 12, y: 50, color: P.rose },
    { x: 80, y: 58, color: P.butter }, { x: 95, y: 52, color: P.sky },
  ];

  return (
    <div>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ background: P.dark, padding: "0 0 0 0", position: "relative", height: 220 }}>
          <svg viewBox="0 0 100 80" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="50" cy="40" rx="42" ry="24" fill="none" stroke="#2a3040" strokeWidth="0.5" />
            <ellipse cx="50" cy="40" rx="25" ry="24" fill="none" stroke="#2a3040" strokeWidth="0.3" strokeDasharray="2,2" />
            <ellipse cx="50" cy="40" rx="42" ry="8" fill="none" stroke="#2a3040" strokeWidth="0.3" />
            <ellipse cx="50" cy="28" rx="38" ry="5" fill="none" stroke="#2a3040" strokeWidth="0.25" />
            <ellipse cx="50" cy="52" rx="38" ry="5" fill="none" stroke="#2a3040" strokeWidth="0.25" />
            {DOTS.map((d, i) => (
              <g key={i}>
                <circle cx={d.x} cy={d.y} r="2.5" fill={d.color} opacity="0.9" />
                <circle cx={d.x} cy={d.y} r="5" fill={d.color} opacity="0.15" />
              </g>
            ))}
          </svg>
          <div style={{ position: "absolute", top: 12, left: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7a7268", fontFamily: F.mono }}>Live Global Activity</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard label="Top Country" value="🇺🇸 USA" sub="42% of all activity" accent={P.sage} />
        <StatCard label="New Followers Today" value={followerCount.toString()} sub="and counting" accent={P.lavender} />
        <StatCard label="Top City" value="Los Angeles" sub="38% of domestic" accent={P.rose} />
        <StatCard label="International" value="58%" sub="of today's follows" accent={P.butter} />
      </div>

      <SH children="Live Activity Feed" sub="Real-time follows, likes, and saves worldwide" />
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, overflow: "hidden" }}>
        {items.map((e: any, i: number) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < items.length - 1 ? `1px solid ${P.borderLight}` : "none" }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>{e.flag}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: P.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.action}</div>
              <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{e.user} · {e.loc}</div>
            </div>
            <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono, flexShrink: 0 }}>{e.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LIVE_COMMENTS_V5 = [
  { user: "@hungry_tyler", text: "bro what spot is this???" },
  { user: "@foodieLA_k", text: "this looks incredible omg" },
  { user: "@ramen_fan22", text: "what bowl is that?? the broth color" },
  { user: "@localfoodie_", text: "going tomorrow morning fr" },
  { user: "@socal_eats", text: "you should do korean bbq tacos next" },
  { user: "@la_food_guy", text: "the lighting is so good on this" },
  { user: "@mattfan_2026", text: "how do you order this exactly??" },
  { user: "@japan_tourist", text: "making me miss LA so much" },
];
const GIFTS_V5 = [
  { emoji: "🌹", user: "@foodieLA_k", name: "Rose", val: "$0.50" },
  { emoji: "👑", user: "@ramen_fan22", name: "Crown", val: "$5.00" },
  { emoji: "🦁", user: "@socal_eats", name: "Lion", val: "$10.00" },
  { emoji: "🎁", user: "@la_food_guy", name: "Gift Box", val: "$1.50" },
];

const LiveStudio = () => {
  const [secs, setSecs] = useState(0);
  const [viewers, setViewers] = useState(847);
  const [comments, setComments] = useState(2341);
  const [likes, setLikes] = useState(14200);
  const [follows, setFollows] = useState(38);
  const [gifts, setGifts] = useState(142);
  const [chat, setChat] = useState<any[]>([]);
  const [giftFeed, setGiftFeed] = useState<any[]>([]);
  const comIdxRef = useRef(0);
  const giftIdxRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setSecs((s: number) => s + 1);
      setViewers((v: number) => v + Math.floor(Math.random() * 5 - 1));
      setComments((c: number) => c + Math.floor(Math.random() * 3));
      setLikes((l: number) => l + Math.floor(Math.random() * 8));
      if (Math.random() > 0.7) setFollows((f: number) => f + 1);
      if (Math.random() > 0.8) setGifts((g: number) => g + Math.floor(Math.random() * 3));
      if (Math.random() > 0.4) {
        const c = LIVE_COMMENTS_V5[comIdxRef.current % LIVE_COMMENTS_V5.length];
        comIdxRef.current++;
        setChat((prev: any[]) => [{ ...c, id: Date.now() }, ...prev].slice(0, 12));
      }
      if (Math.random() > 0.85) {
        const g = GIFTS_V5[giftIdxRef.current % GIFTS_V5.length];
        giftIdxRef.current++;
        setGiftFeed((prev: any[]) => [{ ...g, id: Date.now() }, ...prev].slice(0, 5));
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const timer = `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div>
      <div style={{ background: P.dark, border: `1px solid ${P.darkBorder}`, borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: P.sageDeep, boxShadow: `0 0 0 3px ${P.sageSoft}30` }} />
          <div style={{ fontSize: 10, color: "#a09080", fontFamily: F.mono, letterSpacing: "0.12em" }}>LIVE NOW · TIKTOK</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#6a6258", fontFamily: F.mono }}>{timer}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Viewers", val: viewers.toLocaleString() },
            { label: "Comments", val: comments.toLocaleString() },
            { label: "Likes", val: (likes / 1000).toFixed(1) + "K" },
          ].map((s: any) => (
            <div key={s.label} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: "#d4ccc4" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#6a6258", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: F.mono, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Follows Gained", val: "+" + follows },
            { label: "Total Gifts", val: "$" + gifts },
          ].map((s: any) => (
            <div key={s.label} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: "#d4ccc4" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#6a6258", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: F.mono, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: "#7a7268", fontFamily: F.mono, marginBottom: 8 }}>Live Chat</div>
        <div style={{ background: "#12100e", borderRadius: 10, padding: "10px 12px", maxHeight: 150, overflowY: "auto" }}>
          {chat.map((c: any) => (
            <div key={c.id} style={{ display: "flex", gap: 6, padding: "4px 0", borderBottom: `1px solid #2a2420`, fontSize: 11 }}>
              <span style={{ color: "#a09080", fontWeight: 600, flexShrink: 0 }}>{c.user}</span>
              <span style={{ color: "#c8c0b4", lineHeight: 1.5 }}>{c.text}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: "#7a7268", fontFamily: F.mono, marginBottom: 8, marginTop: 12 }}>Gift Feed</div>
        <div style={{ maxHeight: 90, overflowY: "auto" }}>
          {giftFeed.map((g: any) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid #2a2420`, fontSize: 11 }}>
              <span style={{ fontSize: 16 }}>{g.emoji}</span>
              <span style={{ flex: 1, color: "#c8c0b4" }}>{g.user} sent a {g.name}</span>
              <span style={{ color: P.butterDeep, fontWeight: 700, fontFamily: F.mono }}>{g.val}</span>
            </div>
          ))}
        </div>
      </div>

      <SH children="AI Topic Suggestions" sub="Based on top comment patterns and trend data" />
      {[
        { title: "Answer 'what bowl was that?' — 412 people asked", body: "Top comment across your last 3 ramen videos. Drop the bowl name and ordering instructions live — you'll spike comments instantly.", source: "top comment pattern", color: P.sage },
        { title: "Korean BBQ Tacos — call it out before anyone else does", body: "Trending hard on TikTok Search in SoCal right now. No big food creator has filmed it yet. Mention it live to position yourself first.", source: "TikTok trend radar · rising fast", color: P.lavender },
        { title: "Blindfold challenge — viewer demand is building", body: "Multiple DMs and comments asking you to order blindfolded from a menu you've never seen. Live challenge = high engagement spike.", source: "DM pattern · 6 requests this week", color: P.butter },
      ].map((t: any, i: number) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 6 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 8 }}>{t.body}</div>
          <Tag color={P.inkFaint} bg={P.card}>Source: {t.source}</Tag>
        </div>
      ))}
    </div>
  );
};

const SPOTS_V5: Record<string, any> = {
  niku: {
    name: "Niku Niku Ramen", city: "Torrance, CA", emoji: "🍜",
    views: "41.2K", likes: "2,890", comments: "892",
    topComment: "what bowl was that at the end?? I need the name or I'm losing sleep", commentLikes: 412,
    pain: "Top demand: bowl name, how to order it, challenge format",
    mandatory: "The Tantanmen · extra spicy · add a soft egg · bamboo on the side. The Mason Way: ask for the 'full protein' customization — not on the menu but they'll do it.",
    angle: "Last time was solo tasting. This time: blindfold order challenge. Let chat pick the bowl live.",
    script: "Hook: 'I came back because 412 people asked me the same question.' Open on the bowl reveal immediately — zero talking for the first 5 seconds.",
    color: P.sage, colorSoft: P.sageSoft,
  },
  fuego: {
    name: "Fuego Birria Tacos", city: "East LA", emoji: "🌮",
    views: "28.4K", likes: "1,950", comments: "634",
    topComment: "you should've gotten the quesabirria — that's the move not the regular taco", commentLikes: 341,
    pain: "Comment demand: quesabirria specifically, cheese pull shot, how to order the right way",
    mandatory: "Quesabirria · dip in consommé · extra cheese pull shot. The Mason Way: jalapeños grilled on top, double dip, lime squeeze on camera.",
    angle: "Last video showed the taco. This time show the consommé dunk in slow motion. Film the cheese pull close-up. That's the shot people want.",
    script: "Hook: '412 people told me I ordered wrong. They were right.' Show the quesabirria immediately.",
    color: P.rose, colorSoft: P.roseSoft,
  },
  ume: {
    name: "Ume Matcha Bar", city: "Pasadena, CA", emoji: "🍵",
    views: "—", likes: "—", comments: "—",
    topComment: "no video yet — first visit data pending", commentLikes: 0,
    pain: "No data yet — use trend data: matcha dessert LA is up 120% on Google Trends right now",
    mandatory: "Ceremonial matcha latte · oat milk · no sweetener. The Mason Way: extra matcha powder dusted on top, bamboo spoon shot, slow pour reveal.",
    angle: "Contrast angle: I've had matcha in Tokyo. This is the closest I've found in SoCal. Aesthetic-forward, minimal talking.",
    script: "Hook: 'I found the most underrated matcha spot in LA and it's not where you think.' Open on the pour.",
    color: P.butter, colorSoft: P.butterSoft,
  },
};

const ReturnToSpot = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const search = () => {
    const q = query.toLowerCase().trim();
    if (!q) { setResults([]); return; }
    const matches = Object.entries(SPOTS_V5).filter(([k, v]: any) =>
      v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || k.includes(q)
    );
    setResults(matches);
    setSelected(null);
  };

  const s = selected ? SPOTS_V5[selected] : null;

  return (
    <div>
      <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.butterDeep, fontFamily: F.mono, marginBottom: 10 }}>Return to Spot — Search any restaurant you've filmed</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={(e: any) => setQuery(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && search()}
            placeholder="Type name, city, or hashtag..."
            style={{ flex: 1, border: `1px solid ${P.border}`, borderRadius: 10, padding: "9px 13px", fontSize: 13, background: P.white, color: P.ink, fontFamily: F.body, outline: "none" }}
          />
          <button onClick={search} style={{ border: `1px solid ${P.border}`, borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: P.white, color: P.ink, fontFamily: F.body }}>Search</button>
        </div>
        {results.length > 0 && (
          <div style={{ marginTop: 10, background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
            {results.map(([k, v]: any, i: number) => (
              <div key={k} onClick={() => setSelected(k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < results.length - 1 ? `1px solid ${P.borderLight}` : "none", cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>{v.emoji}</span>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{v.name}</div><div style={{ fontSize: 11, color: P.inkSoft }}>{v.city} · {v.views} views</div></div>
                <div style={{ marginLeft: "auto", fontSize: 12, color: P.inkFaint }}>→</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SH children="Recently Filmed Spots" />
      {Object.entries(SPOTS_V5).map(([k, v]: any) => (
        <div key={k} onClick={() => setSelected(selected === k ? null : k)}
          style={{ background: P.white, border: `1px solid ${selected === k ? v.color : P.border}`, borderRadius: 14, padding: "13px 15px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: v.colorSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{v.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{v.name}</div>
            <div style={{ fontSize: 11, color: P.inkSoft }}>{v.city} · {v.views} views</div>
          </div>
          <div style={{ fontSize: 11, color: P.inkFaint }}>{selected === k ? "▲" : "▼"}</div>
        </div>
      ))}

      {s && (
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, overflow: "hidden", marginTop: 4 }}>
          <div style={{ background: s.colorSoft, padding: "14px 16px", borderBottom: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{s.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <Tag color={P.sageDeep} bg={P.sageSoft}>{s.views} views</Tag>
              <Tag color={P.skyDeep} bg={P.skySoft}>{s.likes} likes</Tag>
              <Tag color={P.roseDeep} bg={P.roseSoft}>{s.comments} comments</Tag>
            </div>
          </div>
          <div style={{ padding: "16px" }}>
            {[
              { head: "What They Asked For", body: `"${s.topComment}" · ♥ ${s.commentLikes}\n\n${s.pain}`, color: P.sageDeep, bg: P.sageSoft },
              { head: "Mandatory Order · The Mason Way", body: s.mandatory, color: P.lavDeep, bg: P.lavSoft },
              { head: "Angle This Time", body: s.angle, color: P.peachDeep, bg: P.peachSoft },
              { head: "Opening Script Hook", body: s.script, color: P.roseDeep, bg: P.roseSoft },
            ].map((r: any, i: number) => (
              <div key={i} style={{ background: r.bg, border: `1px solid ${r.color}30`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: r.color, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: F.mono, marginBottom: 6 }}>{r.head}</div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{r.body}</div>
              </div>
            ))}
            <AIInsight text={`Based on your last visit analytics, the negation hook format works best for ${s.name}. Comments are demanding a more interactive format — consider a live visit or challenge frame. Your biggest opportunity: address the top comment directly in your hook.`} platform={s.name} />
          </div>
        </div>
      )}
    </div>
  );
};

const PROSPECTS = [
  { name: 'The Patty Lab', handle: '@thepattylabburgers', followers: '3.2K', foodScore: 9.7, socialScore: 1.3, heat: 9.4, lastPost: '6 days ago', note: 'Highest food score ever logged. Best burger photography seen organically. Near-zero social with a product that could go viral in one video. Reach out today.', color: P.sage, colorSoft: P.sageSoft },
  { name: 'Fuego Birria Tacos', handle: '@fuegobirriatacosofficial', followers: '12.4K', foodScore: 9.2, socialScore: 2.1, heat: 8.8, lastPost: '3 days ago', note: 'Food is legitimately top-tier SoCal birria. Zero content strategy. Posts are blurry, no hooks. Perfect AFE candidate.', color: P.peach, colorSoft: P.peachSoft },
  { name: 'Niku Niku Ramen', handle: '@nikunikulaofficial', followers: '8.1K', foodScore: 8.4, socialScore: 3.8, heat: 7.2, lastPost: 'Yesterday', note: 'Posting consistently but hook-less. Massive organic upside untapped.', color: P.lavender, colorSoft: P.lavSoft },
  { name: 'Ume Matcha Bar', handle: '@umematchabar', followers: '5.6K', foodScore: 8.1, socialScore: 4.2, heat: 6.8, lastPost: '2 days ago', note: 'Strong aesthetic, female-skewing audience. First potential beverage client. Matcha content trending — 2 months behind the wave.', color: P.butter, colorSoft: P.butterSoft },
];




const CLIENTS = [
  {
    id: 'mason', name: 'Mason', role: 'Founder · Maison Adari', avatar: 'M',
    color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep,
    contentScore: 0, totalFollowers: 370, totalReach: '56', engagement: '0%', weeklyGrowth: '+0',
    bestTimes: ['Tues 6–8pm', 'Fri 11am–1pm', 'Sun 7–9pm'],
    primaryPlatform: 'instagram',
    igGoalDefault: 10000,
    accounts: [
      {
        platform: 'Instagram', icon: '📸', handle: '@masondoesnumbers', tiktokHandle: '@masondoesnumbers',
        followers: 370, followerDelta: '—', reach: 56, engagement: '0%',
        color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
        insight: 'Your account is connected and live. Post consistently to generate engagement data. Process reveals and contrarian takes on restaurant marketing tend to outperform lifestyle content 3–4× for agency operator accounts.',
        posts: [],
        topComments: [],
        working: 'Account connected. Start posting to see what works.',
        flopping: 'No posting history yet. Every day without content is a missed data point.',
      },
      {
        platform: 'TikTok', icon: '🎵', handle: '@masondoesnumbers',
        followers: 0, followerDelta: '—', reach: 0, engagement: '—',
        color: P.sky, colorSoft: P.skySoft, colorDeep: P.skyDeep,
        insight: 'TikTok not yet connected. Once connected, POV cold call content and agency process content will be tracked here.',
        posts: [],
        topComments: [],
        working: 'Connect TikTok to see analytics.',
        flopping: 'Connect TikTok to see analytics.',
      },
    ],
  },
  {
    id: 'matt', name: 'Macros Wit Matt', role: 'Creator · Food Content', avatar: 'B',
    color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
    contentScore: 0, totalFollowers: 0, totalReach: '—', engagement: '—', weeklyGrowth: '+0',
    bestTimes: ['Mon 12–2pm', 'Thurs 7–9pm', 'Sat 10am–12pm'],
    primaryPlatform: 'tiktok',
    igGoalDefault: 100000,
    accounts: [
      {
        platform: 'TikTok', icon: '🎵', handle: '@macroswitmatt',
        followers: 0, followerDelta: '—', reach: 0, engagement: '—',
        color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
        notConnected: true,
        insight: 'Connect TikTok to see real analytics.',
        posts: [], topComments: [],
        working: 'Connect TikTok to see what is working.',
        flopping: 'Connect TikTok to identify patterns.',
      },
      {
        platform: 'Instagram', icon: '📸', handle: '@macroswithmatt',
        followers: 0, followerDelta: '—', reach: 0, engagement: '—',
        color: P.peach, colorSoft: P.peachSoft, colorDeep: P.peachDeep,
        notConnected: true,
        insight: 'Connect Instagram to see real analytics.',
        posts: [], topComments: [],
        working: 'Connect Instagram to see what is working.',
        flopping: 'Connect Instagram to identify patterns.',
      },
    ],
  },
];

// ── SLIDING PERIOD PILL ────────────────────────────────────────────────────
const PeriodPill = ({ periods, value, onChange, color = '#1a1713' }: {
  periods: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  color?: string;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState({ left: 3, width: 0 });

  useEffect(() => {
    if (!trackRef.current) return;
    const idx = periods.findIndex(p => p.id === value);
    const btns = trackRef.current.querySelectorAll('.period-btn');
    const btn = btns[idx] as HTMLElement;
    if (btn) {
      setThumbStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [value, periods]);

  return (
    <div ref={trackRef} className="period-track" style={{ position: 'relative' }}>
      <div className="period-thumb" style={{ left: thumbStyle.left, width: thumbStyle.width }} />
      {periods.map(p => (
        <button key={p.id} className="period-btn btn-spring"
          style={{ color: value === p.id ? '#fff' : '#8a8078' }}
          onClick={() => onChange(p.id)}>
          {p.label}
        </button>
      ))}
    </div>
  );
};

// ── SPINNING PIE CHART ─────────────────────────────────────────────────────
const SpinPieChart = ({ slices, size = 80 }: { slices: { value: number; color: string; label: string }[]; size?: number }) => {
  const [spinKey, setSpinKey] = useState(0);
  const prevSlices = useRef(slices);

  useEffect(() => {
    // Spin when slices change meaningfully
    const changed = slices.some((s, i) => s.value !== (prevSlices.current[i]?.value ?? -1));
    if (changed) { setSpinKey(k => k + 1); prevSlices.current = slices; }
  }, [slices]);

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;

  const svgContent = () => {
    if (total === 0) return (
      <circle cx={cx} cy={cy} r={r} fill={P.borderLight} />
    );
    if (slices.filter(s => s.value > 0).length === 1) {
      const s = slices.find(sl => sl.value > 0)!;
      return <circle cx={cx} cy={cy} r={r} fill={s.color} opacity={0.85} />;
    }
    let cumAngle = -90;
    return slices.map((sl, i) => {
      if (sl.value === 0) return null;
      const startAngle = cumAngle;
      const angle = (sl.value / total) * 360;
      cumAngle += angle;
      const endAngle = cumAngle;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      return <path key={i} d={`M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`} fill={sl.color} opacity={0.85} />;
    });
  };

  const activeSlices = slices.filter(s => s.value > 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg key={spinKey} width={size} height={size} className={spinKey > 0 ? 'pie-spin' : ''} style={{ flexShrink: 0 }}>
        {svgContent()}
        <circle cx={cx} cy={cy} r={r * 0.45} fill="rgba(255,255,255,0.95)" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {total === 0 ? (
          <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>No data</div>
        ) : activeSlices.map((s, i) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <div style={{ fontSize: 10, color: P.inkMid }}>{s.label}</div>
              <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── TIME PERIOD UTILS ──────────────────────────────────────────────────────
const TIME_PERIODS = [
  { id: 'day', label: 'day', mult: 0.143 },
  { id: 'week', label: 'wk', mult: 1 },
  { id: 'month', label: 'mo', mult: 4.33 },
  { id: 'year', label: 'yr', mult: 52 },
];

function applyTimePeriod(weeklyDelta: number, periodId: string): { value: number; label: string } {
  const p = TIME_PERIODS.find(t => t.id === periodId) ?? TIME_PERIODS[1];
  const value = Math.round(weeklyDelta * p.mult);
  const labels: Record<string, string> = { day: 'today', week: 'this week', month: 'this month', year: 'this year' };
  return { value, label: labels[periodId] ?? 'this week' };
}

// ── PERSON SUMMARY CARD ────────────────────────────────────────────────────
const PersonCard = ({ name, avatar, color, colorSoft, colorDeep, accounts, contentScore, engagement, reach, liveMetrics, timePeriod, igGoal, setIgGoal, mattGoal, setMattGoal, igHistory }: any) => {
  const [goalPlatform, setGoalPlatform] = useState('instagram');

  const totalFollowers = name === 'Mason' && liveMetrics
    ? liveMetrics.followers
    : accounts.reduce((s: number, a: any) => s + (a.followers ?? 0), 0);

  // Use real history for Mason, fallback to computed delta for others
  const { value: deltaVal, label: deltaLabel } = (() => {
    if (name === 'Mason' && igHistory && igHistory.length >= 2) {
      return applyTimePeriodFromHistory(igHistory, timePeriod);
    }
    const weeklyDelta = accounts.reduce((s: number, a: any) => {
      const d = parseInt((a.followerDelta ?? '+0').replace('+', '').replace(',', ''));
      return s + (isNaN(d) ? 0 : d);
    }, 0);
    return applyTimePeriod(weeklyDelta, timePeriod);
  })();

  // Per-platform reach
  const totalReach = name === 'Mason' && liveMetrics ? liveMetrics.reach : reach;

  // Pie slices — show each connected account
  const pieSlices = accounts.map((a: any, i: number) => {
    const colors = [colorDeep, color, P.butterDeep, P.skyDeep];
    return { value: name === 'Mason' && liveMetrics && a.platform === 'Instagram' ? liveMetrics.followers : (a.followers ?? 0), color: colors[i % colors.length], label: a.platform };
  });

  const displayEngagement = name === 'Mason' && liveMetrics ? liveMetrics.engagementRate.toFixed(1) + '%' : engagement;
  const displayScore = name === 'Mason' && liveMetrics ? liveMetrics.contentScore : contentScore;

  // Goal logic
  const isMason = name === 'Mason';
  const activeGoal = isMason ? igGoal : mattGoal;
  const setActiveGoal = isMason ? setIgGoal : setMattGoal;
  const goalFollowers = goalPlatform === 'instagram'
    ? (name === 'Mason' && liveMetrics ? liveMetrics.followers : accounts.find((a: any) => a.platform === 'Instagram')?.followers ?? 0)
    : accounts.find((a: any) => a.platform === 'TikTok')?.followers ?? 0;
  const goalPace = name === 'Mason' && liveMetrics && goalPlatform === 'instagram' ? liveMetrics.pace : '+0/mo';
  const goalPaceSource = name === 'Mason' && liveMetrics ? liveMetrics.paceSource : 'estimated_baseline';
  const goalMonthly = name === 'Mason' && liveMetrics && goalPlatform === 'instagram' ? liveMetrics.monthlyGrowthRate : 0;

  return (
    <div className="card-lift" style={{
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid rgba(255,255,255,0.65)`,
      borderRadius: 20,
      padding: '16px',
      marginBottom: 12,
      boxShadow: P.shadowMd,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Mesh gradient overlay */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${colorSoft} 0%, transparent 70%)`, pointerEvents: 'none', opacity: 0.8 }} />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13, position: 'relative' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${colorSoft}, ${colorDeep}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: colorDeep, fontFamily: F.display, flexShrink: 0, boxShadow: `0 4px 12px ${colorDeep}25` }}>{avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: F.display, color: P.ink, letterSpacing: '-0.03em' }}>{fmtNum(totalFollowers)}</span>
            <span style={{ fontSize: 11, color: deltaVal >= 0 ? P.sageDeep : P.roseDeep, fontWeight: 700, background: deltaVal >= 0 ? P.sageSoft : P.roseSoft, borderRadius: 100, padding: '1px 7px' }}>{deltaVal >= 0 ? '↑' : '↓'} {deltaVal >= 0 ? '+' : ''}{fmtNum(Math.abs(deltaVal))}</span>
            <span style={{ fontSize: 10, color: P.inkFaint }}>{deltaLabel}</span>
          </div>
        </div>
        <Ring val={displayScore} color={colorDeep} size={44} />
      </div>

      {/* Follower source pie */}
      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${P.borderLight}` }}>
        <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Followers by Platform</div>
        <SpinPieChart slices={pieSlices} size={76} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7, marginBottom: 12 }}>
        <div style={{ background: colorSoft, borderRadius: 9, padding: '9px 11px' }}>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Engagement</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{displayEngagement}</div>
          {name === 'Mason' && liveMetrics && <div style={{ fontSize: 9, color: P.sageDeep, marginTop: 2, fontFamily: F.mono }}>live ✓</div>}
          
        </div>
        <div style={{ background: colorSoft, borderRadius: 9, padding: '9px 11px' }}>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reach</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{totalReach}</div>
          {name === 'Mason' && liveMetrics && <div style={{ fontSize: 9, color: P.sageDeep, marginTop: 2, fontFamily: F.mono }}>derived ✓</div>}
          
        </div>
      </div>

      {/* Goal bar with platform switcher */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1 }}>Follower Goal</div>
          <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 2, gap: 1 }}>
            {['instagram', 'tiktok'].map(pl => (
              <button key={pl} onClick={() => setGoalPlatform(pl)}
                style={{ background: goalPlatform === pl ? colorDeep : 'none', color: goalPlatform === pl ? P.white : P.inkSoft, border: 'none', borderRadius: 11, padding: '3px 9px', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {pl === 'instagram' ? 'IG' : 'TT'}
              </button>
            ))}
          </div>
          <input type="number" value={activeGoal}
            onChange={e => { const v = parseInt(e.target.value); if (v > 0) setActiveGoal(v); }}
            style={{ width: 68, border: `1px solid ${P.border}`, borderRadius: 7, padding: '3px 7px', fontSize: 11, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: F.mono }}>{goalFollowers.toLocaleString()} / {activeGoal.toLocaleString()}</div>
        </div>
        <div style={{ background: `${color}25`, borderRadius: 99, height: 6, marginBottom: 6, overflow: 'hidden' }}>
          <div style={{ background: color, height: 6, width: `${Math.min(100, (goalFollowers / Math.max(activeGoal, 1)) * 100)}%`, borderRadius: 99, transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: F.mono }}>
            {goalPaceSource === 'historical_data' ? goalPace + ' ✓' : goalPaceSource === 'early_estimate' ? goalPace + ' (early)' : goalMonthly > 0 ? goalPace + ' (est.)' : 'Syncing baseline'}
          </div>
          <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>
            Est. {calcEstDate(goalFollowers, activeGoal, goalMonthly > 0 ? goalMonthly : Math.max(1, Math.round(goalFollowers * 0.03)))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── OVERVIEW TAB ───────────────────────────────────────────────────────────
const OverviewTab = ({ igMetrics, igLoading, igGoal, handleSetIgGoal, today }: any) => {
  const [timePeriod, setTimePeriod] = useState('month');
  const [igHistory, setIgHistory] = useState<any[]>([]);
  const [mattGoal, setMattGoal] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('matt_goal') ?? '100000');
    return 100000;
  });

  useEffect(() => {
    fetch('/api/sync/instagram/history?days=365')
      .then(r => r.json())
      .then(d => setIgHistory(d.history ?? []))
      .catch(() => {});
  }, []);

  const handleSetMattGoal = (v: number) => {
    setMattGoal(v);
    if (typeof window !== 'undefined') localStorage.setItem('matt_goal', String(v));
  };

  const masonAccounts = [
    { platform: 'TikTok', followers: 0, followerDelta: '—', reach: '0' },
    { platform: 'Instagram', followers: igMetrics?.followers ?? 370, followerDelta: '—', reach: igMetrics?.reach ?? '56' },
  ];

  const mattAccounts = [
    { platform: 'TikTok', followers: 0, followerDelta: '—', reach: '—' },
    { platform: 'Instagram', followers: 0, followerDelta: '—', reach: '—' },
  ];

  // Combined totals
  const masonTotal = igMetrics?.followers ?? 370;
  const mattTotal = 48200 + 5300;
  const combinedTotal = masonTotal + mattTotal;
  // Weekly deltas — Mason IG real if available
  const masonWeeklyDelta = igMetrics?.weeklyGrowthRate ?? 0;
  const mattWeeklyDelta = 0; // real data once Matt connects
  const combinedWeeklyDelta = masonWeeklyDelta + mattWeeklyDelta;

  // Top content — sorted by likes, best first
  // Top content pulls from connected accounts only — no mock data
  const allContent: any[] = [];

  return (
    <div>
      {/* Morning briefing */}
      <div className="liquid-glass-dark" style={{ borderRadius: 18, padding: '15px 17px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle, ${P.lavender}25, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.lavender, fontFamily: F.mono, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📰</span> Morning Briefing · {today}
        </div>
        <div style={{ fontSize: 13, color: P.darkText, lineHeight: 1.85, fontFamily: F.display, fontStyle: 'italic', position: 'relative' }}>
          {igMetrics
            ? `Mason's Instagram live — ${fmtNum(igMetrics.followers)} followers, reach est. ${igMetrics.reach}. ${igMetrics.paceSource === 'historical_data' ? `Tracking ${igMetrics.pace} growth.` : 'Growth data building — pace sharpens over time.'} Matt's Ramen video at 41K views still leading this week. Korean BBQ tacos trending on TikTok Search in SoCal — nobody has filmed it yet.`
            : "Matt's Ramen video hit 41K views in 18 hours — best organic run of the year. Korean BBQ tacos trending on TikTok Search in SoCal — nobody has filmed it yet."
          }
        </div>
      </div>

      {/* Combined totals banner — updates with time period */}
      {(() => {
        const masonHistoryDelta = igHistory.length >= 2 ? applyTimePeriodFromHistory(igHistory, timePeriod).value : 0;
        const { value: combinedDelta, label: combinedLabel } = igHistory.length >= 2
          ? applyTimePeriodFromHistory(igHistory, timePeriod)
          : applyTimePeriod(combinedWeeklyDelta, timePeriod);
        const masonDelta = masonHistoryDelta;
        const mattDelta = 0;
        return (
          <div className="liquid-glass-dark" style={{ borderRadius: 18, padding: '16px 18px', marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: 200, height: 80, background: `radial-gradient(ellipse, ${P.lavender}18, transparent 70%)`, pointerEvents: 'none' }} />
            <div>
              <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Combined Followers</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{fmtNum(combinedTotal)}</div>
              <div style={{ fontSize: 10, color: P.sageDeep, marginTop: 2 }}>↑ +{fmtNum(combinedDelta)} {combinedLabel}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Combined Reach</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{igMetrics ? igMetrics.reach : '—'}</div>
              <div style={{ fontSize: 10, color: igMetrics ? P.sageDeep : P.inkFaint, marginTop: 2 }}>{igMetrics ? 'derived live' : 'loading...'}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Platforms</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>3</div>
              <div style={{ fontSize: 10, color: P.inkFaint, marginTop: 2 }}>IG · TikTok × 2</div>
            </div>
          </div>
        );
      })()}

      {/* Time period switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: F.mono, flexShrink: 0 }}>Period:</div>
        <PeriodPill
          periods={TIME_PERIODS.map(tp => ({ id: tp.id, label: tp.label }))}
          value={timePeriod}
          onChange={setTimePeriod}
        />
      </div>

      {/* Person cards */}
      <PersonCard
        name="Mason"
        avatar="M"
        color={P.lavender}
        colorSoft={P.lavSoft}
        colorDeep={P.lavDeep}
        accounts={masonAccounts}
        contentScore={igMetrics?.contentScore ?? 0}
        engagement={igMetrics ? igMetrics.engagementRate.toFixed(1) + '%' : '0%'}
        reach={igMetrics?.reach ?? '56'}
        liveMetrics={igMetrics}
        timePeriod={timePeriod}
        igGoal={igGoal}
        setIgGoal={handleSetIgGoal}
        mattGoal={igGoal}
        setMattGoal={handleSetIgGoal}
        igHistory={igHistory}
      />
      <PersonCard
        name="Macros Wit Matt"
        avatar="B"
        color={P.sage}
        colorSoft={P.sageSoft}
        colorDeep={P.sageDeep}
        accounts={mattAccounts}
        contentScore={0}
        engagement="—"
        reach="—"
        liveMetrics={null}
        timePeriod={timePeriod}
        igGoal={mattGoal}
        setIgGoal={handleSetMattGoal}
        mattGoal={mattGoal}
        setMattGoal={handleSetMattGoal}
      />

      {/* Combined reach — real data only */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Combined Reach · All Connected Accounts</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, marginTop: 2 }}>
              {igMetrics ? igMetrics.reach : '—'}
              {igMetrics && <span style={{ fontSize: 11, color: P.sageDeep, fontWeight: 400, marginLeft: 8 }}>Instagram live ✓</span>}
              {!igMetrics && <span style={{ fontSize: 11, color: P.inkFaint, fontWeight: 400, marginLeft: 8 }}>connect accounts to populate</span>}
            </div>
          </div>
          
        </div>
        {igMetrics && <Spark data={REACH_DATA} color={P.lavDeep} h={44} />}
        {!igMetrics && (
          <div style={{ height: 44, background: P.borderLight, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>Growth curve builds as data accumulates — check back tomorrow</span>
          </div>
        )}
      </div>

      {/* Connect accounts */}
      <div className="liquid-glass-dark" style={{ borderRadius: 18, padding: '15px 17px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, background: `radial-gradient(circle, ${P.sky}15, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>Connect More Accounts</div>
        {[
          { label: "Matt's Instagram", handle: '@macroswitmatt', icon: '📸', color: P.peach },
          { label: "Matt's TikTok", handle: '@macroswitmatt', icon: '🎵', color: P.sage },
          { label: "Mason's TikTok", handle: '@masondoesnumbers', icon: '🎵', color: P.sky },
        ].map((acc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 0', borderBottom: i < 2 ? `1px solid ${P.darkBorder}` : 'none' }}>
            <span style={{ fontSize: 16 }}>{acc.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: P.darkText }}>{acc.label}</div>
              <div style={{ fontSize: 10, color: P.darkMuted }}>{acc.handle}</div>
            </div>
            <a href="/connect" style={{ background: `${acc.color}20`, border: `1px solid ${acc.color}50`, borderRadius: 20, padding: '5px 12px', color: acc.color, fontSize: 10, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: F.mono }}>Connect →</a>
          </div>
        ))}
      </div>

      {/* Biggest Follower Deck */}
      <SH children="Biggest Follower" sub="Top 4 followers ranked by their own audience size" />
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '18px', textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>🃏</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4 }}>Biggest Follower tracking coming soon</div>
        <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6 }}>Once TikTok and Instagram are connected, this will show your top 4 highest-value followers ranked by their own audience size — updated daily.</div>
      </div>

      {/* Top content — real sorted by performance */}
      <SH children="Top Content This Week" sub="Sorted by likes · best performing first" />
      {allContent.length === 0 ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 11, padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4, fontFamily: F.display }}>No content ranked yet</div>
          <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.7 }}>Once accounts are connected, your top performers show here — sorted by impact, not just likes.</div>
        </div>
      ) : allContent.map((p, i) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 11, padding: '11px 13px', marginBottom: 7, display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: P.white, fontFamily: F.mono, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>
            <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{p.creator} · {p.platform} · {fmtNum(p.likes)} likes</div>
          </div>
          {i === 0 && <span>🔥</span>}
        </div>
      ))}

      <SH children="Why We Do This" sub="Real comments from real people — connect accounts to populate." />
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 11, padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: P.inkSoft }}>Connect TikTok or Instagram to see real top comments here</div>
        <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 4 }}>This section pulls the highest-liked comments from your best performing posts</div>
      </div>
    </div>
  );
};

// ── INSTAGRAM ACCOUNT VIEW ─────────────────────────────────────────────────

// ── FOLLOWER GROWTH GRAPH ─────────────────────────────────────────────────
const FollowerGraph = ({ accountId, color, colorSoft }: { accountId?: string; color: string; colorSoft: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [hovered, setHovered] = useState<any>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(300);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const newW = containerRef.current.getBoundingClientRect().width;
        if (newW > 0) setW(newW);
      }
    };
    // Delay initial measure to ensure DOM is ready
    const timer = setTimeout(update, 50);
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const url = '/api/sync/instagram/history?days=' + range + (accountId ? '&accountId=' + accountId : '');
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d.history ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [accountId, range]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length < 2) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padL = 44, padR = 0;
    const innerW = w - padL - padR;
    const idx = Math.round(((mouseX - padL) / innerW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const px = padL + (clamped / (data.length - 1)) * innerW;
    setHoverX(px);
    setHovered(data[clamped]);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHovered(null);
  };

  if (loading) return (
    <div style={{ borderRadius: 12, overflow: 'hidden' }}>
      <div className="shimmer" style={{ height: 14, width: '40%', marginBottom: 12, borderRadius: 6 }} />
      <div className="shimmer" style={{ height: 140, borderRadius: 10, marginBottom: 10 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div className="shimmer" style={{ height: 52, borderRadius: 8 }} />
        <div className="shimmer" style={{ height: 52, borderRadius: 8 }} />
      </div>
    </div>
  );

  if (data.length < 2) return (
    <div style={{ background: colorSoft, borderRadius: 14, padding: '22px', textAlign: 'center', border: `1px solid ${color}20` }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>📈</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1a16', marginBottom: 5, fontFamily: "'Fraunces', serif" }}>Growth curve loading</div>
      <div style={{ fontSize: 11, color: '#8a8078', lineHeight: 1.7 }}>
        Data accumulates over time. Your first growth curve appears tomorrow — every day adds a new data point.
      </div>
    </div>
  );

  const h = 220;
  const padL = 44, padR = 0, padT = 14, padB = 36;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const values = data.map((d: any) => d.followers);
  const deltas = data.map((d: any) => d.delta ?? 0);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range2 = maxVal - minVal || 1;

  const points = data.map((d: any, i: number) => {
    const x = padL + (i / (data.length - 1)) * innerW;
    const y = padT + (1 - (d.followers - minVal) / range2) * innerH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

  // Smooth bezier path
  const buildSmooth = (pts: {x:number;y:number}[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const cp = (pts[i-1].x + pts[i].x) / 2;
      d += ` C ${cp.toFixed(1)} ${pts[i-1].y.toFixed(1)}, ${cp.toFixed(1)} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    return d;
  };
  const smoothPath = buildSmooth(points);
  const areaSmooth = smoothPath + ` L ${points[points.length-1].x.toFixed(1)} ${(padT+innerH).toFixed(1)} L ${padL} ${(padT+innerH).toFixed(1)} Z`;
  const gradId = 'grad_' + color.replace('#','');

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Range switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: '#b8b0a4', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Follower Growth
        </div>
        <div style={{ display: 'flex', background: 'rgba(246,243,238,0.8)', border: '1px solid rgba(232,224,212,0.8)', borderRadius: 100, padding: 3, gap: 2, backdropFilter: 'blur(8px)' }}>
          {[['7', '7d'], ['14', '14d'], ['30', '30d'], ['90', '90d']].map(([val, label]) => (
            <button key={val} onClick={() => { setRange(val); setHovered(null); setHoverX(null); }}
              className="range-pill btn-spring"
              style={{ background: range === val ? '#1e1a16' : 'none', color: range === val ? '#ffffff' : '#8a8078', border: 'none', borderRadius: 100, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Mono', monospace", boxShadow: range === val ? '0 2px 8px rgba(0,0,0,0.25)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG graph */}
      <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} height={h}
        style={{ display: 'block', width: '100%', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradient def */}
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="70%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines — 5 tiers */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const val = Math.round(minVal + t * range2);
          const y = padT + (1 - t) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={w - padR} y2={y}
                stroke={t === 0 || t === 1 ? '#e8e0d4' : '#f0ebe3'}
                strokeWidth={t === 0 || t === 1 ? '1' : '0.5'}
                strokeDasharray={t === 0 || t === 1 ? 'none' : '3,5'} />
              <text x={padL - 7} y={y + 4} textAnchor="end" fontSize="9" fill="#c0b8ae" fontFamily="'DM Mono', monospace">
                {val >= 1000 ? (val/1000).toFixed(1)+'K' : val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaSmooth} fill={`url(#${gradId})`} />
        {/* Smooth line */}
        <path d={smoothPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* X axis labels — show first, middle, last */}
        {[0, Math.floor(points.length/2), points.length - 1].map((i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <text key={i} x={p.x} y={h - 4} textAnchor="middle" fontSize="9" fill="#b8b0a4" fontFamily="'DM Mono', monospace">
              {formatDate(data[i].date)}
            </text>
          );
        })}

        {/* Hover vertical line */}
        {hoverX !== null && (
          <line x1={hoverX} y1={padT} x2={hoverX} y2={padT + innerH}
            stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity={0.6} />
        )}

        {/* Hover glow dot */}
        {hoverX !== null && hovered && (() => {
          const idx = data.findIndex((d: any) => d.date === hovered.date);
          const p = points[idx];
          if (!p) return null;
          return (
            <g>
              <circle cx={p.x} cy={p.y} r={9} fill={color} opacity={0.15} />
              <circle cx={p.x} cy={p.y} r={5} fill={color} stroke="#fff" strokeWidth="2" />
            </g>
          );
        })()}

        {/* Delta bars — green gains, red losses, taller for visibility */}
        {points.map((p, i) => {
          const delta = data[i].delta ?? 0;
          if (delta === 0) return null;
          const barH = Math.max(Math.abs(delta) * 3, 3);
          const barColor = delta > 0 ? '#5a9e66' : '#c4849a';
          return (
            <rect key={i} x={p.x - 2} y={padT + innerH + 8}
              width={4} height={barH}
              fill={barColor} opacity={0.75} rx={1}
            />
          );
        })}
      </svg>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{ background: colorSoft, borderRadius: 10, padding: '9px 13px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${color}30` }}>
          <div>
            <div style={{ fontSize: 10, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>{formatDate(hovered.date)}</div>
            <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "'Fraunces', serif", color: '#1e1a16', letterSpacing: '-0.02em' }}>{hovered.followers.toLocaleString()}</div>
          </div>
          <div style={{
            background: hovered.delta > 0 ? '#5a9e6618' : hovered.delta < 0 ? '#c4849a18' : '#8a807818',
            border: `1px solid ${hovered.delta > 0 ? '#5a9e6645' : hovered.delta < 0 ? '#c4849a45' : '#8a807835'}`,
            borderRadius: 8, padding: '6px 11px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 8, color: '#8a8078', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>daily Δ</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif",
              color: hovered.delta > 0 ? '#5a9e66' : hovered.delta < 0 ? '#c4849a' : '#8a8078' }}>
              {hovered.delta > 0 ? '+' : ''}{hovered.delta}
            </div>
          </div>
        </div>
      )}

      {/* Summary stats — Net Change + Total Unfollows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6, marginTop: 10 }}>
        {[
          { label: 'Net Change', value: (data[data.length-1]?.followers ?? 0) - (data[0]?.followers ?? 0), isGain: true },
          { label: 'Total Unfollows', value: Math.abs(data.filter((d: any) => (d.delta ?? 0) < 0).reduce((s: number, d: any) => s + (d.delta ?? 0), 0)), isGain: false },
        ].map((s, i) => (
          <div key={i} style={{ background: colorSoft, borderRadius: 9, padding: '10px 12px', textAlign: 'center', border: `1px solid ${color}20` }}>
            <div style={{ fontSize: 9, color: '#b8b0a4', fontFamily: "'DM Mono', monospace", marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Fraunces', serif",
              color: i === 0 ? (s.value > 0 ? '#5a9e66' : s.value < 0 ? '#c4849a' : '#1e1a16') : (s.value > 0 ? '#c4849a' : '#1e1a16') }}>
              {i === 0 && s.value > 0 ? '+' : i === 1 && s.value > 0 ? '-' : ''}{s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function applyTimePeriodFromHistory(history: any[], periodId: string): { value: number; label: string } {
  const labels: Record<string, string> = { day: 'today', week: 'this week', month: 'this month', year: 'this year' };
  const days: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };
  if (!history || history.length < 2) return { value: 0, label: labels[periodId] ?? 'this week' };
  const d = days[periodId] ?? 7;
  const cutoff = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const filtered = history.filter((h: any) => h.date >= cutoff);
  if (filtered.length < 1) return { value: 0, label: labels[periodId] };
  const first = filtered[0].followers ?? 0;
  const last = filtered[filtered.length - 1].followers ?? 0;
  return { value: last - first, label: labels[periodId] };
}

const UnifiedAccountView = ({ acc, igData, goal, setGoal }: { acc: any; igData: any; goal: number; setGoal: (v: number) => void }) => {
  const [timePeriod, setTimePeriod] = useState('week');
  const [goalPlatform, setGoalPlatform] = useState(acc.platform.toLowerCase());

  const metrics = igData?.metrics;
  const media = igData?.media ?? [];
  const analytics = igData?.analytics;
  const isLive = !!metrics && acc.platform === 'Instagram';
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (acc.platform === 'Instagram') {
      const url = '/api/sync/instagram/history?days=365' + (acc.dbId ? '&accountId=' + acc.dbId : '');
      fetch(url)
        .then(r => r.json())
        .then(d => setHistory(d.history ?? []))
        .catch(() => {});
    }
  }, [acc.platform, acc.dbId]);

  // If account not connected, show clean placeholder
  if (acc.notConnected) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{acc.platform === 'TikTok' ? '🎵' : '📸'}</div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display, color: P.ink, marginBottom: 8 }}>
          {acc.platform} Not Connected
        </div>
        <div style={{ fontSize: 12, color: P.inkSoft, lineHeight: 1.7, marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>
          Connect {acc.handle} to start tracking followers, reach, engagement, posts, and more — updated every 5 minutes.
        </div>
        <a href="/connect" style={{ background: acc.platform === 'TikTok' ? P.sage : P.rose, border: 'none', borderRadius: 12, padding: '12px 24px', color: P.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', fontFamily: F.body }}>
          Connect {acc.platform} →
        </a>
      </div>
    );
  }

  // Core metrics — use live if available, else use mock
  const followers = isLive ? metrics.followers : acc.followers;
  const following = isLive ? metrics.following : null;
  const reachDisplay = isLive ? metrics.reach : (acc.reach >= 1000 ? fmtNum(acc.reach) : String(acc.reach));
  const engagementDisplay = isLive ? metrics.engagementRate.toFixed(1) + '%' : acc.engagement;
  const handle = isLive ? metrics.handle : acc.handle;
  const mediaCount = isLive ? metrics.mediaCount : (acc.posts?.length ?? 0);
  const contentScore = isLive ? metrics.contentScore : 0;

  // Pace
  const weeklyDelta = isLive
    ? (metrics.weeklyGrowthRate ?? Math.round(metrics.monthlyGrowthRate / 4.33))
    : (parseInt((acc.followerDelta ?? '+0').replace('+', '')) || 0);
  const paceMonthly = isLive ? (metrics.monthlyGrowthRate ?? 0) : Math.round(weeklyDelta * 4.33);
  const paceYearly = isLive ? (metrics.yearlyGrowthRate ?? paceMonthly * 12) : paceMonthly * 12;
  const paceSource = isLive ? (metrics.paceSource ?? 'estimated_baseline') : 'estimated_baseline';
  const rawPace = isLive ? (metrics.pace ?? 'Syncing baseline') : (paceMonthly > 0 ? '+' + paceMonthly + '/mo' : 'Syncing baseline');

  const paceByPeriod: Record<string, string> = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: weeklyDelta > 0 ? String(weeklyDelta) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  };
  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };

  const { value: deltaVal, label: deltaLabel } = history.length >= 2
    ? applyTimePeriodFromHistory(history, timePeriod)
    : applyTimePeriod(weeklyDelta, timePeriod);

  // ETA
  const goalFollowers = followers;
  const goalMonthly = paceMonthly > 0 ? paceMonthly : Math.max(1, Math.round(followers * 0.03));
  const estDate = calcEstDate(goalFollowers, goal, goalMonthly);

  // Pie chart slices
  const pieSlices = [{ value: followers, color: acc.colorDeep, label: acc.platform }];

  // Posts/media
  const posts = isLive && media.length > 0 ? media : (acc.posts ?? []);
  const working = analytics?.working ?? acc.working;
  const flopping = analytics?.flopping ?? acc.flopping;

  // Sparkline data
  const engHistory = [0, 0, 0, 0, 0, 0, isLive ? metrics.engagementRate : parseFloat(acc.engagement ?? '0')];
  const reachHistory = [0, 0, 0, 0, 0, 0, isLive ? parseFloat(String(metrics.reach).replace('K', '')) || 1 : acc.reach / 1000 || 1];

  return (
    <div>
      {/* Account sub-header with score ring */}
      <div className="liquid-glass" style={{ borderRadius: 16, padding: '13px 15px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${acc.colorSoft}, ${acc.color}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, boxShadow: `0 3px 8px ${acc.color}30` }}>{acc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.ink }}>{acc.platform}</div>
          <div style={{ fontSize: 10, color: P.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
            {handle}
            {isLive && <><LiveDot color={P.sageDeep} /><span style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono, fontWeight: 600 }}>synced</span></>}
          </div>
        </div>
        <Ring val={contentScore} color={acc.colorDeep} size={44} />
      </div>

      {/* Followers card with pie chart and time switcher */}
      <div className="card-lift" style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid rgba(255,255,255,0.65)`,
        borderRadius: 18,
        padding: '15px 16px',
        marginBottom: 10,
        boxShadow: `${P.shadowMd}, 0 0 0 1.5px ${acc.color}20 inset`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top color bar replaced with gradient glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${acc.color}, ${acc.colorDeep})`, borderRadius: '18px 18px 0 0' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(180deg, ${acc.color}18 0%, transparent 100%)`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              Followers {isLive && <LiveDot color={P.sageDeep} />}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{fmtNum(followers)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: deltaVal >= 0 ? P.sageDeep : P.roseDeep, fontWeight: 600 }}>
                {deltaVal >= 0 ? '↑' : '↓'} {deltaVal >= 0 ? '+' : ''}{fmtNum(Math.abs(deltaVal))}
              </span>
              <span style={{ fontSize: 10, color: P.inkFaint }}>{deltaLabel}</span>
            </div>
            {/* Time period switcher */}
            <div style={{ marginTop: 10 }}>
              <PeriodPill
                periods={TIME_PERIODS.map((tp: any) => ({ id: tp.id, label: tp.label }))}
                value={timePeriod}
                onChange={setTimePeriod}
              />
            </div>
          </div>
          {/* Pie chart */}
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>By Platform</div>
            <SpinPieChart slices={pieSlices} size={72} />
          </div>
        </div>
      </div>

      {/* Follower growth graph — only for live accounts */}
      {isLive && (
        <div style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid rgba(255,255,255,0.65)`, borderRadius: 18, marginBottom: 10, boxShadow: P.shadowMd, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${acc.color}, ${acc.colorDeep})`, borderRadius: '18px 18px 0 0', zIndex: 2 }} />
          <div style={{ padding: '18px 18px 0' }}>
            <FollowerGraph color={acc.colorDeep} colorSoft={acc.colorSoft} accountId={acc.dbId} />
          </div>
          <div style={{ height: 14 }} />
        </div>
      )}

      {/* Engagement + Reach with sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 10 }}>
        <div className="card-lift" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid rgba(255,255,255,0.65)`, borderRadius: 16, padding: '13px 14px', boxShadow: P.shadowSm, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg, ${acc.color}, ${acc.colorDeep})`, borderRadius: '16px 16px 0 0' }} />
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: F.mono, marginBottom: 4 }}>Engagement</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{engagementDisplay}</div>
          <div style={{ fontSize: 9, color: isLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginBottom: 7, fontWeight: 600 }}>{isLive ? 'live ✓' : '—'}</div>
          <Spark data={engHistory} color={acc.color} h={28} />
        </div>
        <div className="card-lift" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid rgba(255,255,255,0.65)`, borderRadius: 16, padding: '13px 14px', boxShadow: P.shadowSm, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg, ${acc.color}, ${acc.colorDeep})`, borderRadius: '16px 16px 0 0' }} />
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: F.mono, marginBottom: 4 }}>Reach</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{reachDisplay}</div>
          <div style={{ fontSize: 9, color: isLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginBottom: 7, fontWeight: 600 }}>{isLive ? 'derived ✓' : '—'}</div>
          <Spark data={reachHistory} color={acc.color} h={28} />
        </div>
        {following != null && (
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Following</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{fmtNum(following)}</div>
            <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>live ✓</div>
          </div>
        )}
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Posts</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{mediaCount}</div>
          <div style={{ fontSize: 9, color: isLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono }}>{isLive ? 'live ✓' : '—'}</div>
        </div>
      </div>

      {/* Content Stats by Period */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '13px 15px', marginBottom: 8, borderTop: `2.5px solid ${acc.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Content Performance</div>
          <div style={{ fontSize: 9, color: acc.colorDeep, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {timePeriod === 'day' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'this year'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
          {[
            { label: 'Posts', value: posts.length > 0 ? String(posts.length) : '—', sub: timePeriod === 'day' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'this year' },
            { label: 'Likes', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.like_count ?? p.likes ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Comments', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.comments_count ?? p.comments ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Saves', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.saved ?? p.saves ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Shares', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.shares_count ?? p.shares ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Reach', value: isLive ? reachDisplay : '—', sub: 'impressions' },
          ].map((s, i) => (
            <div key={i} style={{ background: `${acc.color}20`, borderRadius: 9, padding: '9px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{s.value}</div>
              <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {posts.filter((p: any) => isTrending(p).trending).length > 0 && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: '#fff3cd', border: '1px solid #f2dfa0', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b8940a', fontFamily: F.mono }}>
                {posts.filter((p: any) => isTrending(p).trending).length} TRENDING POST{posts.filter((p: any) => isTrending(p).trending).length > 1 ? 'S' : ''}
              </div>
              <div style={{ fontSize: 10, color: '#8a7020' }}>
                {posts.filter((p: any) => isTrending(p).trending).map((p: any) => isTrending(p).label).join(' · ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Growth Pace */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth Pace</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase' }}>{paceLabels[timePeriod]}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
              {paceByPeriod[timePeriod] !== '—' ? '+' + paceByPeriod[timePeriod] : '—'}
            </div>
            <div style={{ fontSize: 9, color: isLive && paceSource === 'historical_data' ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>
              {isLive ? (paceSource === 'historical_data' ? 'tracked ✓' : paceSource === 'early_estimate' ? 'early data' : 'est. baseline') : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase' }}>Goal: {fmtNum(goal)} followers</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{paceMonthly > 0 ? estDate : '—'}</div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>
              {paceMonthly > 0 ? `${fmtNum(Math.max(0, goal - followers))} to go at ${timePeriod} rate` : 'Connect to track'}
            </div>
          </div>
        </div>
        <PeriodPill
          periods={TIME_PERIODS.map((tp: any) => ({ id: tp.id, label: tp.label }))}
          value={timePeriod}
          onChange={setTimePeriod}
          color={acc.colorDeep}
        />
      </div>

      {/* Follower Goal */}
      <SH>Follower Goal</SH>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: P.inkSoft }}>Target:</div>
        <input type="text" inputMode="numeric" defaultValue={String(goal)}
          onBlur={(e: any) => { const v = parseInt(e.target.value.replace(/,/g, '')); if (v > 0) setGoal(v); else e.target.value = String(goal); }}
          onKeyDown={(e: any) => { if (e.key === 'Enter') { const v = parseInt(e.target.value.replace(/,/g, '')); if (v > 0) { setGoal(v); e.target.blur(); } } }}
          style={{ width: 90, border: `1px solid ${P.border}`, borderRadius: 7, padding: '4px 8px', fontSize: 12, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right', outline: 'none' }}
        />
      </div>
      <GoalBar
        label={acc.platform + ' Followers'}
        current={followers}
        goal={goal}
        color={acc.color}
        colorSoft={acc.colorSoft}
        pace={paceMonthly > 0 ? '+' + paceMonthly + '/mo' : 'Syncing baseline'}
        paceSource={paceSource}
        estDate={estDate}
      />

      {/* Viral velocity milestones */}
      {acc.milestones && acc.milestones.length > 0 && (
        <>
          <SH>Viral Velocity Tracker</SH>
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, overflow: 'hidden', marginBottom: 8 }}>
            {acc.milestones.map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < acc.milestones.length - 1 ? `1px solid ${P.borderLight}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 12, color: P.inkMid }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: P.inkFaint, marginTop: 1 }}>{m.delta}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: acc.colorDeep, fontFamily: F.display }}>{m.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <>
          <SH>Recent Posts</SH>
          {posts.slice(0, 5).map((p: any, i: number) => (
            <PostCard key={p.id ?? i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />
          ))}
        </>
      )}
      {posts.length === 0 && (
        <div className="card-lift" style={{ background: `linear-gradient(135deg, ${acc.colorSoft}, rgba(255,255,255,0.9))`, border: `1px solid ${acc.color}30`, borderRadius: 16, padding: '22px', textAlign: 'center', margin: '12px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: P.ink, marginBottom: 5, fontFamily: F.display }}>No content tested yet</div>
          <div style={{ fontSize: 12, color: P.inkSoft, lineHeight: 1.7 }}>This is where your first viral clip starts. Post and watch the data come in.</div>
        </div>
      )}

      <SH>{"What's Working · What's Flopping"}</SH>
      <WW working={working ?? 'Post content to see what works.'} flopping={flopping ?? 'Post content to identify patterns.'} />

      {acc.topComments?.length > 0 && (
        <>
          <SH>Top Comments</SH>
          {acc.topComments.map((c: any, i: number) => <CmtCard key={i} c={c} accent={acc.colorDeep} accentSoft={acc.colorSoft} />)}
        </>
      )}

      <SH>AI Strategic Insight</SH>
      <AIInsight text={acc.insight ?? 'Connect this account to generate AI insights based on your real content performance.'} platform={acc.platform} />
    </div>
  );
};


// ── DYNAMIC CLIENT VIEW ───────────────────────────────────────────────────
// Reads connected accounts from Supabase via API
// Each account gets its own expandable card
const DynamicClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const isMason = client.id === 'mason';

  useEffect(() => {
    // Fetch connected accounts for this client from API
    fetch('/api/accounts/' + client.id)
      .then(r => r.json())
      .then(d => {
        setAccounts(d.accounts ?? []);
        // Open first account by default
        if (d.accounts?.length > 0) {
          setOpenIds(new Set([d.accounts[0].id]));
        }
        setLoading(false);
      })
      .catch(() => {
        // Fall back to hardcoded accounts from CLIENTS
        setAccounts(client.accounts ?? []);
        if (client.accounts?.length > 0) {
          setOpenIds(new Set([client.accounts[0].platform + '_0']));
        }
        setLoading(false);
      });
  }, [client.id]);

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const metrics = igData?.metrics;
  const displayFollowers = isMason && metrics ? metrics.followers : client.totalFollowers;
  const contentScore = isMason && metrics ? metrics.contentScore : client.contentScore;

  // Group accounts by platform
  const byPlatform: Record<string, any[]> = {};
  accounts.forEach(acc => {
    const p = acc.platform ?? 'other';
    if (!byPlatform[p]) byPlatform[p] = [];
    byPlatform[p].push(acc);
  });

  // Also include hardcoded unconnected accounts
  const connectedHandles = new Set(accounts.map(a => a.username?.toLowerCase()));
  const staticAccounts = (client.accounts ?? []).filter((a: any) => 
    !connectedHandles.has(a.handle?.replace('@', '').toLowerCase())
  );

  const platformOrder = ['tiktok', 'instagram', 'youtube', 'twitter', 'threads'];
  const platformColors: Record<string, any> = {
    tiktok: { color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep, icon: '🎵' },
    instagram: { color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep, icon: '📸' },
    youtube: { color: P.butter, colorSoft: P.butterSoft, colorDeep: P.butterDeep, icon: '▶️' },
    twitter: { color: P.sky, colorSoft: P.skySoft, colorDeep: P.skyDeep, icon: '𝕏' },
    threads: { color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep, icon: '🧵' },
  };

  return (
    <div>
      {/* Client header */}
      <div className="card-lift" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.7)`,
        borderRadius: 22,
        padding: '18px 20px',
        marginBottom: 16,
        display: 'flex', gap: 14, alignItems: 'center',
        boxShadow: P.shadowLg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, background: `radial-gradient(circle, ${client.colorSoft}90, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ width: 54, height: 54, borderRadius: 15, background: `linear-gradient(135deg, ${client.colorSoft}, ${client.colorDeep}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: client.colorDeep, fontFamily: F.display, flexShrink: 0, boxShadow: `0 6px 20px ${client.colorDeep}30` }}>
          {client.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{client.name}</div>
          <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 6 }}>{client.role}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {accounts.map((acc: any) => (
              <Tag key={acc.id} color={acc.platform === 'instagram' ? P.roseDeep : acc.platform === 'tiktok' ? P.sageDeep : P.skyDeep}
                bg={acc.platform === 'instagram' ? P.roseSoft : acc.platform === 'tiktok' ? P.sageSoft : P.skySoft}>
                {acc.platform === 'instagram' ? '📸' : acc.platform === 'tiktok' ? '🎵' : '▶️'} @{acc.username}
              </Tag>
            ))}
            {loading && <Tag color={P.inkFaint} bg={P.card}>Loading...</Tag>}
            {!loading && accounts.length === 0 && <Tag color={P.inkFaint} bg={P.card}>No accounts connected</Tag>}
          </div>
        </div>
        <Ring val={contentScore} color={client.colorDeep} size={50} />
      </div>

      {/* Best times */}
      <SH>Best Times to Post</SH>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
        {client.bestTimes.map((t: string, i: number) => <Tag key={i} color={client.colorDeep} bg={client.colorSoft}>⏰ {t}</Tag>)}
      </div>

      {/* Connected accounts — dynamic from Supabase */}
      <SH children={`${accounts.length + staticAccounts.length} Connected Account${accounts.length + staticAccounts.length !== 1 ? 's' : ''}`} sub="Tap header to collapse · both open by default" />

      {loading && (
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
          <div className="shimmer" style={{ height: 64, borderRadius: 16, marginBottom: 8 }} />
          <div className="shimmer" style={{ height: 64, borderRadius: 16 }} />
        </div>
      )}

      {!loading && (
        <>
          {/* Live connected accounts from Supabase */}
          {platformOrder.map(platform => {
            const platformAccs = byPlatform[platform] ?? [];
            if (platformAccs.length === 0) return null;
            const pc = platformColors[platform] ?? { color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep, icon: '📱' };

            return platformAccs.map((acc: any, accIdx: number) => {
              const accId = acc.id ?? platform + '_' + accIdx;
              const isOpen = openIds.has(accId);
              const isIGLive = isMason && platform === 'instagram' && !!metrics && acc.username === 'masondoesnumbers';
              const followers = isIGLive ? metrics.followers : (acc.follower_count ?? acc.followers ?? 0);
              const handle = '@' + acc.username;

              // Build a fake acc object for UnifiedAccountView
              const accObj = {
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                icon: pc.icon,
                handle,
                dbId: acc.id,
                followers,
                followerDelta: '—',
                reach: isIGLive ? metrics.reach : 0,
                engagement: isIGLive ? metrics.engagementRate.toFixed(1) + '%' : '—',
                color: pc.color,
                colorSoft: pc.colorSoft,
                colorDeep: pc.colorDeep,
                notConnected: false,
                posts: [],
                topComments: [],
                working: 'Post content to see what is working.',
                flopping: 'Post content to identify patterns.',
                insight: 'Account connected. Post content to generate AI insights.',
              };

              return (
                <div key={accId} className="card-lift" style={{
                  background: isOpen ? 'rgba(255,255,255,0.88)' : 'rgba(250,249,246,0.7)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${isOpen ? pc.color + '60' : 'rgba(230,224,214,0.6)'}`,
                  borderRadius: 18,
                  marginBottom: 10,
                  overflow: 'hidden',
                  boxShadow: isOpen ? `${P.shadowMd}, 0 0 0 1px ${pc.color}15` : P.shadowSm,
                  transition: `border-color 0.25s ${smooth}, box-shadow 0.25s ${smooth}`,
                }}>
                  {/* Account header */}
                  <button
                    onClick={() => toggle(accId)}
                    className="btn-spring"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderBottom: isOpen ? `1px solid ${P.border}` : 'none',
                    }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${pc.colorSoft}, ${pc.color}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, boxShadow: isOpen ? `0 4px 12px ${pc.color}40` : 'none', transition: `box-shadow 0.25s ${smooth}` }}>{pc.icon}</div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        {isIGLive && <LiveDot color={P.sageDeep} />}
                        {platformAccs.length > 1 && (
                          <span style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, background: P.borderLight, borderRadius: 10, padding: '1px 6px' }}>
                            {accIdx + 1} of {platformAccs.length}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: P.inkSoft }}>{handle}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{fmtNum(followers)}</div>
                      <div style={{ fontSize: 9, color: isIGLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono }}>
                        {isIGLive ? 'synced ✓' : 'connected'}
                      </div>
                    </div>
                    <div style={{
                      color: P.inkFaint,
                      fontSize: 10,
                      marginLeft: 3,
                      transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>▼</div>
                  </button>

                  {/* Smooth expand */}
                  <div style={{
                    maxHeight: isOpen ? '2000px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div style={{ padding: '14px 15px' }}>
                      <UnifiedAccountView
                        acc={accObj}
                        igData={isIGLive ? igData : null}
                        goal={igGoal}
                        setGoal={setIgGoal}
                      />
                    </div>
                  </div>
                </div>
              );
            });
          })}

          {/* Static unconnected accounts */}
          {staticAccounts.map((acc: any, idx: number) => {
            const accId = 'static_' + idx;
            const isOpen = openIds.has(accId);
            return (
              <div key={accId} style={{
                background: P.card,
                border: `1px solid ${P.border}`,
                borderRadius: 15,
                marginBottom: 10,
                overflow: 'hidden',
                opacity: 0.7,
              }}>
                <button onClick={() => toggle(accId)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: isOpen ? `1px solid ${P.border}` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{acc.icon}</div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{acc.platform}</div>
                    <div style={{ fontSize: 10, color: P.inkSoft }}>{acc.handle}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: F.mono }}>not connected</div>
                  </div>
                  <div style={{ color: P.inkFaint, fontSize: 10, marginLeft: 3, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
                </button>
                <div style={{ maxHeight: isOpen ? '400px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div style={{ padding: '14px 15px' }}>
                    <UnifiedAccountView acc={acc} igData={null} goal={igGoal} setGoal={setIgGoal} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add account CTA */}
          <a href="/connect"
            className="card-lift"
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1.5px dashed ${P.border}`, borderRadius: 18, padding: '14px 16px', textDecoration: 'none', marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${client.colorSoft}, ${client.color}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: client.colorDeep, flexShrink: 0, boxShadow: `0 3px 8px ${client.color}30` }}>+</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>Connect another account</div>
              <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 1 }}>Instagram · TikTok · YouTube · more</div>
            </div>
            <div style={{ marginLeft: 'auto', color: P.inkFaint, fontSize: 14 }}>→</div>
          </a>
        </>
      )}
    </div>
  );
};


// ── DYNAMIC CLIENT VIEW ───────────────────────────────────────────────────
// Reads connected accounts from Supabase via API
// Each account gets its own expandable card
const ClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  // Both panels open by default
  const [openAccs, setOpenAccs] = useState<Set<number>>(() => new Set(client.accounts.map((_: any, i: number) => i)));
  const toggleAcc = (idx: number) => setOpenAccs(prev => {
    const s = new Set(prev);
    s.has(idx) ? s.delete(idx) : s.add(idx);
    return new Set(s);
  });

  const [mattGoals, setMattGoals] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('matt_goals') ?? '{}'); } catch { return {}; }
    }
    return {};
  });

  const metrics = igData?.metrics;
  const isMason = client.id === 'mason';
  const displayFollowers = isMason && metrics ? metrics.followers : client.totalFollowers;
  const contentScore = isMason && metrics ? metrics.contentScore : client.contentScore;

  const setMattGoal = (platform: string, v: number) => {
    const updated = { ...mattGoals, [platform]: v };
    setMattGoals(updated);
    if (typeof window !== 'undefined') localStorage.setItem('matt_goals', JSON.stringify(updated));
  };

  // Reorder accounts: TikTok always first
  const sortedAccounts = [...client.accounts].sort((a: any, b: any) => {
    if (a.platform === 'TikTok') return -1;
    if (b.platform === 'TikTok') return 1;
    return 0;
  });

  return (
    <div>
      {/* Creator header */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, padding: '16px 18px', marginBottom: 14, display: 'flex', gap: 13, alignItems: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: client.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: client.colorDeep, fontFamily: F.display, flexShrink: 0 }}>
          {client.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{client.name}</div>
          <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 6 }}>{client.role}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {isMason ? (
              <>
                <Tag color={P.roseDeep} bg={P.roseSoft}>📸 @masondoesnumbers</Tag>
                <Tag color={P.skyDeep} bg={P.skySoft}>🎵 @masondoesnumbers</Tag>
              </>
            ) : (
              <>
                <Tag color={P.sageDeep} bg={P.sageSoft}>🎵 @macroswitmatt</Tag>
                <Tag color={P.peachDeep} bg={P.peachSoft}>📸 @macroswithmatt</Tag>
              </>
            )}
          </div>
        </div>
        <Ring val={contentScore} color={client.colorDeep} size={50} />
      </div>

      {/* Best times */}
      <SH>Best Times to Post</SH>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
        {client.bestTimes.map((t: string, i: number) => <Tag key={i} color={client.colorDeep} bg={client.colorSoft}>⏰ {t}</Tag>)}
      </div>

      {/* Connected accounts — TikTok first, both open by default */}
      <SH children={`${sortedAccounts.length} Connected Accounts`} sub="Tap header to collapse · both open by default" />
      {sortedAccounts.map((acc: any, idx: number) => {
        const originalIdx = client.accounts.indexOf(acc);
        const isOpen = openAccs.has(originalIdx);
        const isIGLive = isMason && acc.platform === 'Instagram' && !!metrics;
        const accGoal = isMason
          ? igGoal
          : (mattGoals[acc.platform] ?? (acc.platform === 'TikTok' ? 100000 : 10000));
        const setAccGoal = isMason
          ? setIgGoal
          : (v: number) => setMattGoal(acc.platform, v);

        return (
          <div key={originalIdx} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 15, marginBottom: 12, overflow: 'hidden' }}>
            {/* Account header button */}
            <button onClick={() => toggleAcc(originalIdx)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: isOpen ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{acc.icon}</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {acc.platform}
                  {isIGLive && <LiveDot color={P.sageDeep} />}
                </div>
                <div style={{ fontSize: 10, color: P.inkSoft }}>
                  {isIGLive ? metrics.handle : acc.handle}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
                  {isIGLive ? fmtNum(metrics.followers) : fmtNum(acc.followers)}
                </div>
                <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>
                  {isIGLive ? 'synced ✓' : acc.followerDelta + ' this wk'}
                </div>
              </div>
              <div style={{ color: P.inkFaint, fontSize: 10, marginLeft: 3 }}>{isOpen ? '▲' : '▼'}</div>
              <button onClick={(e) => { e.stopPropagation(); if (confirm('Remove ' + acc.platform + ' (' + acc.handle + ') from dashboard?')) { fetch('/api/connect/instagram/save', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: acc.platform.toLowerCase(), handle: acc.handle }) }).then(() => window.location.reload()); } }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: P.inkFaint, fontSize: 11, marginLeft: 4, borderRadius: 6 }}
                title="Remove account">✕</button>
            </button>

            {/* Account content — same component for all */}
            {isOpen && (
              <div style={{ padding: '14px 15px' }}>
                <UnifiedAccountView
                  acc={acc}
                  igData={isIGLive ? igData : null}
                  goal={accGoal}
                  setGoal={setAccGoal}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


// ── REACH DATA ─────────────────────────────────────────────────────────────
// ── BIGGEST FOLLOWER DECK ──────────────────────────────────────────────────
const BIGGEST_FOLLOWERS: Record<string, any[]> = {
  day: [
    { handle: '@foodgodnyc', platform: 'Instagram', followers: 4200000, badge: '#1 Today', since: 'followed 2hrs ago', avatar: 'FG', color: P.rose, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@latimes', platform: 'Twitter', followers: 1800000, badge: '#2 Today', since: 'followed 5hrs ago', avatar: 'LT', color: P.sky, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@thrillist', platform: 'Instagram', followers: 980000, badge: '#3 Today', since: 'followed 6hrs ago', avatar: 'TH', color: P.peach, followedAccount: '@masondoesnumbers', followedPlatform: 'Instagram' },
    { handle: '@eatfamous', platform: 'TikTok', followers: 440000, badge: '#4 Today', since: 'followed 11hrs ago', avatar: 'EF', color: P.sage, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
  ],
  week: [
    { handle: '@gordonramsay', platform: 'Instagram', followers: 16500000, badge: '#1 This Week', since: 'followed Mon', avatar: 'GR', color: P.rose, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@ladbible', platform: 'TikTok', followers: 7200000, badge: '#2 This Week', since: 'followed Tue', avatar: 'LB', color: P.sage, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@foodgodnyc', platform: 'Instagram', followers: 4200000, badge: '#3 This Week', since: 'followed Wed', avatar: 'FG', color: P.peach, followedAccount: '@masondoesnumbers', followedPlatform: 'Instagram' },
    { handle: '@eater', platform: 'Twitter', followers: 1100000, badge: '#4 This Week', since: 'followed Thu', avatar: 'EA', color: P.sky, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
  ],
  month: [
    { handle: '@gordonramsay', platform: 'Instagram', followers: 16500000, badge: '#1 This Month', since: 'followed Apr 2', avatar: 'GR', color: P.rose, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@ladbible', platform: 'TikTok', followers: 7200000, badge: '#2 This Month', since: 'followed Apr 5', avatar: 'LB', color: P.sage, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@tasty', platform: 'Instagram', followers: 5900000, badge: '#3 This Month', since: 'followed Apr 8', avatar: 'TA', color: P.peach, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@foodgodnyc', platform: 'Instagram', followers: 4200000, badge: '#4 This Month', since: 'followed Apr 11', avatar: 'FG', color: P.lavender, followedAccount: '@masondoesnumbers', followedPlatform: 'Instagram' },
  ],
  year: [
    { handle: '@gordonramsay', platform: 'Instagram', followers: 16500000, badge: '#1 This Year', since: 'followed Jan 14', avatar: 'GR', color: P.rose, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@ladbible', platform: 'TikTok', followers: 7200000, badge: '#2 This Year', since: 'followed Feb 3', avatar: 'LB', color: P.sage, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@tasty', platform: 'Instagram', followers: 5900000, badge: '#3 This Year', since: 'followed Mar 7', avatar: 'TA', color: P.peach, followedAccount: '@macroswitmatt', followedPlatform: 'TikTok' },
    { handle: '@buzzfeed', platform: 'Twitter', followers: 4800000, badge: '#4 This Year', since: 'followed Mar 22', avatar: 'BF', color: P.sky, followedAccount: '@masondoesnumbers', followedPlatform: 'Instagram' },
  ],
};

const BiggestFollowerDeck = () => {
  const [period, setPeriod] = useState('week');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const cards = BIGGEST_FOLLOWERS[period];
  const rotations = [-9, -3, 3, 9];
  const xOffsets = [0, 30, 60, 90];
  const yOffsets = [18, 8, 8, 18];

  const periodLabels: Record<string, string> = {
    day: 'today', week: 'this week', month: 'this month', year: 'this year',
  };

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Period switcher */}
      <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1, marginBottom: 14, width: 'fit-content' }}>
        {['day', 'week', 'month', 'year'].map(p => (
          <button key={p} onClick={() => { setPeriod(p); setSelectedIdx(null); }}
            style={{ background: period === p ? P.ink : 'none', color: period === p ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono, marginBottom: 16 }}>
        Biggest followers by their own follower count · {periodLabels[period]}
      </div>

      {/* Fanned card deck */}
      <div style={{ position: 'relative', height: 268, marginBottom: selectedIdx !== null ? 14 : 0 }}>
        {cards.map((card, i) => {
          const isSelected = selectedIdx === i;
          return (
            <div key={i} onClick={() => setSelectedIdx(isSelected ? null : i)}
              style={{
                position: 'absolute',
                left: xOffsets[i],
                top: isSelected ? 0 : yOffsets[i],
                width: 195,
                height: 240,
                borderRadius: 16,
                background: P.white,
                border: `1px solid ${isSelected ? card.color : P.border}`,
                zIndex: isSelected ? 10 : (4 - i),
                transform: `rotate(${isSelected ? 0 : rotations[i]}deg) ${isSelected ? 'translateY(-12px) scale(1.04)' : ''}`,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}>
              {/* Color bar top */}
              <div style={{ height: 5, background: card.color, opacity: 0.8 }} />
              <div style={{ padding: '12px 13px 0' }}>
                <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 9 }}>{card.badge}</div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${card.color}25`, border: `1.5px solid ${card.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: card.color, fontFamily: F.display, marginBottom: 9 }}>{card.avatar}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.handle}</div>
                <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{card.platform}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 13, left: 13, right: 13 }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{fmtNum(card.followers)}</div>
                <div style={{ fontSize: 10, color: P.inkSoft }}>their followers</div>
                <div style={{ fontSize: 9, color: P.inkFaint, marginTop: 7, paddingTop: 7, borderTop: `1px solid ${P.borderLight}`, fontFamily: F.mono }}>{card.since}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected card detail */}
      {selectedIdx !== null && cards[selectedIdx] && (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '13px 14px', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${cards[selectedIdx].color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: cards[selectedIdx].color, fontFamily: F.display }}>{cards[selectedIdx].avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{cards[selectedIdx].handle}</div>
              <div style={{ fontSize: 10, color: P.inkSoft }}>{cards[selectedIdx].platform} · {cards[selectedIdx].since}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{fmtNum(cards[selectedIdx].followers)}</div>
              <div style={{ fontSize: 9, color: P.inkSoft }}>their followers</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.7, background: P.white, borderRadius: 9, padding: '9px 11px' }}>
            <span style={{ fontWeight: 600, color: P.ink }}>{cards[selectedIdx].handle}</span> ({fmtNum(cards[selectedIdx].followers)} followers on {cards[selectedIdx].platform}) followed <span style={{ fontWeight: 600, color: P.ink }}>{cards[selectedIdx].followedAccount ?? '@macroswitmatt'}</span> on <span style={{ fontWeight: 600, color: P.ink }}>{cards[selectedIdx].followedPlatform ?? 'TikTok'}</span> {periodLabels[period]}. Highest-value organic signal for this period — a mention or collab reaches their full audience.
          </div>
        </div>
      )}
    </div>
  );
};


const REACH_DATA = [12, 18, 14, 22, 19, 28, 31, 26, 38, 42, 35, 51, 48, 63, 71, 58, 82, 94, 87, 110, 103, 128, 141, 163];

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
// ── NEW CLIENT PANEL ───────────────────────────────────────────────────────
const NewClientPanel = () => {
  const [clientId, setClientId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const id = clientId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id) return;
    const link = `${window.location.origin}/connect/invite?invite=${id}`;
    setGeneratedLink(link);
    setCopied(false);
  };

  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    } else {
      const el = document.createElement('textarea');
      el.value = generatedLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '16px' }}>
      <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 14 }}>
        Enter a client ID to generate their invite link. They open it on their phone, connect accounts, and their tab appears automatically.
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={clientId}
          onChange={e => { setClientId(e.target.value); setGeneratedLink(''); }}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="e.g. sarah or la-birria-co"
          style={{ flex: 1, border: `1px solid ${P.border}`, borderRadius: 9, padding: '10px 12px', fontSize: 12, fontFamily: F.mono, background: P.white, color: P.ink, outline: 'none' }}
        />
        <button onClick={generate}
          style={{ background: P.ink, border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: P.white, fontFamily: F.body, whiteSpace: 'nowrap' }}>
          Generate
        </button>
      </div>

      {generatedLink && (
        <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 11, padding: '12px 14px' }}>
          <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>✓ Link ready — send this to your client</div>
          <div style={{ fontSize: 11, color: P.ink, fontFamily: F.mono, wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 10, background: P.white, borderRadius: 7, padding: '8px 10px', border: `1px solid ${P.border}` }}>
            {generatedLink}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copy}
              style={{ flex: 1, background: copied ? P.sageDeep : P.white, border: `1px solid ${copied ? P.sageDeep : P.border}`, borderRadius: 9, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: copied ? P.white : P.ink, fontFamily: F.body, transition: 'all 0.2s' }}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
            <a href={generatedLink} target="_blank" rel="noreferrer"
              style={{ flex: 1, background: P.white, border: `1px solid ${P.border}`, borderRadius: 9, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: P.ink, fontFamily: F.body, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              Preview →
            </a>
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono, lineHeight: 1.6, marginTop: 10 }}>
        Colors auto-assigned · Works for any client name · Link never expires
      </div>
    </div>
  );
};


// ── REVENUE TAB ────────────────────────────────────────────────────────────
const RevenueTab = () => {
  const [period, setPeriod] = useState('month');
  const [revenueType, setRevenueType] = useState<'gross' | 'net'>('gross');
  const [clientView, setClientView] = useState('all');
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [billedAmount, setBilledAmount] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('billed_amount') ?? '0');
    return 0;
  });
  const [activeClients, setActiveClients] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('active_clients') ?? '0');
    return 0;
  });

  useEffect(() => {
    fetch('/api/sync/instagram')
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setConnectedAccounts([{ platform: 'instagram', username: d.profile.username, active: true }]);
        }
        setLoadingAccounts(false);
      })
      .catch(() => setLoadingAccounts(false));
  }, []);

  const isConnected = (platform: string) => connectedAccounts.some(a => a.platform === platform && a.active);
  const monthlyTarget = 5000;
  const progressPct = Math.min(100, (billedAmount / monthlyTarget) * 100);
  const periodLabels: Record<string, string> = { day: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' };

  const creatorStreams = [
    { name: 'TikTok Gifts & Diamonds', icon: '💎', platform: 'tiktok', description: 'Live stream gifts converted to diamonds.', color: P.sage, colorSoft: P.sageSoft },
    { name: 'TikTok Creator Fund', icon: '🎵', platform: 'tiktok', description: 'Per-view earnings from TikTok Creator Rewards.', color: P.sage, colorSoft: P.sageSoft },
    { name: 'Instagram Badges', icon: '❤️', platform: 'instagram', description: 'Live badges from Instagram followers during live streams.', color: P.rose, colorSoft: P.roseSoft },
    { name: 'AdSense / YouTube', icon: '▶️', platform: 'youtube', description: 'Ad revenue from YouTube monetization.', color: P.butter, colorSoft: P.butterSoft },
    { name: 'Brand Deals', icon: '🤝', platform: 'manual', description: 'Log brand deal payments manually.', color: P.lavender, colorSoft: P.lavSoft },
    { name: 'Affiliate & Links', icon: '🔗', platform: 'manual', description: 'Affiliate commissions and link revenue.', color: P.sky, colorSoft: P.skySoft },
  ];

  const allClients = ['all', ...CLIENTS.map((c: any) => c.id)];

  return (
    <div>
      {/* Client switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {allClients.map(cid => {
          const client = CLIENTS.find((c: any) => c.id === cid);
          const isActive = clientView === cid;
          return (
            <button key={cid} onClick={() => setClientView(cid)}
              style={{ background: isActive ? (client?.colorDeep ?? P.ink) : P.card, color: isActive ? P.white : P.inkSoft, border: `1px solid ${isActive ? (client?.colorDeep ?? P.ink) : P.border}`, borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {cid === 'all' ? 'All Clients' : client?.name ?? cid}
            </button>
          );
        })}
      </div>

      {/* Period + gross/net switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {['day', 'week', 'month', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ background: period === p ? P.ink : 'none', color: period === p ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {(['gross', 'net'] as const).map(t => (
            <button key={t} onClick={() => setRevenueType(t)}
              style={{ background: revenueType === t ? P.ink : 'none', color: revenueType === t ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, textTransform: 'uppercase', transition: 'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Agency Revenue */}
      {(clientView === 'all' || clientView === 'mason') && (
        <div style={{ background: P.dark, borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono, marginBottom: 14 }}>
            ✦ Agency Revenue · Maison Adari · {periodLabels[period]}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9, marginBottom: 14 }}>
            {[
              { label: 'Billed ' + periodLabels[period], val: '$' + (period === 'year' ? (billedAmount * 12).toLocaleString() : period === 'week' ? Math.round(billedAmount / 4).toLocaleString() : period === 'day' ? Math.round(billedAmount / 30).toLocaleString() : billedAmount.toLocaleString()), sub: activeClients + ' active client' + (activeClients !== 1 ? 's' : ''), color: P.sage },
              { label: 'Pipeline', val: '$2,400', sub: '4 prospects identified', color: P.lavender },
              { label: 'Projected (1 Client)', val: '$800/mo', sub: 'Standard AFE rate', color: P.butter },
              { label: 'Monthly Target', val: '$5,000', sub: '6 clients @ $800', color: P.rose },
            ].map((s, i) => (
              <div key={i} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 12, padding: '13px', borderTop: `2px solid ${s.color}` }}>
                <div style={{ fontSize: 9, color: P.darkMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: F.mono, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{s.val}</div>
                <div style={{ fontSize: 10, color: P.darkMuted, marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>Progress to $5,000/mo</div>
              <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>{progressPct.toFixed(0)}%</div>
            </div>
            <div style={{ background: P.darkBorder, borderRadius: 99, height: 8 }}>
              <div style={{ background: P.sage, height: 8, width: progressPct + '%', borderRadius: 99, transition: 'width 0.8s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>Billed $</div>
            <input type="text" inputMode="numeric" defaultValue={String(billedAmount)}
              onBlur={e => { const v = parseInt((e.target as HTMLInputElement).value.replace(/,/g, '')); if (!isNaN(v) && v >= 0) { setBilledAmount(v); localStorage.setItem('billed_amount', String(v)); } }}
              onKeyDown={(e: any) => { if (e.key === 'Enter') e.target.blur(); }}
              style={{ width: 80, background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 7, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, color: P.darkText, textAlign: 'right', outline: 'none' }} />
            <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>Active clients</div>
            <input type="text" inputMode="numeric" defaultValue={String(activeClients)}
              onBlur={e => { const v = parseInt((e.target as HTMLInputElement).value); if (!isNaN(v) && v >= 0) { setActiveClients(v); localStorage.setItem('active_clients', String(v)); } }}
              onKeyDown={(e: any) => { if (e.key === 'Enter') e.target.blur(); }}
              style={{ width: 40, background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 7, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, color: P.darkText, textAlign: 'right', outline: 'none' }} />
          </div>
          <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 10, fontStyle: 'italic' }}>First client unlocks the flywheel. Everything after is momentum.</div>
        </div>
      )}

      {/* Creator Revenue Streams */}
      <SH children="Creator Revenue Streams" sub={loadingAccounts ? 'Checking connections...' : connectedAccounts.length + ' account' + (connectedAccounts.length !== 1 ? 's' : '') + ' connected'} />
      {creatorStreams.map((stream, i) => {
        const connected = stream.platform !== 'manual' && isConnected(stream.platform);
        return (
          <div key={i} style={{ background: P.white, border: `1px solid ${connected ? stream.color : P.border}`, borderLeft: `3px solid ${stream.color}`, borderRadius: 13, padding: '13px 15px', marginBottom: 9 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: stream.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{stream.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, fontFamily: F.display }}>{stream.name}</div>
                  {connected && <span style={{ fontSize: 9, color: P.sageDeep, background: P.sageSoft, borderRadius: 20, padding: '2px 7px', fontFamily: F.mono, fontWeight: 600 }}>LIVE ✓</span>}
                  {!connected && stream.platform !== 'manual' && <span style={{ fontSize: 9, color: P.inkFaint, background: P.card, borderRadius: 20, padding: '2px 7px', fontFamily: F.mono }}>not connected</span>}
                </div>
                <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>{stream.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: connected ? P.ink : P.inkFaint }}>
                    {connected ? '$0.00' : '—'}
                  </div>
                  {!connected && stream.platform !== 'manual' && (
                    <a href={'/connect/invite?invite=' + (clientView === 'all' ? 'mason' : clientView)}
                      style={{ background: stream.colorSoft, border: `1px solid ${stream.color}`, borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 600, color: P.ink, textDecoration: 'none', fontFamily: F.mono }}>
                      Connect →
                    </a>
                  )}
                  {stream.platform === 'manual' && (
                    <input type="text" inputMode="numeric" placeholder="$0"
                      style={{ width: 70, border: `1px solid ${P.border}`, borderRadius: 7, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right', outline: 'none' }} />
                  )}
                </div>
                <div style={{ fontSize: 9, color: connected ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginTop: 4 }}>
                  {connected ? 'Tracking live · ' : stream.platform === 'manual' ? 'Manual entry · ' : 'Connect to track · '}{periodLabels[period].toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Pricing Tiers */}
      {(clientView === 'all' || clientView === 'mason') && (
        <>
          <SH>Agency Pricing Tiers</SH>
          {[
            { tier: 'Starter', price: '$500/mo', desc: '2 posts/week, monthly report, basic analytics', color: P.sage },
            { tier: 'Growth', price: '$800/mo', desc: '4 posts/week, weekly report, competitor analysis, hook strategy', color: P.lavender },
            { tier: 'Pro', price: '$1,200/mo', desc: 'Daily content, live dashboard access, creator DM agent, full AFE deployment', color: P.rose },
          ].map((t, i) => (
            <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 13, padding: '13px 15px', marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{t.tier}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{t.price}</div>
              </div>
              <div style={{ fontSize: 12, color: P.inkMid }}>{t.desc}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};


export default function AdariCommandCenter() {
  const [view, setView] = useState('overview');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [today, setToday] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
  useEffect(() => {
    const d = setInterval(() => setToday(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })), 60000);
    return () => clearInterval(d);
  }, []);
  const [igData, setIgData] = useState<any>(null);
  const [igLoading, setIgLoading] = useState(true);
  const [igGoal, setIgGoal] = useState<number>(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('ig_goal') ?? '10000');
    return 10000;
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchIG = () => fetch('/api/sync/instagram').then(r => r.json()).then(d => { setIgData(d); setIgLoading(false); }).catch(() => setIgLoading(false));
    fetchIG();
    const iv = setInterval(fetchIG, 300000); // refresh every 5 min client-side
    return () => clearInterval(iv);
  }, []);

  const handleSetIgGoal = (v: number) => {
    setIgGoal(v);
    localStorage.setItem('ig_goal', String(v));
  };

  const igMetrics = igData?.metrics;
  const igProfile = igData?.profile;

  // Combined platform totals (expands as more accounts connect)
  const totalFollowers = (igMetrics?.followers ?? 0);
  const totalReach = igMetrics?.reach ?? '—';
  const totalEngagement = igMetrics ? igMetrics.engagementRate.toFixed(1) + '%' : '—';
  const combinedContentScore = igMetrics?.contentScore ?? 0;

  const activeClient = CLIENTS.find(c => view === `client:${c.id}`);

  const TABS: { id: string; label: string; color?: string; avatar?: string }[] = [
    { id: 'overview', label: 'Overview' },
    ...CLIENTS.map(c => ({ id: `client:${c.id}`, label: c.name, color: c.color, avatar: c.avatar })),
    { id: 'globe', label: '🌍 Globe' },
    { id: 'live', label: '🔴 Live' },
    { id: 'spots', label: '📍 Spots' },
    { id: 'trends', label: '📈 Trends' },
    { id: 'compete', label: '🥊 Competitors' },
    { id: 'prospects', label: '🍽 Prospects' },
    { id: 'revenue', label: '💰 Revenue' },
    { id: 'engine', label: '⚙️ AFE' },
    { id: 'settings', label: '⚙ Clients' },
  ];

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', color: P.ink, fontFamily: F.body, paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* HEADER — liquid glass iOS 26 */}
      <div className="liquid-glass" style={{ borderRadius: 0, padding: '14px 18px 0', position: 'sticky', top: 0, zIndex: 20, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: P.inkFaint, fontFamily: F.mono }}>Maison Adari · The AFE</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: F.display, color: P.ink, letterSpacing: '-0.03em', lineHeight: 1.1, background: `linear-gradient(135deg, ${P.ink} 0%, ${P.lavDeep} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Command Center</div>
          </div>
          <div style={{ textAlign: 'right', paddingTop: 2 }}>
            <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: F.mono }}>{time}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 4 }}>
              <LiveDot color={P.sageDeep} />
              <span style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono, letterSpacing: '0.12em', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
        </div>
        <div className="scroll-fade" style={{ display: 'flex', gap: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {TABS.map(tab => {
            const active = view === tab.id;
            const accentColor = (tab as any).color || P.lavDeep;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                className="tab-btn"
                style={{
                  background: 'none', border: 'none',
                  borderBottom: active ? `2.5px solid ${accentColor}` : '2.5px solid transparent',
                  padding: '8px 11px',
                  color: active ? P.ink : P.inkSoft,
                  fontSize: 12, fontWeight: active ? 700 : 400,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F.body,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                {tab.avatar && (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: accentColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: P.white, boxShadow: active ? `0 2px 8px ${accentColor}50` : 'none', transition: `box-shadow 0.2s ${smooth}` }}>{tab.avatar}</span>
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '18px 16px' }}>

        {/* OVERVIEW */}
        {view === 'overview' && (
          <OverviewTab
            igMetrics={igMetrics}
            igLoading={igLoading}
            igGoal={igGoal}
            handleSetIgGoal={handleSetIgGoal}
            today={today}
          />
        )}

        {/* CLIENT VIEWS */}
        {activeClient && (
          <DynamicClientView
            client={activeClient}
            igData={activeClient.id === 'mason' ? igData : null}
            igGoal={igGoal}
            setIgGoal={handleSetIgGoal}
          />
        )}

        {view === 'globe' && <GlobeFeed />}
        {view === 'live' && <LiveStudio />}
        {view === 'spots' && <ReturnToSpot />}

        {/* TRENDS */}
        {/* TRENDS */}
        {view === 'trends' && (
          <div>
            <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.sageDeep, fontFamily: F.mono, marginBottom: 6 }}>Trend Radar · SoCal Food · Before the Hype</div>
              <p style={{ fontSize: 12, color: P.sageDeep, lineHeight: 1.65, margin: 0 }}>These are rising before they hit mainstream. Film these first and you own the SEO before the crowds arrive.</p>
            </div>
            <SH>TikTok Search — Rising Fast</SH>
            {[
              { rank: 1, name: 'Korean BBQ Tacos LA', meta: 'TikTok Search · +840% this week · SoCal geo', tag: '🔥 Film now', tagColor: P.sageDeep, tagBg: P.sageSoft },
              { rank: 2, name: 'Birria Ramen Fusion', meta: 'TikTok + IG · +620% · Under the radar', tag: '🔥 Film now', tagColor: P.sageDeep, tagBg: P.sageSoft },
              { rank: 3, name: 'LA Smash Burger hidden gem', meta: 'Google Trends · +410% · Accelerating', tag: '↑ Rising', tagColor: P.butterDeep, tagBg: P.butterSoft },
              { rank: 4, name: 'Thai Tea Ice Cream rolls', meta: 'TikTok FYP · +290% · Just cresting', tag: '↑ Rising', tagColor: P.butterDeep, tagBg: P.butterSoft },
              { rank: 5, name: 'Wagyu Beef Dumplings', meta: 'IG Explore · +180% · Building momentum', tag: '👁 Watch', tagColor: P.skyDeep, tagBg: P.skySoft },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.inkFaint, width: 22, fontFamily: F.mono }}>{t.rank}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <Tag color={t.tagColor} bg={t.tagBg}>{t.tag}</Tag>
              </div>
            ))}
            <SH>Google Trends · Food &amp; Drink · California</SH>
            {[
              { q: 'Best birria near me', meta: 'Google Search · past 7 days · LA+OC', pct: '+890%' },
              { q: 'Torrance ramen restaurant', meta: 'Google Search · past 7 days · South Bay', pct: '+340%' },
              { q: 'matcha dessert Los Angeles', meta: 'Google Search · stable trending', pct: '+120%' },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: P.ink }}>{t.q}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <div style={{ fontSize: 12, color: P.sageDeep, fontWeight: 700 }}>{t.pct}</div>
              </div>
            ))}
          </div>
        )}

        {/* COMPETITORS */}
        {view === 'compete' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>Competitor Intelligence</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65, margin: 0 }}>{"Don't copy them. Transform their hooks, topics, and angles into your niche. Compete with them, not against them — and when the time is right, collab."}</p>
            </div>
            {[
              {
                name: 'LAtryGuy', handle: '@latryguy · 960K YouTube · 287K IG', avatarBg: P.sageSoft, avatarColor: P.sageDeep, initials: 'LA',
                hooks: ["'Best [food] in South LA'", "'Hidden gem in [city]'", "'Nobody talks about this spot'"],
                comments: [
                  { text: 'You should cover the Korean BBQ taco spot on Olympic — been asking for months', likes: 341, note: 'opportunity alert' },
                  { text: "What's the best fried chicken in Inglewood? Cover that next", likes: 218, note: 'unserved demand' },
                ],
                play: "LAtryGuy is LA-wide. Matt is hyperlocal South Bay + OC. Own that lane. Their audience is asking for spots outside their usual radius — you're already there.",
                collab: 'Collab ready?', color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
              },
              {
                name: "Jack's Dining Room", handle: '@jacksdiningroom · 2.3M TikTok · 3M IG', avatarBg: P.roseSoft, avatarColor: P.roseDeep, initials: 'JD',
                hooks: ["'This place did 200+ sandwiches after my video'", "'The restaurant that opened 8 locations'"],
                filming: [
                  { name: 'NYC Korean fried chicken', meta: 'Posted 2 days ago · 1.2M views' },
                  { name: 'Hidden dumpling spot, Flushing', meta: 'Posted 5 days ago · 880K views' },
                ],
                play: 'Jack does NYC. You do SoCal. Same energy, different coast. His Korean fried chicken video is at 1.2M — film the best Korean fried chicken in Torrance or OC this week and ride the algorithm wave he just created.',
                collab: 'Dream collab', color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
              },
              {
                name: 'Gareth Eats', handle: '@garetheats · 750K YouTube · San Diego', avatarBg: P.butterSoft, avatarColor: P.butterDeep, initials: 'GE',
                play: "Gareth owns San Diego. You own South Bay and OC. The overlap is the 405 corridor — film a joint 'LA vs SD [food]' video. Pitch: 'Same food, different county — who wins?'",
                collab: 'SD collab opp', color: P.butter, colorSoft: P.butterSoft, colorDeep: P.butterDeep,
              },
            ].map((comp: any, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, padding: '16px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: comp.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: comp.avatarColor, flexShrink: 0 }}>{comp.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display }}>{comp.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft }}>{comp.handle}</div>
                  </div>
                  <Tag color={comp.colorDeep} bg={comp.colorSoft}>{comp.collab}</Tag>
                </div>
                {comp.hooks && (
                  <>
                    <SH>Their Hooks — Transform for Your Niche</SH>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
                      {comp.hooks.map((h: string, j: number) => <Tag key={j} color={comp.colorDeep} bg={comp.colorSoft}>{h}</Tag>)}
                    </div>
                  </>
                )}
                {comp.comments && (
                  <>
                    <SH>Demand in Their Comments — Your Opportunity</SH>
                    {comp.comments.map((c: any, j: number) => (
                      <div key={j} style={{ background: comp.colorSoft, borderRadius: 10, padding: '10px 12px', marginBottom: 7 }}>
                        <div style={{ fontSize: 12, color: P.inkMid, fontStyle: 'italic' }}>"{c.text}"</div>
                        <div style={{ fontSize: 10, color: comp.colorDeep, marginTop: 5 }}>♥ {c.likes} · {c.note}</div>
                      </div>
                    ))}
                  </>
                )}
                {comp.filming && (
                  <>
                    <SH>What They're Filming This Week</SH>
                    {comp.filming.map((f: any, j: number) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: j < comp.filming.length - 1 ? `1px solid ${P.borderLight}` : 'none' }}>
                        <div style={{ fontSize: 12, color: P.ink }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: P.sageDeep }}>{f.meta}</div>
                      </div>
                    ))}
                  </>
                )}
                <AIInsight text={comp.play} platform={comp.name} />
              </div>
            ))}
          </div>
        )}

        {/* PROSPECTS */}
        {view === 'prospects' && (
          <div>
            <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.butterDeep, fontFamily: F.mono, marginBottom: 6 }}>Burner Account · Active · SoCal</div>
              <p style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.75, margin: 0 }}>Monitoring 47 accounts in LA, OC, and San Diego. 4 high-priority prospects surfaced this week — sorted by Heat Score.</p>
            </div>
            {[...PROSPECTS].sort((a: any, b: any) => b.heat - a.heat).map((p: any, i: number) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${p.color}`, borderRadius: 14, padding: '15px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>{p.handle} · {p.followers} followers · {p.lastPost}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 4 }}>Heat Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: F.display, color: p.color }}>{p.heat}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 4 }}>Food Quality</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.foodScore} max={10} color={P.sageDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.sageDeep, fontFamily: F.display }}>{p.foodScore}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 4 }}>Social Presence</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.socialScore} max={10} color={P.roseDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.roseDeep, fontFamily: F.display }}>{p.socialScore}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 12 }}>{p.note}</div>
                <button style={{ background: p.colorSoft, border: `1px solid ${p.color}`, borderRadius: 20, padding: '8px 18px', color: P.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>Reach Out via Maison Adari →</button>
              </div>
            ))}
          </div>
        )}

        {/* REVENUE */}
        {view === 'revenue' && (
          <RevenueTab />
        )}

        {/* AFE ENGINE */}

        {/* CLIENT MANAGEMENT */}
        {view === 'settings' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>Client Management</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65, margin: 0 }}>Manage clients on the dashboard. Each client gets their own tab and invite link.</p>
            </div>

            {/* Existing clients */}
            <SH>Active Clients</SH>
            {CLIENTS.map((client, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: client.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: client.colorDeep, fontFamily: F.display, flexShrink: 0 }}>{client.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: P.inkSoft }}>{client.role}</div>
                  <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono, marginTop: 3 }}>
                    {client.accounts.length} account{client.accounts.length !== 1 ? 's' : ''} · {client.accounts.filter((a: any) => !a.notConnected).length} connected
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/connect/invite?invite=${client.id}`;
                      navigator.clipboard.writeText(link).then(() => alert('Invite link copied! Send this to ' + client.name));
                    }}
                    style={{ background: client.colorSoft, border: `1px solid ${client.color}`, borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: client.colorDeep, fontFamily: F.mono, whiteSpace: 'nowrap' }}>
                    Copy Invite Link
                  </button>
                  <button
                    onClick={() => setView(`client:${client.id}`)}
                    style={{ background: 'none', border: `1px solid ${P.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: P.inkSoft, fontFamily: F.mono, whiteSpace: 'nowrap' }}>
                    View Tab →
                  </button>
                </div>
              </div>
            ))}

            {/* Add new client */}
            <SH>Add New Client</SH>
            <NewClientPanel />

            {/* Quick Links */}
            <SH>Quick Links</SH>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              <a href="/connect" target="_blank" rel="noreferrer"
                style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: P.ink, marginBottom: 3 }}>Connect Page</div>
                <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>Generic connect page for any client</div>
              </a>
              <button
                onClick={() => {
                  fetch('/api/cron/refresh-token', { headers: { 'Authorization': 'Bearer maison-adari-cron-2026' } })
                    .then(r => r.json())
                    .then(d => alert('Refresh done! Refreshed: ' + (d.refreshed ?? 0) + ' Skipped: ' + (d.skipped ?? 0)))
                    .catch(() => alert('Refresh triggered.'));
                }}
                style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: P.ink, marginBottom: 3 }}>Refresh All Tokens</div>
                <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>Runs every Sunday · tap to force now</div>
              </button>
            </div>
          </div>
        )}

        {view === 'engine' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 18, padding: '18px 20px', marginBottom: 22 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 8 }}>The Adari Food Engine</div>
              <div style={{ fontSize: 15, fontFamily: F.display, color: P.ink, lineHeight: 1.75, fontStyle: 'italic' }}>{"We don't post content. We engineer virality. Every frame, hook, and caption is built to make the food so compelling it forces the viewer to act — visit, share, or remember."}</div>
            </div>
            {[
              { step: '01', label: 'Identify', desc: 'Burner account surfaces restaurants with exceptional food and underdeveloped social. We find the gap before someone else does.', color: P.lavender, colorDeep: P.lavDeep },
              { step: '02', label: 'Outreach', desc: 'Value-first cold call + tailored DM. We lead with what we see, not what we sell.', color: P.rose, colorDeep: P.roseDeep },
              { step: '03', label: 'Analyze', desc: 'Apify scrapes top hooks in their niche. We identify psychology triggers, content gaps, and exactly where the algorithm is rewarding.', color: P.peach, colorDeep: P.peachDeep },
              { step: '04', label: 'Execute', desc: 'Weekly short-form content built purely off data. Nothing random, nothing guessed.', color: P.sage, colorDeep: P.sageDeep },
              { step: '05', label: 'Report', desc: 'Live dashboard showing client growth, winners, top comments, and milestone tracking updated every 24 hours.', color: P.butter, colorDeep: P.butterDeep },
              { step: '06', label: 'Scale', desc: "Creator DM agent handles inbound, qualifies by niche + follower count, and books slots to the client's calendar automatically.", color: P.sky, colorDeep: P.skyDeep },
            ].map((s: any, i) => (
              <div key={s.step} style={{ display: 'flex', gap: 13, marginBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: F.mono, color: P.ink, fontWeight: 500, flexShrink: 0 }}>{s.step}</div>
                  {i < 5 && <div style={{ width: 2, flex: 1, background: P.borderLight, marginTop: 4, minHeight: 16 }} />}
                </div>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: '13px 15px', flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.colorDeep, fontFamily: F.display, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
            <SH children="Agent Ideas to Build" sub="What Maison Adari should deploy next" />
            {[
              { title: 'Creator DM Agent', desc: 'Monitors incoming DMs, checks follower count + niche fit, auto-responds with rate card and dates. Books to calendar.', tag: 'High Value', color: P.sage },
              { title: 'Menu Drop Scheduler', desc: "When a restaurant drops a new item, generates 3 hook variations, selects the data-winner, and queues for posting.", tag: 'Time-Saving', color: P.lavender },
              { title: 'Review Aggregator', desc: "Pulls Yelp + Google reviews weekly, surfaces best quotes for captions, flags negative sentiment before it's a PR issue.", tag: 'Reputation', color: P.butter },
              { title: 'Missed Call VAPI Agent', desc: "Answers calls when the owner can't. Takes orders, answers hours/location, logs everything to a daily digest.", tag: 'Revenue', color: P.rose },
              { title: 'Hook A/B Tester', desc: 'Posts two versions with different hooks, tracks reach in the first 2 hours, boosts the winner automatically.', tag: 'Growth', color: P.sky },
            ].map((idea: any, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `3px solid ${idea.color}`, borderRadius: 13, padding: '13px 15px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{idea.title}</div>
                  <Tag color={idea.color} bg={`${idea.color}25`}>{idea.tag}</Tag>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{idea.desc}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
