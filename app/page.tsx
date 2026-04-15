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
};

const F = {
  display: "'Fraunces', serif",
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

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
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={P.borderLight} strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
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
  <span style={{ background: bg, color, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', display: 'inline-block', fontFamily: F.mono }}>{children}</span>
);

// ── LIVE DOT ───────────────────────────────────────────────────────────────
const LiveDot = ({ color = P.sageDeep }: { color?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 0 2px ${color}30`, display: 'inline-block' }} />
  </span>
);

// ── SECTION HEADER ─────────────────────────────────────────────────────────
const SH = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div style={{ marginTop: 22, marginBottom: 10 }}>
    <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.inkFaint, fontFamily: F.mono }}>{children}</div>
    {sub && <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>{sub}</div>}
  </div>
);

// ── STAT CARD ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, live, children }: {
  label: string; value?: string; sub?: string; accent: string; live?: boolean; children?: React.ReactNode;
}) => (
  <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 15px', borderTop: `2.5px solid ${accent}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
      <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, flex: 1 }}>{label}</div>
      {live && <LiveDot color={P.sageDeep} />}
    </div>
    {value && <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{value}</div>}
    {sub && <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 3 }}>{sub}</div>}
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
    <div style={{ background: colorSoft, border: `1px solid ${color}40`, borderRadius: 13, padding: '14px 15px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: P.ink, fontFamily: F.body }}>{label}</div>
        {onGoalChange ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: P.inkSoft }}>Goal:</span>
            <input type="number" value={goal}
              onChange={e => { const v = parseInt(e.target.value); if (v > 0) onGoalChange(v); }}
              style={{ width: 72, border: `1px solid ${color}60`, borderRadius: 6, padding: '3px 7px', fontSize: 11, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right' }}
            />
          </div>
        ) : (
          <div style={{ fontSize: 11, color: P.inkSoft, fontFamily: F.mono }}>{current.toLocaleString()} / {goal.toLocaleString()}</div>
        )}
      </div>
      {onGoalChange && (
        <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 6, fontFamily: F.mono }}>{current.toLocaleString()} / {goal.toLocaleString()}</div>
      )}
      <div style={{ background: `${color}25`, borderRadius: 99, height: 7, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ background: color, height: 7, width: `${pct}%`, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: F.mono }}>{paceLabel}</div>
        <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>Est. {estDate}</div>
      </div>
    </div>
  );
};

