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
        fontSize="11" fontWeight="700" fill={P.ink} fontFamily={F.display}>{val}</text>
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
  { flag: '🇺🇸', action: 'followed Macros Wit Matt', user: '@hungry_tyler', loc: 'Los Angeles, CA' },
  { flag: '🇲🇽', action: "liked 'BEST Ramen in LA'", user: '@foodie_mx', loc: 'Mexico City' },
  { flag: '🇬🇧', action: 'saved the birria video', user: '@londonbites_', loc: 'London, UK' },
  { flag: '🇨🇦', action: "commented 'need to visit LA'", user: '@torontoeats', loc: 'Toronto, CA' },
  { flag: '🇯🇵', action: 'followed Macros Wit Matt', user: '@ramen_japan_', loc: 'Tokyo, Japan' },
  { flag: '🇦🇺', action: 'liked 3 videos', user: '@sydneyfood22', loc: 'Sydney, AU' },
  { flag: '🇧🇷', action: 'shared the ramen video', user: '@comidabr_', loc: 'São Paulo' },
  { flag: '🇩🇪', action: 'followed Mason', user: '@berlin_food', loc: 'Berlin, DE' },
];

const GlobeFeed = () => {
  const [items, setItems] = useState<any[]>([]);
  const idxRef = useRef(0);
  useEffect(() => {
    const add = () => {
      const e = FEED_EVENTS[idxRef.current % FEED_EVENTS.length];
      idxRef.current++;
      setItems(prev => [{ ...e, t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() }, ...prev].slice(0, 16));
    };
    add();
    const iv = setInterval(add, 3000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div>
      <div style={{ background: P.dark, borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: P.darkMuted, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: F.mono, marginBottom: 14 }}>Live Global Activity</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
          {[
            { label: 'Top Country', val: '🇺🇸 USA' },
            { label: 'Top City', val: 'Los Angeles' },
          ].map(s => (
            <div key={s.label} style={{ background: P.darkCard, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <SH>Live Activity Feed</SH>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, overflow: 'hidden' }}>
        {items.map((e, i) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderBottom: i < items.length - 1 ? `1px solid ${P.borderLight}` : 'none' }}>
            <div style={{ fontSize: 16, flexShrink: 0 }}>{e.flag}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.action}</div>
              <div style={{ fontSize: 10, color: P.inkSoft }}>{e.user} · {e.loc}</div>
            </div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, flexShrink: 0 }}>{e.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── LIVE STUDIO ────────────────────────────────────────────────────────────
const LIVE_COMMENTS_DATA = [
  { user: '@hungry_tyler', text: 'bro what spot is this???' },
  { user: '@foodieLA_k', text: 'this looks incredible omg' },
  { user: '@ramen_fan22', text: 'what bowl is that?? the broth color' },
  { user: '@localfoodie_', text: 'going tomorrow morning fr' },
  { user: '@socal_eats', text: 'you should do korean bbq tacos next' },
];

const LiveStudio = () => {
  const [secs, setSecs] = useState(0);
  const [viewers, setViewers] = useState(847);
  const [likes, setLikes] = useState(14200);
  const [follows, setFollows] = useState(38);
  const [chat, setChat] = useState<any[]>([]);
  const cIdxRef = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => s + 1);
      setViewers(v => v + Math.floor(Math.random() * 4 - 1));
      setLikes(l => l + Math.floor(Math.random() * 7));
      if (Math.random() > 0.7) setFollows(f => f + 1);
      if (Math.random() > 0.4) {
        const c = LIVE_COMMENTS_DATA[cIdxRef.current % LIVE_COMMENTS_DATA.length];
        cIdxRef.current++;
        setChat(prev => [{ ...c, id: Date.now() }, ...prev].slice(0, 10));
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const timer = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return (
    <div>
      <div style={{ background: P.dark, borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <LiveDot color={P.sageDeep} />
          <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, letterSpacing: '0.12em' }}>LIVE NOW · TIKTOK</div>
          <div style={{ marginLeft: 'auto', fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>{timer}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'Viewers', val: viewers.toLocaleString() },
            { label: 'Likes', val: fmtNum(likes) },
            { label: 'Follows', val: '+' + follows },
          ].map(s => (
            <div key={s.label} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{s.val}</div>
              <div style={{ fontSize: 9, color: P.darkMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: F.mono, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, marginBottom: 7, letterSpacing: '0.12em' }}>LIVE CHAT</div>
        <div style={{ background: '#0e0c0a', borderRadius: 9, padding: '9px 11px', maxHeight: 130, overflowY: 'auto' }}>
          {chat.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 11 }}>
              <span style={{ color: P.darkMuted, fontWeight: 600, flexShrink: 0 }}>{c.user}</span>
              <span style={{ color: '#b0a898', lineHeight: 1.5 }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── RETURN TO SPOT ─────────────────────────────────────────────────────────
const SPOTS: Record<string, any> = {
  niku: {
    name: 'Niku Niku Ramen', city: 'Torrance, CA', emoji: '🍜',
    views: '41.2K', likes: '2,890',
    topComment: 'what bowl was that at the end?? I need the name or I'm losing sleep',
    mandatory: 'The Tantanmen · extra spicy · soft egg · bamboo. The Mason Way: ask for the full protein customization.',
    angle: 'Last time: solo tasting. This time: blindfold order challenge. Let chat pick the bowl.',
    script: "Hook: 'I came back because 412 people asked me the same question.' Open on the bowl reveal — zero talking for the first 5 seconds.",
    color: P.sage, colorSoft: P.sageSoft,
  },
  fuego: {
    name: 'Fuego Birria Tacos', city: 'East LA', emoji: '🌮',
    views: '28.4K', likes: '1,950',
    topComment: "you should've gotten the quesabirria — that's the move not the regular taco",
    mandatory: 'Quesabirria · dip in consommé · extra cheese pull. The Mason Way: jalapeños grilled on top, double dip, lime squeeze on camera.',
    angle: 'Last video showed the taco. This time: the consommé dunk in slow motion. Film the cheese pull close-up.',
    script: "Hook: '412 people told me I ordered wrong. They were right.'",
    color: P.rose, colorSoft: P.roseSoft,
  },
};

const ReturnToSpot = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const s = selected ? SPOTS[selected] : null;
  return (
    <div>
      <SH>Recently Filmed Spots</SH>
      {Object.entries(SPOTS).map(([k, v]) => (
        <div key={k} onClick={() => setSelected(selected === k ? null : k)}
          style={{ background: P.white, border: `1px solid ${selected === k ? v.color : P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: v.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{v.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{v.name}</div>
            <div style={{ fontSize: 10, color: P.inkSoft }}>{v.city} · {v.views} views</div>
          </div>
          <div style={{ fontSize: 10, color: P.inkFaint }}>{selected === k ? '▲' : '▼'}</div>
        </div>
      ))}
      {s && (
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: s.colorSoft, padding: '13px 15px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display }}>{s.name}</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
              <Tag color={P.sageDeep} bg={P.sageSoft}>{s.views} views</Tag>
              <Tag color={P.skyDeep} bg={P.skySoft}>{s.likes} likes</Tag>
            </div>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { head: 'Top Comment Demand', body: `"${s.topComment}"`, color: P.sageDeep, bg: P.sageSoft },
              { head: 'What to Order · The Mason Way', body: s.mandatory, color: P.lavDeep, bg: P.lavSoft },
              { head: 'Angle This Time', body: s.angle, color: P.peachDeep, bg: P.peachSoft },
              { head: 'Opening Hook', body: s.script, color: P.roseDeep, bg: P.roseSoft },
            ].map((r, i) => (
              <div key={i} style={{ background: r.bg, border: `1px solid ${r.color}25`, borderRadius: 11, padding: '11px 13px', marginBottom: 9 }}>
                <div style={{ fontSize: 9, color: r.color, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: F.mono, marginBottom: 5 }}>{r.head}</div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{r.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── CLIENT DATA ────────────────────────────────────────────────────────────
const CLIENTS = [
  {
    id: 'mason', name: 'Mason', role: 'Founder · Maison Adari', avatar: 'M',
    color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep,
    contentScore: 0,
    totalFollowers: 370, totalReach: '56', engagement: '0%', weeklyGrowth: '+0',
    bestTimes: ['Tues 6–8pm', 'Fri 11am–1pm', 'Sun 7–9pm'],
    igGoalDefault: 10000,
    accounts: [
      {
        platform: 'Instagram', icon: '📸', handle: '@masondoesnumbers',
        followers: 370, followerDelta: '+0', reach: 56, engagement: '0%',
        color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
        insight: 'Your account is connected and live. Post consistently to start generating engagement data. Process reveals and contrarian takes on restaurant marketing tend to outperform lifestyle content 3–4× for agency operator accounts.',
        posts: [],
        topComments: [],
        working: 'Account connected. Start posting to see what works.',
        flopping: 'No posting history yet. Every day without content is a missed data point.',
      },
      {
        platform: 'TikTok', icon: '🎵', handle: '@masonadari',
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
    contentScore: 94,
    totalFollowers: 53500, totalReach: '184K', engagement: '6.1%', weeklyGrowth: '+238',
    bestTimes: ['Mon 12–2pm', 'Thurs 7–9pm', 'Sat 10am–12pm'],
    igGoalDefault: 10000,
    accounts: [
      {
        platform: 'TikTok', icon: '🎵', handle: '@macroswitmat',
        followers: 48200, followerDelta: '+194', reach: 163000, engagement: '6.8%',
        color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
        insight: 'Negation hook is your strongest format — averaging 35K+ views. Pure food footage outperforms vlog filler 2.4×. Priority: batch 5 more negation hook videos against well-known chains.',
        posts: [
          { id: '1', caption: 'BEST Ramen in LA (not Daikokuya)', like_count: 41200, comments_count: 892, media_type: 'VIDEO', perf: 'hot', hook: 'Negation hook' },
          { id: '2', caption: 'This birria spot literally changed my life fr', like_count: 28400, comments_count: 634, media_type: 'VIDEO', perf: 'hot', hook: 'Hyperbole' },
          { id: '3', caption: 'Underrated sushi in Torrance nobody talks about', like_count: 9800, comments_count: 201, media_type: 'VIDEO', perf: 'neutral', hook: 'Secret framing' },
        ],
        topComments: [
          { user: '@hungryinsocal', text: 'I went here because of this video and it was EXACTLY like you said omg I\'m obsessed', likes: 1240, platform: 'TikTok' },
          { user: '@foodieLA_tiff', text: 'the way you filmed the broth had me physically running to my car', likes: 876, platform: 'TikTok' },
          { user: '@ramenlover99', text: "what bowl was that at the end?? I need the name or I'm losing sleep", likes: 412, platform: 'TikTok' },
        ],
        working: "'Best X in [City]' negation hooks averaging 35K+ views. Pure food footage 2.4× better watch time.",
        flopping: 'Vlog filler and parking lot footage kills watch time. Cut anything before the food.',
      },
      {
        platform: 'Instagram', icon: '📸', handle: '@macroswitmat',
        followers: 5300, followerDelta: '+44', reach: 21000, engagement: '4.4%',
        color: P.peach, colorSoft: P.peachSoft, colorDeep: P.peachDeep,
        insight: 'Cross-posting proven TikTok content to IG Reels generates 35–50% secondary reach at zero additional effort.',
        posts: [
          { id: '4', caption: 'BEST Ramen in LA 🍜 (full video on TikTok)', like_count: 3800, comments_count: 120, media_type: 'REEL', perf: 'hot', hook: 'Cross-platform tease' },
        ],
        topComments: [
          { user: '@la_foodie', text: 'I drive past this place every day and never went in. Going tomorrow morning.', likes: 234, platform: 'Instagram' },
        ],
        working: 'Cross-posting proven TikTok content gets 35–50% secondary reach.',
        flopping: 'Static photos without text overlay getting minimal saves.',
      },
    ],
  },
];

const PROSPECTS = [
  { name: 'The Patty Lab', handle: '@thepattylabburgers', followers: '3.2K', foodScore: 9.7, socialScore: 1.3, heat: 9.4, lastPost: '6 days ago', note: 'Highest food score ever logged. Near-zero social with a product that could go viral in one video. Reach out today.', color: P.sage, colorSoft: P.sageSoft },
  { name: 'Fuego Birria Tacos', handle: '@fuegobirriatacosofficial', followers: '12.4K', foodScore: 9.2, socialScore: 2.1, heat: 8.8, lastPost: '3 days ago', note: 'Food is legitimately top-tier SoCal birria. Zero content strategy. Perfect AFE candidate.', color: P.peach, colorSoft: P.peachSoft },
  { name: 'Niku Niku Ramen', handle: '@nikunikulaofficial', followers: '8.1K', foodScore: 8.4, socialScore: 3.8, heat: 7.2, lastPost: 'Yesterday', note: 'Posting consistently but hook-less. Massive organic upside untapped.', color: P.lavender, colorSoft: P.lavSoft },
];

// ── INSTAGRAM ACCOUNT VIEW ─────────────────────────────────────────────────
const IGAccountView = ({ acc, igData, igGoal, setIgGoal }: { acc: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
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
  const paceSource = metrics?.paceSource ?? 'insufficient_history';
  const pace = metrics?.pace ?? 'Estimating...';
  const estDate = calcEstDate(followers, igGoal, paceMonthly);
  const contentScore = metrics?.contentScore ?? 0;
  const posts = isLive && media.length > 0 ? media : acc.posts;
  const working = analytics?.working ?? acc.working;
  const flopping = analytics?.flopping ?? acc.flopping;

  return (
    <div>
      {/* Account header */}
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

      {/* Core metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        <StatCard label="Followers" value={fmtNum(followers)} sub={isLive ? 'live ✓' : 'mock'} accent={acc.color} live={isLive} />
        <StatCard label="Following" value={following != null ? fmtNum(following) : '—'} sub={isLive ? 'live ✓' : '—'} accent={acc.color} live={isLive} />
        <StatCard label="Reach (est.)" value={reach} sub={isLive ? 'derived from live data' : 'mock'} accent={acc.color} live={isLive} />
        <StatCard label="Engagement" value={engagement} sub={isLive ? 'live calculation' : 'mock'} accent={acc.color} live={isLive} />
      </div>

      {/* Follower goal */}
      <SH>Follower Goal</SH>
      <GoalBar
        label="Instagram Followers"
        current={followers}
        goal={igGoal}
        color={acc.color}
        colorSoft={acc.colorSoft}
        pace={pace}
        paceSource={paceSource}
        estDate={estDate}
        onGoalChange={setIgGoal}
      />
      {paceMonthly > 0 && (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 11, padding: '10px 13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>MONTHLY PACE</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display, color: P.ink }}>+{paceMonthly}/mo</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>YEARLY PACE</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display, color: P.ink }}>+{metrics?.yearlyGrowthRate ?? paceMonthly * 12}/yr</div>
          </div>
        </div>
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
        <div style={{ background: acc.colorSoft, border: `1px solid ${acc.color}30`, borderRadius: 12, padding: '18px', textAlign: 'center', margin: '12px 0' }}>
          <div style={{ fontSize: 20, marginBottom: 7 }}>📭</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4 }}>No posts yet</div>
          <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6 }}>Post your first video to start tracking engagement, top comments, and content performance.</div>
        </div>
      )}

      <SH>What's Working · What's Flopping</SH>
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

// ── CLIENT VIEW ────────────────────────────────────────────────────────────
const ClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  const [openAcc, setOpenAcc] = useState(0);
  const metrics = igData?.metrics;
  const isMason = client.id === 'mason';

  const displayFollowers = isMason && metrics ? metrics.followers : client.totalFollowers;
  const displayHandle = isMason && metrics ? metrics.handle : null;
  const contentScore = isMason && metrics ? metrics.contentScore : client.contentScore;

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
            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers {isMason && metrics ? '· live ✓' : ''}</Tag>
            {displayHandle && <Tag color={P.inkSoft} bg={P.cardAlt}>{displayHandle}</Tag>}
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
        const isOpen = openAcc === idx;
        const isIGLive = isMason && acc.platform === 'Instagram' && !!metrics;
        return (
          <div key={idx} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 15, marginBottom: 12, overflow: 'hidden' }}>
            <button onClick={() => setOpenAcc(isOpen ? -1 : idx)}
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
                  : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
                        <StatCard label="Followers" value={fmtNum(acc.followers)} sub="mock" accent={acc.color} />
                        <StatCard label="Reach" value={acc.reach >= 1000 ? fmtNum(acc.reach) : String(acc.reach)} sub="mock" accent={acc.color} />
                        <StatCard label="Engagement" value={acc.engagement} sub="mock" accent={acc.color} />
                        <StatCard label="Posts" value={String(acc.posts?.length ?? 0)} sub="mock" accent={acc.color} />
                      </div>
                      {acc.posts?.length > 0 && (
                        <>
                          <SH>Recent Posts</SH>
                          {acc.posts.map((p: any, i: number) => <PostCard key={i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />)}
                        </>
                      )}
                      <SH>What's Working · What's Flopping</SH>
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
                  )}
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
          <div>
            {/* Morning briefing */}
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 16, padding: '15px 17px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 7 }}>📰 Morning Briefing · {today}</div>
              <div style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.8, fontFamily: F.display, fontStyle: 'italic' }}>
                {igMetrics
                  ? `Mason's Instagram is live at ${fmtNum(igMetrics.followers)} followers. Reach estimated at ${igMetrics.reach}. ${igMetrics.paceSource === 'historical_data' ? `Growing at ${igMetrics.pace} based on tracked history.` : 'Growth tracking has started — pace will sharpen as more data accumulates.'} Matt's Ramen video at 41K views remains the highest-performing piece of content this year. Korean BBQ tacos trending on TikTok Search in SoCal — nobody has filmed it yet.`
                  : "Matt's Ramen video hit 41K views in 18 hours — best organic run of the year. Korean BBQ tacos spiking on TikTok Search in SoCal — nobody has filmed it yet."
                }
              </div>
            </div>

            {/* Cross-platform summary */}
            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 15, padding: '15px 17px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Combined Reach · All Platforms</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: F.display, color: P.ink, marginTop: 3 }}>
                    {igLoading ? 'Loading...' : igMetrics ? igMetrics.reach : '163K'}
                    <span style={{ fontSize: 12, color: P.sageDeep, fontWeight: 400, marginLeft: 8 }}>
                      {igMetrics ? '↑ live data' : '↑ 22% this week'}
                    </span>
                  </div>
                </div>
                <Tag color={igMetrics ? P.sageDeep : P.inkSoft} bg={igMetrics ? P.sageSoft : P.card}>
                  {igMetrics ? '🟢 Instagram Live' : 'Connecting...'}
                </Tag>
              </div>
              <Spark data={REACH_DATA} color={P.lavDeep} h={48} />
            </div>

            {/* Combined platform stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 4 }}>
              <StatCard label="Mason · IG Followers" value={igLoading ? '...' : fmtNum(igMetrics?.followers ?? 370)} sub={igMetrics ? 'live ✓' : 'loading'} accent={P.lavender} live={!!igMetrics} />
              <StatCard label="Matt · TikTok Followers" value="48.2K" sub="mock — connect TikTok" accent={P.sage} />
              <StatCard label="IG Engagement" value={igMetrics ? igMetrics.engagementRate.toFixed(1) + '%' : '—'} sub={igMetrics ? 'live calculation' : 'loading'} accent={P.rose} live={!!igMetrics} />
              <StatCard label="Content Score" accent={P.butter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 5 }}>
                  <Ring val={igMetrics?.contentScore ?? 0} color={P.butterDeep} size={44} />
                  <div style={{ fontSize: 10, color: P.inkSoft, lineHeight: 1.5 }}>{igMetrics ? 'Derived from live data' : 'Awaiting data'}</div>
                </div>
              </StatCard>
            </div>

            {/* IG goal summary */}
            {igMetrics && (
              <>
                <SH>Instagram Goal · Quick View</SH>
                <GoalBar
                  label="Followers to 10K"
                  current={igMetrics.followers}
                  goal={igGoal}
                  color={P.rose}
                  colorSoft={P.roseSoft}
                  pace={igMetrics.pace}
                  paceSource={igMetrics.paceSource}
                  estDate={calcEstDate(igMetrics.followers, igGoal, igMetrics.monthlyGrowthRate)}
                  onGoalChange={handleSetIgGoal}
                />
              </>
            )}

            {/* Top content this week */}
            <SH>This Week's Top Content</SH>
            {[
              { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'BEST Ramen in LA (not Daikokuya)', likes: 41200, saves: 3800, color: P.sage },
              { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'This birria spot literally changed my life fr', likes: 28400, saves: 2100, color: P.sage },
            ].map((p, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '10px 13px', marginBottom: 7, display: 'flex', gap: 9, alignItems: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{p.creator} · {p.platform} · {fmtNum(p.likes)} likes</div>
                </div>
                <span>🔥</span>
              </div>
            ))}

            {/* Why we do this */}
            <SH children="Why We Do This" sub="Real comments. Real people. Real impact." />
            {CLIENTS.find(c => c.id === 'matt')!.accounts[0].topComments.map((c, i) => (
              <CmtCard key={i} c={c} accent={P.sageDeep} accentSoft={P.sageSoft} />
            ))}
          </div>
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
        {view === 'trends' && (
          <div>
            <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.sageDeep, fontFamily: F.mono, marginBottom: 6 }}>Trend Radar · SoCal Food · Before the Hype</div>
              <p style={{ fontSize: 12, color: P.sageDeep, lineHeight: 1.65, margin: 0 }}>These are rising before they hit mainstream. Film first and own the SEO before the crowds arrive.</p>
            </div>
            {[
              { rank: 1, name: 'Korean BBQ Tacos LA', meta: 'TikTok Search · +840% this week · SoCal geo', tag: '🔥 Film now', tc: P.sageDeep, tb: P.sageSoft },
              { rank: 2, name: 'Birria Ramen Fusion', meta: 'TikTok + IG · +620% · Under the radar', tag: '🔥 Film now', tc: P.sageDeep, tb: P.sageSoft },
              { rank: 3, name: 'LA Smash Burger hidden gem', meta: 'Google Trends · +410% · Accelerating', tag: '↑ Rising', tc: P.butterDeep, tb: P.butterSoft },
              { rank: 4, name: 'Thai Tea Ice Cream rolls', meta: 'TikTok FYP · +290% · Just cresting', tag: '↑ Rising', tc: P.butterDeep, tb: P.butterSoft },
              { rank: 5, name: 'Wagyu Beef Dumplings', meta: 'IG Explore · +180% · Building', tag: '👁 Watch', tc: P.skyDeep, tb: P.skySoft },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '10px 13px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P.inkFaint, width: 20, fontFamily: F.mono }}>{t.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <Tag color={t.tc} bg={t.tb}>{t.tag}</Tag>
              </div>
            ))}
          </div>
        )}

        {/* COMPETITORS */}
        {view === 'compete' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>Competitor Intelligence</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65, margin: 0 }}>Transform their hooks, topics, and angles into your niche. Compete smart, not against.</p>
            </div>
            {[
              { name: 'LAtryGuy', handle: '@latryguy · 960K YouTube', initials: 'LA', color: P.sage, play: 'LAtryGuy is LA-wide. Matt is hyperlocal South Bay + OC. Own that lane. Their audience asks for spots outside their radius — you\'re already there.' },
              { name: "Jack's Dining Room", handle: '@jacksdiningroom · 2.3M TikTok', initials: 'JD', color: P.rose, play: 'Jack does NYC. You do SoCal. His Korean fried chicken at 1.2M — film the best Korean fried chicken in Torrance this week and ride the wave he created.' },
              { name: 'Gareth Eats', handle: '@garetheats · 750K YouTube · San Diego', initials: 'GE', color: P.butter, play: 'Gareth owns San Diego. You own South Bay and OC. The overlap is the 405 corridor. Pitch: \'LA vs SD [food] — who wins?\'' },
            ].map((comp, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '15px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${comp.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: P.ink, flexShrink: 0 }}>{comp.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F.display }}>{comp.name}</div>
                    <div style={{ fontSize: 10, color: P.inkSoft }}>{comp.handle}</div>
                  </div>
                </div>
                <AIInsight text={comp.play} platform={comp.name} />
              </div>
            ))}
          </div>
        )}

        {/* PROSPECTS */}
        {view === 'prospects' && (
          <div>
            <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.butterDeep, fontFamily: F.mono, marginBottom: 6 }}>Burner Account · Active · SoCal</div>
              <p style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.75, margin: 0 }}>Monitoring 47 accounts in LA, OC, and San Diego. 3 high-priority prospects this week.</p>
            </div>
            {PROSPECTS.map((p, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${p.color}`, borderRadius: 13, padding: '14px', marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: P.inkSoft }}>{p.handle} · {p.followers} · {p.lastPost}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono }}>Heat</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.display, color: p.color }}>{p.heat}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>Food Quality</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.foodScore} max={10} color={P.sageDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.sageDeep }}>{p.foodScore}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>Social</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.socialScore} max={10} color={P.roseDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.roseDeep }}>{p.socialScore}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 11 }}>{p.note}</div>
                <button style={{ background: p.colorSoft, border: `1px solid ${p.color}`, borderRadius: 20, padding: '7px 16px', color: P.ink, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reach Out via Maison Adari →</button>
              </div>
            ))}
          </div>
        )}

        {/* REVENUE */}
        {view === 'revenue' && (
          <div>
            <div style={{ background: P.dark, borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono, marginBottom: 12 }}>✦ Agency Revenue · Maison Adari</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[
                  { label: 'Billed This Month', val: '$0', sub: '0 active clients', color: P.sage },
                  { label: 'Pipeline Value', val: '$2,400', sub: '3 prospects identified', color: P.lavender },
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
            </div>
          </div>
        )}

        {/* AFE ENGINE */}
        {view === 'engine' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 7 }}>The Adari Food Engine</div>
              <div style={{ fontSize: 14, fontFamily: F.display, color: P.ink, lineHeight: 1.75, fontStyle: 'italic' }}>
                "We don't post content. We engineer virality. Every frame, hook, and caption is built to make the food so compelling it forces the viewer to act."
              </div>
            </div>
            {[
              { step: '01', label: 'Identify', desc: 'Burner account surfaces restaurants with exceptional food and underdeveloped social.', color: P.lavender },
              { step: '02', label: 'Outreach', desc: 'Value-first cold call + tailored DM. We lead with what we see, not what we sell.', color: P.rose },
              { step: '03', label: 'Analyze', desc: 'Apify scrapes top hooks in their niche. We identify psychology triggers and content gaps.', color: P.peach },
              { step: '04', label: 'Execute', desc: 'Weekly short-form content built purely off data. Nothing random, nothing guessed.', color: P.sage },
              { step: '05', label: 'Report', desc: 'Live dashboard showing growth, winners, top comments, and milestone tracking.', color: P.butter },
              { step: '06', label: 'Scale', desc: 'Creator DM agent handles inbound, qualifies by niche, and books to calendar automatically.', color: P.sky },
            ].map((s, i) => (
              <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: F.mono, color: P.ink, fontWeight: 500, flexShrink: 0 }}>{s.step}</div>
                  {i < 5 && <div style={{ width: 1, flex: 1, background: P.borderLight, marginTop: 4, minHeight: 14 }} />}
                </div>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, fontFamily: F.display, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