// ── POST CARD ──────────────────────────────────────────────────────────────
const PostCard = ({ post, accent, accentSoft, accentDeep }: { post: any; accent: string; accentSoft: string; accentDeep: string }) => {
  const ICONS: Record<string, string> = { VIDEO: '🎬', REEL: '🎬', CAROUSEL_ALBUM: '🖼️', IMAGE: '📸' };
  const maxVal = Math.max(post.like_count ?? 0, (post.saves ?? 0) * 3, (post.comments_count ?? 0) * 15);
  return (
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, overflow: 'hidden', marginBottom: 8 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 64, background: accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, borderRight: `1px solid ${P.border}` }}>
          {ICONS[post.media_type] ?? '📱'}
        </div>
        <div style={{ flex: 1, padding: '10px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: P.ink, lineHeight: 1.4, marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
  <div style={{ background: P.dark, borderRadius: 14, padding: '16px 18px', marginTop: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, background: P.lavSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✦</div>
      <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono }}>AI Insight · {platform}</div>
    </div>
    <div style={{ fontSize: 13, color: P.darkText, lineHeight: 1.8, fontFamily: F.display, fontStyle: 'italic' }}>{text}</div>
  </div>
);

// ── WHAT'S WORKING ─────────────────────────────────────────────────────────
const WW = ({ working, flopping }: { working: string; flopping: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
    <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 11, padding: '12px' }}>
      <div style={{ fontSize: 9, color: P.sageDeep, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: F.mono, marginBottom: 6 }}>✓ Working</div>
      <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.7 }}>{working}</div>
    </div>
    <div style={{ background: P.roseSoft, border: `1px solid ${P.rose}`, borderRadius: 11, padding: '12px' }}>
      <div style={{ fontSize: 9, color: P.roseDeep, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: F.mono, marginBottom: 6 }}>✗ Flopping</div>
      <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.7 }}>{flopping}</div>
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
        followers: 370, followerDelta: '+0', reach: 56, engagement: '0%',
        color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
        insight: 'Your account is connected and live. Post consistently to generate engagement data. Process reveals and contrarian takes on restaurant marketing tend to outperform lifestyle content 3–4× for agency operator accounts.',
        posts: [],
        topComments: [],
        working: 'Account connected. Start posting to see what works.',
        flopping: 'No posting history yet. Every day without content is a missed data point.',
      },
      {
        platform: 'TikTok', icon: '🎵', handle: '@masondoesnumbers',
        followers: 0, followerDelta: '+0', reach: 0, engagement: '—',
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
    contentScore: 94, totalFollowers: 53500, totalReach: '184K', engagement: '6.1%', weeklyGrowth: '+238',
    bestTimes: ['Mon 12–2pm', 'Thurs 7–9pm', 'Sat 10am–12pm'],
    primaryPlatform: 'tiktok',
    igGoalDefault: 100000,
    accounts: [
      {
        platform: 'TikTok', icon: '🎵', handle: '@macroswitmatt',
        followers: 48200, followerDelta: '+194', reach: 163000, engagement: '6.8%',
        color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
        milestones: [
          { label: 'Ramen video · 2 hrs', value: '4.1K views', delta: 'fastest start ever' },
          { label: 'Ramen video · 5 hrs', value: '9.1K views', delta: 'top 10% velocity' },
          { label: 'Ramen video · 10 hrs', value: '18.2K views', delta: 'algorithm push confirmed' },
          { label: 'Ramen video · 18 hrs', value: '41K views 🔥', delta: 'all-time top 5' },
          { label: 'Best comment · 18 hrs', value: '1,240 ♥', delta: 'strongest comment ever' },
        ],
        insight: 'Negation hook is your strongest format — averaging 35K+ views. Pure food footage outperforms vlog filler 2.4×. Priority: batch 5 more negation hook videos against well-known chains. Zero talking, zero intro — pure food in the first 3 seconds.',
        posts: [
          { id: '1', caption: 'BEST Ramen in LA (not Daikokuya)', like_count: 41200, comments_count: 892, media_type: 'VIDEO', perf: 'hot', hook: 'Negation hook', hours: 18 },
          { id: '2', caption: 'This birria spot literally changed my life fr', like_count: 28400, comments_count: 634, media_type: 'VIDEO', perf: 'hot', hook: 'Hyperbole', hours: 72 },
          { id: '3', caption: 'Underrated sushi in Torrance nobody talks about', like_count: 9800, comments_count: 201, media_type: 'VIDEO', perf: 'neutral', hook: 'Secret framing', hours: 120 },
        ],
        topComments: [
          { user: '@hungryinsocal', text: "I went here because of this video and it was EXACTLY like you said omg I'm obsessed", likes: 1240, platform: 'TikTok' },
          { user: '@foodieLA_tiff', text: 'the way you filmed the broth had me physically running to my car', likes: 876, platform: 'TikTok' },
          { user: '@ramenlover99', text: "what bowl was that at the end?? I need the name or I'm losing sleep", likes: 412, platform: 'TikTok' },
        ],
        working: "'Best X in [City]' negation hooks averaging 35K+ views. Pure food footage 2.4× better watch time.",
        flopping: 'Vlog filler and parking lot footage kills watch time. Cut anything before the food.',
      },
      {
        platform: 'Instagram', icon: '📸', handle: '@macroswitmatt',
        followers: 5300, followerDelta: '+44', reach: 21000, engagement: '4.4%',
        color: P.peach, colorSoft: P.peachSoft, colorDeep: P.peachDeep,
        insight: 'Cross-posting proven TikTok content to IG Reels generates 35–50% secondary reach on content that already proved itself. Your IG audience shows stronger buyer intent signals than TikTok — lean into saves-focused content.',
        posts: [
          { id: '4', caption: 'BEST Ramen in LA 🍜 (full video on TikTok)', like_count: 3800, comments_count: 120, media_type: 'REEL', perf: 'hot', hook: 'Cross-platform tease' },
          { id: '5', caption: 'Birria tacos that broke my brain and my diet', like_count: 2100, comments_count: 67, media_type: 'REEL', perf: 'hot', hook: 'Hyperbole pair' },
        ],
        topComments: [
          { user: '@la_foodie', text: 'I drive past this place every day and never went in. Going tomorrow morning.', likes: 234, platform: 'Instagram' },
        ],
        working: 'Cross-posting proven TikTok content gets 35–50% secondary reach with zero additional filming.',
        flopping: 'Static photos without text overlay getting minimal saves.',
      },
    ],
  },
];

// ── PIE CHART ─────────────────────────────────────────────────────────────
const PieChart = ({ slices, size = 80 }: { slices: { value: number; color: string; label: string }[]; size?: number }) => {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: P.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: P.inkFaint, textAlign: 'center', flexShrink: 0 }}>
      <span style={{ lineHeight: 1.3 }}>No<br/>data</span>
    </div>
  );
  let cumAngle = -90;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const paths = slices.map(sl => {
    if (sl.value === 0) return null;
    const startAngle = cumAngle;
    const angle = (sl.value / total) * 360;
    cumAngle += angle;
    const endAngle = cumAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pct = Math.round((sl.value / total) * 100);
    return { d: `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`, color: sl.color, label: sl.label, value: sl.value, pct };
  }).filter(Boolean);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {paths.map((p: any, i) => <path key={i} d={p.d} fill={p.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={r * 0.45} fill={P.white} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {paths.filter((p: any) => p.value > 0).map((p: any, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <div style={{ fontSize: 10, color: P.inkMid }}>{p.label}</div>
            <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>{p.pct}%</div>
          </div>
        ))}
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
const PersonCard = ({ name, avatar, color, colorSoft, colorDeep, accounts, contentScore, engagement, reach, liveMetrics, timePeriod, igGoal, setIgGoal, mattGoal, setMattGoal }: any) => {
  const [goalPlatform, setGoalPlatform] = useState('instagram');

  const totalFollowers = name === 'Mason' && liveMetrics
    ? liveMetrics.followers
    : accounts.reduce((s: number, a: any) => s + (a.followers ?? 0), 0);

  // Weekly delta from accounts
  const weeklyDelta = accounts.reduce((s: number, a: any) => {
    const d = parseInt((a.followerDelta ?? '+0').replace('+', '').replace(',', ''));
    return s + (isNaN(d) ? 0 : d);
  }, 0);

  const { value: deltaVal, label: deltaLabel } = applyTimePeriod(weeklyDelta, timePeriod);

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
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 15, padding: '15px', marginBottom: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: colorDeep, fontFamily: F.display, flexShrink: 0 }}>{avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{fmtNum(totalFollowers)}</span>
            <span style={{ fontSize: 11, color: deltaVal >= 0 ? P.sageDeep : P.roseDeep, fontWeight: 600 }}>{deltaVal >= 0 ? '↑' : '↓'} {deltaVal >= 0 ? '+' : ''}{fmtNum(Math.abs(deltaVal))}</span>
            <span style={{ fontSize: 10, color: P.inkFaint }}>{deltaLabel}</span>
          </div>
        </div>
        <Ring val={displayScore} color={colorDeep} size={44} />
      </div>

      {/* Follower source pie */}
      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${P.borderLight}` }}>
        <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Followers by Platform</div>
        <PieChart slices={pieSlices} size={76} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
        <div style={{ background: colorSoft, borderRadius: 9, padding: '9px 11px' }}>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Engagement</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{displayEngagement}</div>
          {name === 'Mason' && liveMetrics && <div style={{ fontSize: 9, color: P.sageDeep, marginTop: 2, fontFamily: F.mono }}>live ✓</div>}
          {name !== 'Mason' && <div style={{ fontSize: 9, color: P.inkFaint, marginTop: 2, fontFamily: F.mono }}>mock</div>}
        </div>
        <div style={{ background: colorSoft, borderRadius: 9, padding: '9px 11px' }}>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reach</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{totalReach}</div>
          {name === 'Mason' && liveMetrics && <div style={{ fontSize: 9, color: P.sageDeep, marginTop: 2, fontFamily: F.mono }}>derived ✓</div>}
          {name !== 'Mason' && <div style={{ fontSize: 9, color: P.inkFaint, marginTop: 2, fontFamily: F.mono }}>mock</div>}
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
            {goalPaceSource === 'historical_data' ? goalPace + ' ✓' : goalPaceSource === 'early_estimate' ? goalPace + ' (early)' : goalMonthly > 0 ? goalPace + ' (est.)' : 'Estimating...'}
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
  const [mattGoal, setMattGoal] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('matt_goal') ?? '100000');
    return 100000;
  });

  const handleSetMattGoal = (v: number) => {
    setMattGoal(v);
    if (typeof window !== 'undefined') localStorage.setItem('matt_goal', String(v));
  };

  const masonAccounts = [
    { platform: 'Instagram', followers: igMetrics?.followers ?? 370, followerDelta: '+0', reach: igMetrics?.reach ?? '56' },
    { platform: 'TikTok', followers: 0, followerDelta: '+0', reach: '0' },
  ];

  const mattAccounts = [
    { platform: 'TikTok', followers: 48200, followerDelta: '+194', reach: '163K' },
    { platform: 'Instagram', followers: 5300, followerDelta: '+44', reach: '21K' },
  ];

  // Combined totals
  const masonTotal = igMetrics?.followers ?? 370;
  const mattTotal = 48200 + 5300;
  const combinedTotal = masonTotal + mattTotal;
  const combinedWeeklyDelta = (igMetrics ? 0 : 0) + 194 + 44;

  // Top content — sorted by likes, best first
  const allContent = [
    { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'BEST Ramen in LA (not Daikokuya)', likes: 41200, color: P.sage },
    { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'This birria spot literally changed my life fr', likes: 28400, color: P.sage },
    { creator: 'Macros Wit Matt', platform: 'Instagram', caption: 'BEST Ramen in LA 🍜 (full video on TikTok)', likes: 3800, color: P.peach },
    { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'Underrated sushi in Torrance nobody talks about', likes: 9800, color: P.sage },
  ].sort((a, b) => b.likes - a.likes);

  return (
    <div>
      {/* Morning briefing */}
      <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 15, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>📰 Morning Briefing · {today}</div>
        <div style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.8, fontFamily: F.display, fontStyle: 'italic' }}>
          {igMetrics
            ? `Mason's Instagram live — ${fmtNum(igMetrics.followers)} followers, reach est. ${igMetrics.reach}. ${igMetrics.paceSource === 'historical_data' ? `Tracking ${igMetrics.pace} growth.` : 'Growth data building — pace sharpens over time.'} Matt's Ramen video at 41K views still leading this week. Korean BBQ tacos trending on TikTok Search in SoCal — nobody has filmed it yet.`
            : "Matt's Ramen video hit 41K views in 18 hours — best organic run of the year. Korean BBQ tacos trending on TikTok Search in SoCal — nobody has filmed it yet."
          }
        </div>
      </div>

      {/* Combined totals banner */}
      <div style={{ background: P.dark, borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Combined Followers</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{fmtNum(combinedTotal)}</div>
          <div style={{ fontSize: 10, color: P.sageDeep, marginTop: 2 }}>↑ +{fmtNum(combinedWeeklyDelta)} this wk</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Combined Reach</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>163K</div>
          <div style={{ fontSize: 10, color: P.inkFaint, marginTop: 2 }}>est. cross-platform</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Platforms</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>3</div>
          <div style={{ fontSize: 10, color: P.inkFaint, marginTop: 2 }}>IG · TikTok × 2</div>
        </div>
      </div>

      {/* Time period switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: P.inkSoft, fontFamily: F.mono, flexShrink: 0 }}>Growth period:</div>
        <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {TIME_PERIODS.map(tp => (
            <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
              style={{ background: timePeriod === tp.id ? P.ink : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
              {tp.label}
            </button>
          ))}
        </div>
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
      />
      <PersonCard
        name="Macros Wit Matt"
        avatar="B"
        color={P.sage}
        colorSoft={P.sageSoft}
        colorDeep={P.sageDeep}
        accounts={mattAccounts}
        contentScore={94}
        engagement="6.1%"
        reach="184K"
        liveMetrics={null}
        timePeriod={timePeriod}
        igGoal={mattGoal}
        setIgGoal={handleSetMattGoal}
        mattGoal={mattGoal}
        setMattGoal={handleSetMattGoal}
      />

      {/* Combined reach sparkline */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Combined Reach · Mason + Matt</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, marginTop: 2 }}>163K <span style={{ fontSize: 11, color: P.sageDeep, fontWeight: 400 }}>↑ 22% this week</span></div>
          </div>
          <Tag color={igMetrics ? P.sageDeep : P.inkFaint} bg={igMetrics ? P.sageSoft : P.card}>{igMetrics ? '🟢 IG Live' : 'partial data'}</Tag>
        </div>
        <Spark data={REACH_DATA} color={P.lavDeep} h={44} />
      </div>

      {/* Connect accounts */}
      <div style={{ background: P.dark, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Connect More Accounts</div>
        {[
          { label: "Matt's Instagram", handle: '@macroswitmat', icon: '📸', color: P.peach },
          { label: "Matt's TikTok", handle: '@macroswitmat', icon: '🎵', color: P.sage },
          { label: "Mason's TikTok", handle: '@masonadari', icon: '🎵', color: P.sky },
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

      {/* Top content — real sorted by performance */}
      <SH children="Top Content This Week" sub="Sorted by likes · best performing first" />
      {allContent.map((p, i) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 11, padding: '11px 13px', marginBottom: 7, display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: P.white, fontFamily: F.mono, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>
            <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{p.creator} · {p.platform} · {fmtNum(p.likes)} likes</div>
          </div>
          {i === 0 && <span>🔥</span>}
        </div>
      ))}

      <SH children="Why We Do This" sub="Real comments. Real people." />
      {CLIENTS.find((c: any) => c.id === 'matt')!.accounts[0].topComments.map((c: any, i: number) => (
        <CmtCard key={i} c={c} accent={P.sageDeep} accentSoft={P.sageSoft} />
      ))}
    </div>
  );
};

// ── INSTAGRAM ACCOUNT VIEW ─────────────────────────────────────────────────
const IGAccountView = ({ acc, igData, igGoal, setIgGoal }: { acc: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  const [timePeriod, setTimePeriod] = useState('week');
  const [goalPlatform, setGoalPlatform] = useState('instagram');

  const metrics = igData?.metrics;
  const media = igData?.media ?? [];
  const analytics = igData?.analytics;
  const isLive = !!metrics;

  const followers = isLive ? metrics.followers : acc.followers;
  const following = isLive ? metrics.following : null;
  const reach = isLive ? metrics.reach : (acc.reach >= 1000 ? fmtNum(acc.reach) : String(acc.reach));
  const engagement = isLive ? metrics.engagementRate.toFixed(1) + '%' : acc.engagement;
  const handle = isLive ? metrics.handle : acc.handle;
  const paceMonthly = metrics?.monthlyGrowthRate ?? 0;
  const paceYearly = metrics?.yearlyGrowthRate ?? paceMonthly * 12;
  const paceSource = metrics?.paceSource ?? 'insufficient_history';
  const pace = metrics?.pace ?? 'Syncing baseline...';
  const contentScore = metrics?.contentScore ?? 0;
  const posts = isLive && media.length > 0 ? media : acc.posts;
  const working = analytics?.working ?? acc.working;
  const flopping = analytics?.flopping ?? acc.flopping;

  // Weekly delta — for Mason use 0 since we don't have historical yet
  const weeklyDelta = paceMonthly > 0 ? Math.round(paceMonthly / 4.33) : 0;
  const { value: deltaVal, label: deltaLabel } = applyTimePeriod(weeklyDelta, timePeriod);

  // Pace by selected period
  const paceByPeriod = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: paceMonthly > 0 ? (paceMonthly / 4.33).toFixed(0) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };

  // ETA based on selected period rate
  const currentPeriodRate = parseFloat(paceByPeriod[timePeriod] ?? '0');
  const monthlyFromPeriod = timePeriod === 'sec' ? currentPeriodRate * 30 * 24 * 3600
    : timePeriod === 'min' ? currentPeriodRate * 30 * 24 * 60
    : timePeriod === 'day' ? currentPeriodRate * 30
    : timePeriod === 'week' ? currentPeriodRate * 4.33
    : timePeriod === 'month' ? currentPeriodRate
    : currentPeriodRate / 12;
  const estDate = calcEstDate(followers, igGoal, Math.round(monthlyFromPeriod));

  // Pie chart slices
  const pieSlices = [
    { value: followers, color: acc.colorDeep, label: 'Instagram' },
    { value: 0, color: P.skyDeep, label: 'TikTok' },
  ];

  // Mock sparkline data for engagement (will be real once historical data builds)
  const engagementHistory = [0, 0, 0, 0, 0, 0, isLive ? metrics.engagementRate : 0];
  const reachHistory = [0, 0, 0, 0, 0, 0, isLive ? parseFloat(metrics.reach ?? '0') : 0];

  return (
    <div>
      {/* Account header with handle and content score */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{acc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{acc.platform}</div>
          <div style={{ fontSize: 11, color: P.inkSoft, display: 'flex', alignItems: 'center', gap: 5 }}>
            {handle}
            {isLive && <><LiveDot color={P.sageDeep} /><span style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>live</span></>}
          </div>
        </div>
        <Ring val={contentScore} color={acc.colorDeep} size={46} />
      </div>

      {/* Followers with pie chart */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 15px', marginBottom: 8, borderTop: `2.5px solid ${acc.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              Followers {isLive && <LiveDot color={P.sageDeep} />}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{fmtNum(followers)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: deltaVal >= 0 ? P.sageDeep : P.roseDeep, fontWeight: 600 }}>{deltaVal >= 0 ? '↑' : '↓'} {deltaVal >= 0 ? '+' : ''}{fmtNum(Math.abs(deltaVal))}</span>
              <span style={{ fontSize: 10, color: P.inkFaint }}>{deltaLabel}</span>
            </div>
            {/* Time period switcher */}
            <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1, marginTop: 8, width: 'fit-content' }}>
              {TIME_PERIODS.map(tp => (
                <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
                  style={{ background: timePeriod === tp.id ? P.ink : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '3px 7px', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
          {/* Pie chart */}
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>By Platform</div>
            <PieChart slices={pieSlices} size={72} />
          </div>
        </div>
      </div>

      {/* Engagement + Reach with mini sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Engagement</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{engagement}</div>
          {isLive && <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono, marginBottom: 6 }}>live ✓</div>}
          <Spark data={engagementHistory.length > 1 ? engagementHistory : [0, 0, 0, 0, 0, 0, 0]} color={acc.color} h={28} />
        </div>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Reach (est.)</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{reach}</div>
          {isLive && <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono, marginBottom: 6 }}>derived ✓</div>}
          <Spark data={[0, 0, 0, 0, 0, 0, isLive ? parseFloat(String(metrics.reach).replace('K','')) || 1 : 1]} color={acc.color} h={28} />
        </div>
        {following != null && (
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Following</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{fmtNum(following)}</div>
            {isLive && <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>live ✓</div>}
          </div>
        )}
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Posts</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{isLive ? metrics.mediaCount : acc.posts?.length ?? 0}</div>
          {isLive && <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>live ✓</div>}
        </div>
      </div>

      {/* Pace cards — update with time period */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth Pace</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>{paceLabels[timePeriod]?.toUpperCase()}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
              {paceMonthly > 0 ? (parseFloat(paceByPeriod[timePeriod] ?? '0') >= 0 ? '+' : '') + paceByPeriod[timePeriod] : '—'}
            </div>
            <div style={{ fontSize: 9, color: paceSource === 'historical_data' ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>
              {paceSource === 'historical_data' ? 'tracked ✓' : paceSource === 'early_estimate' ? 'early data' : 'est. baseline'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>EST. GOAL DATE</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{paceMonthly > 0 ? estDate : '—'}</div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>at this {timePeriod} rate</div>
          </div>
        </div>
        {/* Time period switcher for pace */}
        <div style={{ display: 'flex', background: P.white, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {TIME_PERIODS.map(tp => (
            <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
              style={{ background: timePeriod === tp.id ? acc.colorDeep : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 0', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, flex: 1, transition: 'all 0.15s' }}>
              {tp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Follower goal with platform toggle */}
      <SH>Follower Goal</SH>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 2, gap: 1 }}>
          {['instagram', 'tiktok'].map(pl => (
            <button key={pl} onClick={() => setGoalPlatform(pl)}
              style={{ background: goalPlatform === pl ? acc.colorDeep : 'none', color: goalPlatform === pl ? P.white : P.inkSoft, border: 'none', borderRadius: 11, padding: '3px 10px', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, textTransform: 'uppercase' }}>
              {pl === 'instagram' ? 'IG' : 'TikTok'}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: P.inkSoft }}>goal target:</div>
        <input type="number" value={igGoal}
          onChange={e => { const v = parseInt(e.target.value); if (v > 0) setIgGoal(v); }}
          style={{ width: 80, border: `1px solid ${P.border}`, borderRadius: 7, padding: '4px 8px', fontSize: 12, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right' }}
        />
      </div>
      <GoalBar
        label={goalPlatform === 'instagram' ? 'Instagram Followers' : 'TikTok Followers'}
        current={followers}
        goal={igGoal}
        color={acc.color}
        colorSoft={acc.colorSoft}
        pace={paceMonthly > 0 ? pace : 'Estimating...'}
        paceSource={paceSource}
        estDate={paceMonthly > 0 ? estDate : 'Need more history'}
      />

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
        <div style={{ background: acc.colorSoft, border: `1px solid ${acc.color}30`, borderRadius: 12, padding: '18px', textAlign: 'center', margin: '12px 0' }}>
          <div style={{ fontSize: 20, marginBottom: 7 }}>📭</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4 }}>No posts yet</div>
          <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6 }}>Post your first video to start tracking engagement, top comments, and content performance.</div>
        </div>
      )}

      <SH>{"What's Working · What's Flopping"}</SH>
      <WW working={working} flopping={flopping} />

      {acc.topComments?.length > 0 && (
        <>
          <SH>Top Comments</SH>
          {acc.topComments.map((c: any, i: number) => <CmtCard key={i} c={c} accent={acc.colorDeep} accentSoft={acc.colorSoft} />)}
        </>
      )}

      <SH>AI Strategic Insight</SH>
      <AIInsight text={acc.insight} platform={acc.platform} />
    </div>
  );
};

// ── GENERIC ACCOUNT VIEW (Matt and non-live accounts) ──────────────────────
const GenericAccountView = ({ acc, goal, setGoal }: { acc: any; goal: number; setGoal: (v: number) => void }) => {
  const [timePeriod, setTimePeriod] = useState('week');
  const [goalPlatform, setGoalPlatform] = useState(acc.platform.toLowerCase());

  const weeklyDelta = parseInt((acc.followerDelta ?? '+0').replace('+', '').replace(',', '')) || 0;
  const { value: deltaVal, label: deltaLabel } = applyTimePeriod(weeklyDelta, timePeriod);

  const paceMonthly = Math.round(weeklyDelta * 4.33);
  const paceYearly = paceMonthly * 12;

  const paceByPeriod = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: weeklyDelta > 0 ? String(weeklyDelta) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };

  const estDate = calcEstDate(acc.followers, goal, paceMonthly);

  const pieSlices = [
    { value: acc.followers, color: acc.colorDeep, label: acc.platform },
  ];

  // Mock sparklines using weekly delta extrapolated
  const mockHistory = Array.from({ length: 7 }, (_, i) => Math.max(0, acc.followers - weeklyDelta * (6 - i)));

  return (
    <div>
      {/* Account header */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{acc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{acc.platform}</div>
          <div style={{ fontSize: 11, color: P.inkSoft }}>{acc.handle}</div>
        </div>
        <Ring val={0} color={acc.colorDeep} size={46} />
      </div>

      {/* Followers with pie chart */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 15px', marginBottom: 8, borderTop: `2.5px solid ${acc.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Followers</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em' }}>{fmtNum(acc.followers)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: deltaVal >= 0 ? P.sageDeep : P.roseDeep, fontWeight: 600 }}>{deltaVal >= 0 ? '↑' : '↓'} {deltaVal >= 0 ? '+' : ''}{fmtNum(Math.abs(deltaVal))}</span>
              <span style={{ fontSize: 10, color: P.inkFaint }}>{deltaLabel}</span>
            </div>
            <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1, marginTop: 8, width: 'fit-content' }}>
              {TIME_PERIODS.map(tp => (
                <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
                  style={{ background: timePeriod === tp.id ? P.ink : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '3px 7px', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>By Platform</div>
            <PieChart slices={pieSlices} size={72} />
          </div>
        </div>
      </div>

      {/* Engagement + Reach with sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Engagement</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{acc.engagement}</div>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 6 }}>mock</div>
          <Spark data={mockHistory.map(() => parseFloat(acc.engagement ?? '0'))} color={acc.color} h={28} />
        </div>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Reach</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{acc.reach >= 1000 ? fmtNum(acc.reach) : String(acc.reach)}</div>
          <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 6 }}>mock</div>
          <Spark data={mockHistory.map(() => acc.reach / 1000)} color={acc.color} h={28} />
        </div>
      </div>

      {/* Pace cards */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth Pace</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>{paceLabels[timePeriod]?.toUpperCase()}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
              +{paceByPeriod[timePeriod] ?? '0'}
            </div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>mock data</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>EST. GOAL DATE</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{estDate}</div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>at this {timePeriod} rate</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: P.white, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {TIME_PERIODS.map(tp => (
            <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
              style={{ background: timePeriod === tp.id ? acc.colorDeep : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 0', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, flex: 1, transition: 'all 0.15s' }}>
              {tp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <SH>Follower Goal</SH>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: P.inkSoft }}>goal target:</div>
        <input type="number" value={goal}
          onChange={e => { const v = parseInt(e.target.value); if (v > 0) setGoal(v); }}
          style={{ width: 80, border: `1px solid ${P.border}`, borderRadius: 7, padding: '4px 8px', fontSize: 12, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right' }}
        />
      </div>
      <GoalBar
        label={acc.platform + ' Followers'}
        current={acc.followers}
        goal={goal}
        color={acc.color}
        colorSoft={acc.colorSoft}
        pace={'+' + paceMonthly + '/mo'}
        paceSource="estimated_baseline"
        estDate={estDate}
      />

      {/* Milestones */}
      {acc.milestones && acc.milestones.length > 0 && (
        <>
          <SH>Viral Velocity Tracker</SH>
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, overflow: 'hidden', marginBottom: 4 }}>
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
      {acc.posts?.length > 0 && (
        <>
          <SH>Recent Posts</SH>
          {acc.posts.map((p: any, i: number) => (
            <PostCard key={i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />
          ))}
        </>
      )}

      <SH>{"What's Working · What's Flopping"}</SH>
      <WW working={acc.working} flopping={acc.flopping} />

      {acc.topComments?.length > 0 && (
        <>
          <SH>Top Comments</SH>
          {acc.topComments.map((c: any, i: number) => <CmtCard key={i} c={c} accent={acc.colorDeep} accentSoft={acc.colorSoft} />)}
        </>
      )}

      <SH>AI Strategic Insight</SH>
      <AIInsight text={acc.insight} platform={acc.platform} />
    </div>
  );
};


// ── CLIENT VIEW ────────────────────────────────────────────────────────────
const ClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  const [openAccs, setOpenAccs] = useState<Set<number>>(new Set([0]));
  const toggleAcc = (idx: number) => {
    setOpenAccs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };
  const [mattGoals, setMattGoals] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('matt_goals') ?? '{}'); } catch { return {}; }
    }
    return {};
  });

  const metrics = igData?.metrics;
  const isMason = client.id === 'mason';
  const displayFollowers = isMason && metrics ? metrics.followers : client.totalFollowers;
  const displayHandle = isMason && metrics ? metrics.handle : null;
  const contentScore = isMason && metrics ? metrics.contentScore : client.contentScore;

  const setMattGoal = (platform: string, v: number) => {
    const updated = { ...mattGoals, [platform]: v };
    setMattGoals(updated);
    if (typeof window !== 'undefined') localStorage.setItem('matt_goals', JSON.stringify(updated));
  };

  return (
    <div>
      {/* Client header */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, padding: '16px 18px', marginBottom: 14, display: 'flex', gap: 13, alignItems: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: client.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: client.colorDeep, fontFamily: F.display, flexShrink: 0 }}>
          {client.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{client.name}</div>
          <div style={{ fontSize: 11, color: P.inkSoft }}>{client.role}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {displayHandle && <Tag color={P.sageDeep} bg={P.sageSoft}>{displayHandle}</Tag>}
            {isMason && (
              <Tag color={P.skyDeep} bg={P.skySoft}>@masondoesnumbers TikTok</Tag>
            )}
            {!isMason && (
              <><Tag color={P.sageDeep} bg={P.sageSoft}>@macroswitmatt TikTok</Tag><Tag color={P.peachDeep} bg={P.peachSoft}>@macroswitmatt IG</Tag></>
            )}
          </div>
        </div>
        <Ring val={contentScore} color={client.colorDeep} size={50} />
      </div>

      {/* Best times */}
      <SH>Best Times to Post</SH>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {client.bestTimes.map((t: string, i: number) => <Tag key={i} color={client.colorDeep} bg={client.colorSoft}>⏰ {t}</Tag>)}
      </div>

      {/* Accounts */}
      <SH children={`${client.accounts.length} Connected Account${client.accounts.length > 1 ? 's' : ''}`} />
      {client.accounts.map((acc: any, idx: number) => {
        const isOpen = openAccs.has(idx);
        const isIGLive = isMason && acc.platform === 'Instagram' && !!metrics;
        return (
          <div key={idx} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 15, marginBottom: 12, overflow: 'hidden' }}>
            <button onClick={() => toggleAcc(idx)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: isOpen ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{acc.icon}</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {acc.platform}
                  {isIGLive && <LiveDot color={P.sageDeep} />}
                </div>
                <div style={{ fontSize: 10, color: P.inkSoft }}>{isIGLive ? metrics.handle : acc.handle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
                  {isIGLive ? fmtNum(metrics.followers) : fmtNum(acc.followers)}
                </div>
                <div style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>{isIGLive ? 'live ✓' : acc.followerDelta}</div>
              </div>
              <div style={{ color: P.inkFaint, fontSize: 10, marginLeft: 3 }}>{isOpen ? '▲' : '▼'}</div>
            </button>

            {isOpen && (
              <div style={{ padding: '14px 15px' }}>
                {isMason && acc.platform === 'Instagram'
                  ? <IGAccountView acc={acc} igData={igData} igGoal={igGoal} setIgGoal={setIgGoal} />
                  : <GenericAccountView
                      acc={acc}
                      goal={mattGoals[acc.platform] ?? (acc.platform === 'TikTok' ? 100000 : 10000)}
                      setGoal={(v: number) => setMattGoal(acc.platform, v)}
                    />
                }
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


// ── REACH DATA ─────────────────────────────────────────────────────────────
const REACH_DATA = [12, 18, 14, 22, 19, 28, 31, 26, 38, 42, 35, 51, 48, 63, 71, 58, 82, 94, 87, 110, 103, 128, 141, 163];

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function AdariCommandCenter() {
  const [view, setView] = useState('overview');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const [igData, setIgData] = useState<any>(null);
  const [igLoading, setIgLoading] = useState(true);
  const [igGoal, setIgGoal] = useState<number>(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('ig_goal') ?? '10000');
    return 10000;
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 30000);
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
  ];

  return (
    <div style={{ minHeight: '100vh', background: P.bg, color: P.ink, fontFamily: F.body, paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: '14px 18px 0', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: P.inkFaint, fontFamily: F.mono }}>Maison Adari · The AFE</div>
            <div style={{ fontSize: 19, fontWeight: 800, fontFamily: F.display, color: P.ink, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Command Center</div>
          </div>
          <div style={{ textAlign: 'right', paddingTop: 2 }}>
            <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: F.mono }}>{time}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
              <LiveDot color={P.sageDeep} />
              <span style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono, letterSpacing: '0.1em' }}>LIVE</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)}
                style={{ background: 'none', border: 'none', borderBottom: active ? `2px solid ${(tab as any).color || P.lavDeep}` : '2px solid transparent', padding: '7px 10px', color: active ? P.ink : P.inkSoft, fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F.body, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.12s' }}>
                {tab.avatar && <span style={{ width: 14, height: 14, borderRadius: '50%', background: (tab as any).color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: P.white }}>{tab.avatar}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '16px 16px' }}>

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
          <ClientView
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
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
          <div>
            <div style={{ background: P.dark, borderRadius: 18, padding: '20px', marginBottom: 18 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono, marginBottom: 12 }}>✦ Agency Revenue · Maison Adari</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Billed This Month', value: '$0', sub: '0 active clients', color: P.sage },
                  { label: 'Pipeline Value', value: '$2,400', sub: '4 prospects identified', color: P.lavender },
                  { label: 'Projected (1 Client)', value: '$800/mo', sub: 'Standard AFE rate', color: P.butter },
                  { label: 'Monthly Target', value: '$5,000', sub: '6 clients @ $800', color: P.rose },
                ].map((s, i) => (
                  <div key={i} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 13, padding: '14px', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 9, color: P.darkMuted, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: F.mono, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, marginBottom: 6 }}>Progress to $5K/mo Target</div>
                <div style={{ background: P.darkBorder, borderRadius: 99, height: 8 }}>
                  <div style={{ background: P.sage, height: 8, width: '0%', borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 6, fontStyle: 'italic' }}>First client unlocks the flywheel. Everything after is momentum.</div>
              </div>
            </div>
            <SH>Pricing Tiers</SH>
            {[
              { tier: 'Starter', price: '$500/mo', desc: '2 posts/week, monthly report, basic analytics', color: P.sage },
              { tier: 'Growth', price: '$800/mo', desc: '4 posts/week, weekly report, competitor analysis, hook strategy', color: P.lavender },
              { tier: 'Pro', price: '$1,200/mo', desc: 'Daily content, live dashboard access, creator DM agent, full AFE deployment', color: P.rose },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 13, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display }}>{t.tier}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: t.color }}>{t.price}</div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid }}>{t.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* AFE ENGINE */}
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
