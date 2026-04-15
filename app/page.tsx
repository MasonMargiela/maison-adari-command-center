'use client';

import { useState, useEffect, useRef } from "react";

const P = {
  cream: "#faf8f4", white: "#ffffff", card: "#f6f3ee",
  border: "#e8e0d4", borderLight: "#f0ebe3",
  lavender: "#c9b8e8", lavSoft: "#ede8f9", lavDeep: "#8b72cc",
  rose: "#e8b4c2", roseSoft: "#fce9ed", roseDeep: "#c4849a",
  sage: "#aed0b2", sageSoft: "#e6f4e8", sageDeep: "#5a9e66",
  butter: "#f2dfa0", butterSoft: "#fdf6dc", butterDeep: "#b8940a",
  peach: "#f2c4a0", peachSoft: "#fdeee2", peachDeep: "#c07840",
  sky: "#b4d4f0", skySoft: "#e4f0fc", skyDeep: "#4a8ec4",
  ink: "#1e1a16", inkMid: "#5a5248", inkSoft: "#8a8078", inkFaint: "#b8b0a4",
  dark: "#1a1612", darkCard: "#242018", darkBorder: "#3a342c",
};

// ── SPARKLINE ─────────────────────────────────────────────────────────────
const Spark = ({ data, color, h = 44 }) => {
  const ref = useRef(null);
  const [w, setW] = useState(200);
  useEffect(() => { if (ref.current) setW(ref.current.offsetWidth || 200); }, []);
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = pts.split(" ").pop().split(",");
  return (
    <div ref={ref} style={{ width: "100%", height: h }}>
      <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id={`g${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g${color.replace("#", "")})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
      </svg>
    </div>
  );
};

// ── RING ──────────────────────────────────────────────────────────────────
const Ring = ({ val, color, size = 52 }) => {
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (val / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={P.borderLight} strokeWidth="5.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="12" fontWeight="700" fill={P.ink} fontFamily="'Fraunces',serif">{val}</text>
    </svg>
  );
};

// ── MINI BAR ──────────────────────────────────────────────────────────────
const Bar = ({ val, max, color }) => (
  <div style={{ background: P.borderLight, borderRadius: 99, height: 5, flex: 1, overflow: "hidden" }}>
    <div style={{ background: color, height: 5, width: `${Math.min(100, (val / Math.max(max, 1)) * 100)}%`, borderRadius: 99, transition: "width 0.9s ease" }} />
  </div>
);

// ── GOAL BAR ──────────────────────────────────────────────────────────────
const GoalBar = ({ current, goal, label, color, colorSoft, pace, projDate }) => (
  <div style={{ background: colorSoft, border: `1px solid ${color}50`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: P.ink }}>{label}</div>
      <div style={{ fontSize: 11, color: P.inkSoft }}>{current.toLocaleString()} / {goal.toLocaleString()}</div>
    </div>
    <div style={{ background: `${color}30`, borderRadius: 99, height: 8, marginBottom: 8, overflow: "hidden" }}>
      <div style={{ background: color, height: 8, width: `${Math.min(100, (current / goal) * 100)}%`, borderRadius: 99 }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ fontSize: 10, color: P.inkSoft }}>+{pace}/mo pace</div>
      <div style={{ fontSize: 10, color: P.inkFaint }}>Est. {projDate}</div>
    </div>
  </div>
);

// ── TAG ───────────────────────────────────────────────────────────────────
const Tag = ({ children, color = P.lavDeep, bg = P.lavSoft }) => (
  <span style={{ background: bg, color, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", display: "inline-block" }}>{children}</span>
);

// ── SECTION HEAD ──────────────────────────────────────────────────────────
const SH = ({ children, sub }: { children?: any; sub?: any }) => (
  <div style={{ marginTop: 24, marginBottom: 12 }}>
    <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: P.inkFaint, fontFamily: "'DM Mono',monospace" }}>{children}</div>
    {sub && <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ── STAT TILE ─────────────────────────────────────────────────────────────
const Tile = ({ label, value, sub, color, children }: { label: any; value?: any; sub?: any; color: any; children?: any }) => (
  <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: "14px 16px", borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 10, color: P.inkFaint, textTransform: "uppercase", letterSpacing: "0.09em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>{label}</div>
    {value && <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: P.ink, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{value}</div>}
    {sub && <div style={{ fontSize: 11, color: P.sageDeep, marginTop: 3 }}>{sub}</div>}
    {children}
  </div>
);

// ── POST CARD ─────────────────────────────────────────────────────────────
const PostCard = ({ post, accent, accentSoft, accentDeep }) => {
  const ICONS = { Reel: "🎬", Video: "🎵", Carousel: "🖼️", Post: "📸" };
  const perfColor = post.perf === "hot" ? P.sageDeep : post.perf === "neutral" ? P.butterDeep : P.roseDeep;
  const maxStat = Math.max(post.likes, (post.saves || 0) * 2, post.comments * 12);
  return (
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
      <div style={{ display: "flex" }}>
        <div style={{ width: 70, minHeight: 70, background: accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, borderRight: `1px solid ${P.border}` }}>
          {ICONS[post.type] || "📱"}
        </div>
        <div style={{ flex: 1, padding: "11px 13px" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: P.ink, lineHeight: 1.4, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.caption}</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>
            <Tag color={accentDeep} bg={accentSoft}>{post.hook || post.type}</Tag>
            {post.hours && <Tag color={P.inkFaint} bg={P.card}>{post.hours}h ago</Tag>}
            <Tag color={perfColor} bg={`${perfColor}18`}>{post.perf === "hot" ? "🔥 Hot" : post.perf === "neutral" ? "〰 Avg" : "❄️ Cold"}</Tag>
          </div>
          {[
            { label: "Likes", val: post.likes, max: maxStat, color: accent },
            { label: "Saves", val: post.saves || 0, max: maxStat / 2, color: P.butterDeep },
            { label: "Cmts", val: post.comments, max: maxStat / 10, color: P.skyDeep },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ fontSize: 9, color: P.inkFaint, width: 28, fontFamily: "'DM Mono',monospace" }}>{s.label}</div>
              <Bar val={s.val} max={s.max} color={s.color} />
              <div style={{ fontSize: 10, color: P.inkMid, width: 40, textAlign: "right", fontFamily: "'DM Mono',monospace" }}>{s.val >= 1000 ? (s.val / 1000).toFixed(1) + "K" : s.val}</div>
            </div>
          ))}
        </div>
      </div>
      {post.hours && post.likes > 1000 && (
        <div style={{ background: `${accent}12`, borderTop: `1px solid ${P.border}`, padding: "6px 13px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: P.inkSoft }}>Viral velocity</span>
          <span style={{ fontSize: 10, color: accentDeep, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{Math.round(post.likes / post.hours).toLocaleString()} likes/hr</span>
        </div>
      )}
    </div>
  );
};

// ── COMMENT CARD ──────────────────────────────────────────────────────────
const CmtCard = ({ c, accent, accentSoft }) => (
  <div style={{ background: accentSoft, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: P.ink, flexShrink: 0 }}>
        {c.user.replace("@", "").charAt(0).toUpperCase()}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: accent }}>{c.user}</div>
        <div style={{ fontSize: 10, color: P.inkFaint }}>{c.platform} · ♥ {c.likes}</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.65, fontStyle: "italic" }}>"{c.text}"</div>
  </div>
);

// ── AI INSIGHTS ───────────────────────────────────────────────────────────
const AIInsight = ({ text, platform }) => (
  <div style={{ background: P.dark, borderRadius: 16, padding: "18px 20px", marginTop: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: P.lavSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✦</div>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a0988c", fontFamily: "'DM Mono',monospace" }}>AI Insight · {platform}</div>
    </div>
    <div style={{ fontSize: 13, color: "#d4ccc4", lineHeight: 1.8, fontFamily: "'Fraunces',serif", fontStyle: "italic" }}>{text}</div>
  </div>
);

// ── WHAT'S WORKING ────────────────────────────────────────────────────────
const WW = ({ working, flopping }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 13, padding: "13px" }}>
      <div style={{ fontSize: 10, color: P.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 7 }}>✓ Working</div>
      <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{working}</div>
    </div>
    <div style={{ background: P.roseSoft, border: `1px solid ${P.rose}`, borderRadius: 13, padding: "13px" }}>
      <div style={{ fontSize: 10, color: P.roseDeep, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 7 }}>✗ Flopping</div>
      <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{flopping}</div>
    </div>
  </div>
);

// ── GLOBE FEED ────────────────────────────────────────────────────────────
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
  const [items, setItems] = useState([]);
  const [followerCount, setFollowerCount] = useState(194);
  const idxRef = useRef(0);
  useEffect(() => {
    const add = () => {
      const e = FEED_EVENTS[idxRef.current % FEED_EVENTS.length];
      idxRef.current++;
      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setItems(prev => [{ ...e, t, id: Date.now() }, ...prev].slice(0, 18));
      if (e.action.includes("followed")) setFollowerCount(c => c + 1);
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
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7a7268", fontFamily: "'DM Mono',monospace" }}>Live Global Activity</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Tile label="Top Country" value="🇺🇸 USA" sub="42% of all activity" color={P.sage} />
        <Tile label="New Followers Today" value={followerCount.toString()} sub="and counting" color={P.lavender} />
        <Tile label="Top City" value="Los Angeles" sub="38% of domestic" color={P.rose} />
        <Tile label="International" value="58%" sub="of today's follows" color={P.butter} />
      </div>

      <SH children="Live Activity Feed" sub="Real-time follows, likes, and saves worldwide" />
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, overflow: "hidden" }}>
        {items.map((e, i) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < items.length - 1 ? `1px solid ${P.borderLight}` : "none" }}>
            <div style={{ fontSize: 18, flexShrink: 0 }}>{e.flag}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: P.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.action}</div>
              <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{e.user} · {e.loc}</div>
            </div>
            <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{e.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── LIVE STUDIO ───────────────────────────────────────────────────────────
const LIVE_COMMENTS = [
  { user: "@hungry_tyler", text: "bro what spot is this???" },
  { user: "@foodieLA_k", text: "this looks incredible omg" },
  { user: "@ramen_fan22", text: "what bowl is that?? the broth color" },
  { user: "@localfoodie_", text: "going tomorrow morning fr" },
  { user: "@socal_eats", text: "you should do korean bbq tacos next" },
  { user: "@la_food_guy", text: "the lighting is so good on this" },
  { user: "@mattfan_2026", text: "how do you order this exactly??" },
  { user: "@japan_tourist", text: "making me miss LA so much" },
];
const GIFTS = [
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
  const [chat, setChat] = useState([]);
  const [giftFeed, setGiftFeed] = useState([]);
  const comIdxRef = useRef(0);
  const giftIdxRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => s + 1);
      setViewers(v => v + Math.floor(Math.random() * 5 - 1));
      setComments(c => c + Math.floor(Math.random() * 3));
      setLikes(l => l + Math.floor(Math.random() * 8));
      if (Math.random() > 0.7) setFollows(f => f + 1);
      if (Math.random() > 0.8) setGifts(g => g + Math.floor(Math.random() * 3));
      if (Math.random() > 0.4) {
        const c = LIVE_COMMENTS[comIdxRef.current % LIVE_COMMENTS.length];
        comIdxRef.current++;
        setChat(prev => [{ ...c, id: Date.now() }, ...prev].slice(0, 12));
      }
      if (Math.random() > 0.85) {
        const g = GIFTS[giftIdxRef.current % GIFTS.length];
        giftIdxRef.current++;
        setGiftFeed(prev => [{ ...g, id: Date.now() }, ...prev].slice(0, 5));
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
          <div style={{ fontSize: 10, color: "#a09080", fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em" }}>LIVE NOW · TIKTOK</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#6a6258", fontFamily: "'DM Mono',monospace" }}>{timer}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Viewers", val: viewers.toLocaleString() },
            { label: "Comments", val: comments.toLocaleString() },
            { label: "Likes", val: (likes / 1000).toFixed(1) + "K" },
          ].map(s => (
            <div key={s.label} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: "#d4ccc4" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#6a6258", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Follows Gained", val: "+" + follows },
            { label: "Total Gifts", val: "$" + gifts },
          ].map(s => (
            <div key={s.label} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: "#d4ccc4" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#6a6258", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: "#7a7268", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Live Chat</div>
        <div style={{ background: "#12100e", borderRadius: 10, padding: "10px 12px", maxHeight: 150, overflowY: "auto" }}>
          {chat.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 6, padding: "4px 0", borderBottom: `1px solid #2a2420`, fontSize: 11 }}>
              <span style={{ color: "#a09080", fontWeight: 600, flexShrink: 0 }}>{c.user}</span>
              <span style={{ color: "#c8c0b4", lineHeight: 1.5 }}>{c.text}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.13em", textTransform: "uppercase", color: "#7a7268", fontFamily: "'DM Mono',monospace", marginBottom: 8, marginTop: 12 }}>Gift Feed</div>
        <div style={{ maxHeight: 90, overflowY: "auto" }}>
          {giftFeed.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid #2a2420`, fontSize: 11 }}>
              <span style={{ fontSize: 16 }}>{g.emoji}</span>
              <span style={{ flex: 1, color: "#c8c0b4" }}>{g.user} sent a {g.name}</span>
              <span style={{ color: P.butterDeep, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{g.val}</span>
            </div>
          ))}
        </div>
      </div>

      <SH children="AI Topic Suggestions" sub="Based on top comment patterns and trend data" />
      {[
        { title: "Answer 'what bowl was that?' — 412 people asked", body: "Top comment across your last 3 ramen videos. Drop the bowl name and ordering instructions live — you'll spike comments instantly.", source: "top comment pattern", color: P.sage },
        { title: "Korean BBQ Tacos — call it out before anyone else does", body: "Trending hard on TikTok Search in SoCal right now. No big food creator has filmed it yet. Mention it live to position yourself first.", source: "TikTok trend radar · rising fast", color: P.lavender },
        { title: "Blindfold challenge — viewer demand is building", body: "Multiple DMs and comments asking you to order blindfolded from a menu you've never seen. Live challenge = high engagement spike.", source: "DM pattern · 6 requests this week", color: P.butter },
      ].map((t, i) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 6 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 8 }}>{t.body}</div>
          <Tag color={P.inkFaint} bg={P.card}>Source: {t.source}</Tag>
        </div>
      ))}
    </div>
  );
};

// ── RETURN TO SPOT ────────────────────────────────────────────────────────
const SPOTS = {
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
    pain: "Comment demand: quesabirria specifically, cheese pull shot, how to order 'the right way'",
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
    angle: "Contrast angle: 'I've had matcha in Tokyo. This is the closest I've found in SoCal.' Aesthetic-forward, minimal talking.",
    script: "Hook: 'I found the most underrated matcha spot in LA and it's not where you think.' Open on the pour.",
    color: P.butter, colorSoft: P.butterSoft,
  },
};

const ReturnToSpot = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const search = () => {
    const q = query.toLowerCase().trim();
    if (!q) { setResults([]); return; }
    const matches = Object.entries(SPOTS).filter(([k, v]) =>
      v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || k.includes(q)
    );
    setResults(matches);
    setSelected(null);
  };

  const s = selected ? SPOTS[selected] : null;

  return (
    <div>
      <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.butterDeep, fontFamily: "'DM Mono',monospace", marginBottom: 10 }}>Return to Spot — Search any restaurant you've filmed</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Type name, city, or hashtag..."
            style={{ flex: 1, border: `1px solid ${P.border}`, borderRadius: 10, padding: "9px 13px", fontSize: 13, background: P.white, color: P.ink, fontFamily: "'DM Sans',sans-serif", outline: "none" }}
          />
          <button onClick={search} style={{ border: `1px solid ${P.border}`, borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: P.white, color: P.ink, fontFamily: "'DM Sans',sans-serif" }}>Search</button>
        </div>
        {results.length > 0 && (
          <div style={{ marginTop: 10, background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
            {results.map(([k, v], i) => (
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
      {Object.entries(SPOTS).map(([k, v]) => (
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
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces',serif", color: P.ink }}>{s.name}</div>
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
            ].map((r, i) => (
              <div key={i} style={{ background: r.bg, border: `1px solid ${r.color}30`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: r.color, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>{r.head}</div>
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

// ── DATA ──────────────────────────────────────────────────────────────────
const REACH_DATA = [12, 18, 14, 22, 19, 28, 31, 26, 38, 42, 35, 51, 48, 63, 71, 58, 82, 94, 87, 110, 103, 128, 141, 163];
const CLIENTS = [
  {
    id: "mason", name: "Mason", role: "Founder · Maison Adari", avatar: "M",
    color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep,
    contentScore: 78, totalFollowers: 6060, totalReach: "16.2K", engagement: "2.8%", weeklyGrowth: "+46",
    goals: [
      { label: "Instagram 10K", current: 4820, goal: 10000, color: P.rose, colorSoft: P.roseSoft, pace: 120, projDate: "Jan 2027" },
      { label: "TikTok 5K", current: 1240, goal: 5000, color: P.sky, colorSoft: P.skySoft, pace: 55, projDate: "Aug 2027" },
    ],
    bestTimes: ["Tues 6–8pm", "Fri 11am–1pm", "Sun 7–9pm"],
    accounts: [
      {
        platform: "Instagram", icon: "📸", handle: "@masonadari",
        followers: 4820, followerDelta: "+34", reach: 12400, engagement: "3.2%",
        color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
        insight: "Your contrarian takes on restaurant marketing outperform lifestyle content by 3.8×. The audience you're building is agency-aware — they save, share, and DM. Priority: increase to 4×/week and test a 'day in the life of an agency owner' series. Your saves-to-follower ratio is top 12% of accounts your size.",
        posts: [
          { caption: "Built my first AI agent — here's how", likes: 312, comments: 28, saves: 94, type: "Reel", perf: "hot", hook: "POV-style opener" },
          { caption: "Cold calling restaurants is a different sport", likes: 187, comments: 41, saves: 88, type: "Carousel", perf: "hot", hook: "Confession hook" },
          { caption: "The Adari Food Engine explained", likes: 241, comments: 33, saves: 112, type: "Carousel", perf: "hot", hook: "Process reveal" },
        ],
        topComments: [
          { user: "@vic.creates", text: "the script you used for that pitch is fire — please share it", likes: 44, platform: "Instagram" },
          { user: "@agencybuilder_", text: "this is exactly what restaurants need and nobody is doing it yet", likes: 28, platform: "Instagram" },
        ],
        working: "Process reveal carousels avg 112 saves — 4× your baseline. Contrarian takes on restaurant marketing drive DMs directly.",
        flopping: "Static posts without text overlay hook lose 60% of potential reach before the algorithm pushes them.",
      },
      {
        platform: "TikTok", icon: "🎵", handle: "@masonadari",
        followers: 1240, followerDelta: "+12", reach: 3800, engagement: "2.1%",
        color: P.sky, colorSoft: P.skySoft, colorDeep: P.skyDeep,
        insight: "POV-style cold call content is the clear winner — 145 shares on the best video signals strong virality potential. The algorithm is starting to recognize your niche. Post 1 video per day for the next 30 days to accelerate the feedback loop.",
        posts: [
          { caption: "POV: you cold call a restaurant at 9am and they pick up", likes: 2100, comments: 88, saves: 310, type: "Video", perf: "hot", hook: "POV-style opener", hours: 18 },
          { caption: "AI agent I built in 20 min — handles my outreach", likes: 940, comments: 31, saves: 188, type: "Video", perf: "neutral", hook: "Time challenge", hours: 72 },
        ],
        topComments: [
          { user: "@builderboy99", text: "what tool is that bro I need this for my agency right now", likes: 18, platform: "TikTok" },
        ],
        working: "POV hooks with cold call content getting strong shares. Raw format wins over produced.",
        flopping: "Talking head with no B-roll loses viewers in seconds 1–3. Over 45s without a mid-hook drops 70% watch time.",
      },
    ],
  },
  {
    id: "matt", name: "Macros Wit Matt", role: "Creator · Food Content", avatar: "B",
    color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
    contentScore: 94, totalFollowers: 53500, totalReach: "184K", engagement: "6.1%", weeklyGrowth: "+238",
    goals: [
      { label: "TikTok 100K", current: 48200, goal: 100000, color: P.sage, colorSoft: P.sageSoft, pace: 820, projDate: "Jul 2026" },
      { label: "Instagram 10K", current: 5300, goal: 10000, color: P.peach, colorSoft: P.peachSoft, pace: 180, projDate: "Oct 2026" },
    ],
    bestTimes: ["Mon 12–2pm", "Thurs 7–9pm", "Sat 10am–12pm"],
    accounts: [
      {
        platform: "TikTok", icon: "🎵", handle: "@macroswitmat",
        followers: 48200, followerDelta: "+194", reach: 163000, engagement: "6.8%",
        color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
        milestones: [
          { label: "Ramen video · 2 hrs", value: "4.1K views", delta: "fastest start ever" },
          { label: "Ramen video · 5 hrs", value: "9.1K views", delta: "top 10% velocity" },
          { label: "Ramen video · 10 hrs", value: "18.2K views", delta: "algorithm push confirmed" },
          { label: "Ramen video · 18 hrs", value: "41K views 🔥", delta: "all-time top 5" },
          { label: "Best comment · 18 hrs", value: "1,240 ♥", delta: "strongest comment ever" },
        ],
        insight: "The negation hook triggers curiosity and argument simultaneously, forcing comments. Your viral velocity is top 2% for food accounts at your size. Priority: batch 5 videos using negation hooks against well-known chains. Zero talking, zero intro — pure food in the first 3 seconds.",
        posts: [
          { caption: "BEST Ramen in LA (not Daikokuya)", likes: 41200, comments: 892, saves: 3800, type: "Video", perf: "hot", hook: "Negation hook", hours: 18 },
          { caption: "This birria spot literally changed my life fr", likes: 28400, comments: 634, saves: 2100, type: "Video", perf: "hot", hook: "Hyperbole emotion", hours: 72 },
          { caption: "Underrated sushi in Torrance nobody talks about", likes: 9800, comments: 201, saves: 740, type: "Video", perf: "neutral", hook: "Secret framing", hours: 120 },
        ],
        topComments: [
          { user: "@hungryinsocal", text: "I went here because of this video and it was EXACTLY like you said omg I'm obsessed", likes: 1240, platform: "TikTok" },
          { user: "@foodieLA_tiff", text: "the way you filmed the broth had me physically running to my car", likes: 876, platform: "TikTok" },
          { user: "@ramenlover99", text: "what bowl was that at the end?? I need the name or I'm losing sleep", likes: 412, platform: "TikTok" },
        ],
        working: "'Best X in [City]' negation hooks averaging 35K+ views. Pure food footage 2.4× better watch time.",
        flopping: "Vlog filler drops watch time to sub-40%. Parking lots and walking clips kill videos immediately.",
      },
      {
        platform: "Instagram", icon: "📸", handle: "@macroswitmat",
        followers: 5300, followerDelta: "+44", reach: 21000, engagement: "4.4%",
        color: P.peach, colorSoft: P.peachSoft, colorDeep: P.peachDeep,
        insight: "Cross-posting TikTok winners to IG Reels generates 35–50% secondary reach on content that already proved itself. Your IG audience shows stronger buyer intent signals than TikTok — lean into saves-focused content.",
        posts: [
          { caption: "BEST Ramen in LA 🍜 (full video on TikTok)", likes: 3800, comments: 120, saves: 440, type: "Reel", perf: "hot", hook: "Cross-platform tease" },
          { caption: "Birria tacos that broke my brain and my diet", likes: 2100, comments: 67, saves: 280, type: "Reel", perf: "hot", hook: "Hyperbole pair" },
        ],
        topComments: [
          { user: "@la_foodie", text: "I drive past this place every day and never went in. Going tomorrow morning.", likes: 234, platform: "Instagram" },
        ],
        working: "Cross-posting proven TikTok content gets 35–50% secondary reach with zero additional filming.",
        flopping: "Static photos without text overlay getting minimal saves. No swipe-bait final slide loses 40% of potential visits.",
      },
    ],
  },
];

const PROSPECTS = [
  { name: "The Patty Lab", handle: "@thepattylabburgers", followers: "3.2K", foodScore: 9.7, socialScore: 1.3, heat: 9.4, lastPost: "6 days ago", note: "Highest food score ever logged. Best burger photography seen organically. Near-zero social with a product that could go viral in one video. Reach out today.", color: P.sage, colorSoft: P.sageSoft },
  { name: "Fuego Birria Tacos", handle: "@fuegobirriatacosofficial", followers: "12.4K", foodScore: 9.2, socialScore: 2.1, heat: 8.8, lastPost: "3 days ago", note: "Food is legitimately top-tier SoCal birria. Zero content strategy. Posts are blurry, no hooks. Perfect AFE candidate.", color: P.peach, colorSoft: P.peachSoft },
  { name: "Niku Niku Ramen", handle: "@nikunikulaofficial", followers: "8.1K", foodScore: 8.4, socialScore: 3.8, heat: 7.2, lastPost: "Yesterday", note: "Posting consistently but hook-less. Massive organic upside untapped.", color: P.lavender, colorSoft: P.lavSoft },
  { name: "Ume Matcha Bar", handle: "@umematchabar", followers: "5.6K", foodScore: 8.1, socialScore: 4.2, heat: 6.8, lastPost: "2 days ago", note: "Strong aesthetic, female-skewing audience. First potential beverage client. Matcha content trending — 2 months behind the wave.", color: P.butter, colorSoft: P.butterSoft },
];

// ── CLIENT VIEW ───────────────────────────────────────────────────────────
const ClientView = ({ client }) => {
  const [openAcc, setOpenAcc] = useState(0);
  return (
    <div>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 18, padding: "16px 18px", marginBottom: 16, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: client.colorSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: client.colorDeep, fontFamily: "'Fraunces',serif", flexShrink: 0 }}>
          {client.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: P.ink }}>{client.name}</div>
          <div style={{ fontSize: 11, color: P.inkSoft }}>{client.role}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <Tag color={client.colorDeep} bg={client.colorSoft}>{client.totalFollowers.toLocaleString()} followers</Tag>
            <Tag color={P.sageDeep} bg={P.sageSoft}>↑ {client.weeklyGrowth} this week</Tag>
          </div>
        </div>
        <Ring val={client.contentScore} color={client.colorDeep} size={50} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 0 }}>
        <Tile label="Total Reach" value={client.totalReach} color={client.color} />
        <Tile label="Avg Engagement" value={client.engagement} color={client.color} />
        <Tile label="Accounts" value={String(client.accounts.length)} color={client.color} />
      </div>

      <SH>Best Times to Post</SH>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: "13px 15px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {client.bestTimes.map((t, i) => <Tag key={i} color={client.colorDeep} bg={client.colorSoft}>⏰ {t}</Tag>)}
      </div>

      <SH>Follower Goals · Progress</SH>
      {client.goals.map((g, i) => <GoalBar key={i} {...g} />)}

      <SH children={`${client.accounts.length} Connected Accounts`} />
      {client.accounts.map((acc, idx) => {
        const isOpen = openAcc === idx;
        return (
          <div key={idx} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, marginBottom: 14, overflow: "hidden" }}>
            <button onClick={() => setOpenAcc(isOpen ? -1 : idx)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: isOpen ? `1px solid ${P.border}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: acc.colorSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{acc.icon}</div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{acc.platform}</div>
                <div style={{ fontSize: 11, color: P.inkSoft }}>{acc.handle}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces',serif", color: P.ink }}>{acc.followers >= 1000 ? (acc.followers / 1000).toFixed(1) + "K" : acc.followers}</div>
                <div style={{ fontSize: 10, color: P.sageDeep }}>{acc.followerDelta} this week</div>
              </div>
              <div style={{ color: P.inkFaint, fontSize: 11, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</div>
            </button>

            {isOpen && (
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 4 }}>
                  <Tile label="Reach" value={acc.reach >= 1000 ? (acc.reach / 1000).toFixed(0) + "K" : String(acc.reach)} color={acc.color} />
                  <Tile label="Engagement" value={acc.engagement} color={acc.color} />
                  <Tile label="Followers" value={acc.followers >= 1000 ? (acc.followers / 1000).toFixed(1) + "K" : String(acc.followers)} color={acc.color} />
                </div>

                {acc.milestones && (
                  <>
                    <SH>Viral Velocity Tracker</SH>
                    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, overflow: "hidden" }}>
                      {acc.milestones.map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < acc.milestones.length - 1 ? `1px solid ${P.borderLight}` : "none" }}>
                          <div>
                            <div style={{ fontSize: 12, color: P.inkMid }}>{m.label}</div>
                            <div style={{ fontSize: 10, color: P.inkFaint, marginTop: 1 }}>{m.delta}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: acc.colorDeep, fontFamily: "'Fraunces',serif" }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <SH children="Recent Posts" sub="Engagement breakdown" />
                {acc.posts.map((p, i) => <PostCard key={i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />)}

                <SH>What's Working · What's Flopping</SH>
                <WW working={acc.working} flopping={acc.flopping} />

                <SH>Top Comments</SH>
                {acc.topComments.map((c, i) => <CmtCard key={i} c={c} accent={acc.colorDeep} accentSoft={acc.colorSoft} />)}

                <SH>AI Strategic Insight</SH>
                <AIInsight text={acc.insight} platform={acc.platform} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function AdariCommandCenter() {
  const [view, setView] = useState("overview");
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const [igData, setIgData] = useState(null);
  const [igLoading, setIgLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/sync/instagram')
      .then(r => r.json())
      .then(d => { setIgData(d); setIgLoading(false); })
      .catch(() => setIgLoading(false));
  }, []);

  const igProfile = igData?.profile;
  const igMedia = igData?.media ?? [];
  const activeClient = CLIENTS.find(c => view === `client:${c.id}`);

  const TABS: { id: string; label: string; color?: string; avatar?: string }[] = [
    { id: "overview", label: "Overview" },
    ...CLIENTS.map(c => ({ id: `client:${c.id}`, label: c.name, color: c.color, avatar: c.avatar })),
    { id: "globe", label: "🌍 Globe" },
    { id: "live", label: "🔴 Live" },
    { id: "spots", label: "📍 Spots" },
    { id: "trends", label: "📈 Trends" },
    { id: "compete", label: "🥊 Competitors" },
    { id: "prospects", label: "🍽 Prospects" },
    { id: "revenue", label: "💰 Revenue" },
    { id: "engine", label: "⚙️ AFE" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: P.cream, color: P.ink, fontFamily: "'DM Sans',sans-serif", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: "16px 18px 0", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: P.inkFaint, fontFamily: "'DM Mono',monospace" }}>Maison Adari · The AFE</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Fraunces',serif", color: P.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Command Center</div>
          </div>
          <div style={{ textAlign: "right", paddingTop: 2 }}>
            <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: "'DM Mono',monospace" }}>{time}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.sageDeep, boxShadow: `0 0 0 2px ${P.sageSoft}` }} />
              <span style={{ fontSize: 10, color: P.sageDeep, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>LIVE</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {TABS.map(tab => {
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{ background: "none", border: "none", borderBottom: active ? `2px solid ${tab.color || P.lavDeep}` : "2px solid transparent", padding: "8px 11px", color: active ? P.ink : P.inkSoft, fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 5, transition: "color 0.15s" }}>
                {tab.avatar && <span style={{ width: 15, height: 15, borderRadius: "50%", background: tab.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: P.ink }}>{tab.avatar}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "18px 18px" }}>

        {/* OVERVIEW */}
        {view === "overview" && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.lavDeep, fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>📰 Morning Briefing · {today}</div>
              <div style={{ fontSize: 14, color: P.inkMid, lineHeight: 1.8, fontStyle: "italic", fontFamily: "'Fraunces',serif" }}>
                "Matt's Ramen video hit <strong style={{ fontStyle: "normal", color: P.ink }}>41K views in 18 hours</strong> — best organic run of the year, top 2% viral velocity. IG engagement up 22% week-over-week. Best hook: <strong style={{ fontStyle: "normal", color: P.ink }}>'BEST Ramen in LA (not Daikokuya)'</strong> — the negation hook is your formula right now. The Patty Lab is the most urgent prospect — highest food score ever logged. <strong style={{ fontStyle: "normal", color: P.ink }}>Trending now:</strong> Korean BBQ tacos spiking on TikTok Search in SoCal — nobody has filmed it yet."
              </div>
            </div>

            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: P.inkFaint, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono',monospace" }}>Combined Reach · 24 days</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces',serif", color: P.ink, marginTop: 2 }}>163K <span style={{ fontSize: 13, color: P.sageDeep, fontWeight: 400 }}>↑ 22% this week</span></div>
                </div>
                <Tag color={P.sageDeep} bg={P.sageSoft}>TikTok + IG</Tag>
              </div>
              <Spark data={REACH_DATA} color={P.lavDeep} h={52} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              <Tile label="Matt's Followers" value="48.2K" sub="↑ +194 this week" color={P.sage}>
                <Spark data={[44, 44.2, 44.8, 45.1, 45.4, 46, 46.4, 46.8, 47.2, 48.2]} color={P.sageDeep} h={28} />
              </Tile>
              <Tile label="Content Score · Matt" color={P.lavender}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <Ring val={94} color={P.lavDeep} size={48} />
                  <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.5 }}>Top 6% of food creators tracked</div>
                </div>
              </Tile>
              <Tile label="Prospects Found" value="4" sub="via burner account" color={P.butter} />
              <Tile label="Mason Engagement" value="3.2%" sub="↑ from 2.8% last week" color={P.rose} />
            </div>

            <SH>This Week's Top Content</SH>
            {[
              { creator: "Macros Wit Matt", platform: "TikTok", caption: "BEST Ramen in LA (not Daikokuya)", likes: 41200, saves: 3800, color: P.sage },
              { creator: "Macros Wit Matt", platform: "TikTok", caption: "This birria spot literally changed my life fr", likes: 28400, saves: 2100, color: P.sage },
              { creator: "Mason", platform: "Instagram", caption: "The Adari Food Engine explained", likes: 241, saves: 112, color: P.lavender },
            ].map((p, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: "11px 14px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: P.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.caption}</div>
                  <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>{p.creator} · {p.platform} · {p.likes >= 1000 ? (p.likes / 1000).toFixed(1) + "K" : p.likes} likes · {p.saves >= 1000 ? (p.saves / 1000).toFixed(1) + "K" : p.saves} saves</div>
                </div>
                <span>🔥</span>
              </div>
            ))}

            <SH children="Why We Do This" sub="Real comments from people you actually moved." />
            {CLIENTS.find(c => c.id === "matt").accounts[0].topComments.map((c, i) => <CmtCard key={i} c={c} accent={P.sageDeep} accentSoft={P.sageSoft} />)}
          </div>
        )}

        {activeClient && <ClientView client={activeClient} />}

        {view === "globe" && <GlobeFeed />}
        {view === "live" && <LiveStudio />}
        {view === "spots" && <ReturnToSpot />}

        {/* TRENDS */}
        {view === "trends" && (
          <div>
            <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.sageDeep, fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>Trend Radar · SoCal Food · Before the Hype</div>
              <p style={{ fontSize: 12, color: P.sageDeep, lineHeight: 1.65 }}>These are rising before they hit mainstream. Film these first and you own the SEO before the crowds arrive.</p>
            </div>
            <SH>TikTok Search — Rising Fast</SH>
            {[
              { rank: 1, name: "Korean BBQ Tacos LA", meta: "TikTok Search · +840% this week · SoCal geo", tag: "🔥 Film now", tagColor: P.sageDeep, tagBg: P.sageSoft },
              { rank: 2, name: "Birria Ramen Fusion", meta: "TikTok + IG · +620% · Under the radar", tag: "🔥 Film now", tagColor: P.sageDeep, tagBg: P.sageSoft },
              { rank: 3, name: "LA Smash Burger hidden gem", meta: "Google Trends · +410% · Accelerating", tag: "↑ Rising", tagColor: P.butterDeep, tagBg: P.butterSoft },
              { rank: 4, name: "Thai Tea Ice Cream rolls", meta: "TikTok FYP · +290% · Just cresting", tag: "↑ Rising", tagColor: P.butterDeep, tagBg: P.butterSoft },
              { rank: 5, name: "Wagyu Beef Dumplings", meta: "IG Explore · +180% · Building momentum", tag: "👁 Watch", tagColor: P.skyDeep, tagBg: P.skySoft },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: "11px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.inkFaint, width: 22, fontFamily: "'DM Mono',monospace" }}>{t.rank}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <Tag color={t.tagColor} bg={t.tagBg}>{t.tag}</Tag>
              </div>
            ))}
            <SH>Google Trends · Food &amp; Drink · California</SH>
            {[
              { q: "Best birria near me", meta: "Google Search · past 7 days · LA+OC", pct: "+890%" },
              { q: "Torrance ramen restaurant", meta: "Google Search · past 7 days · South Bay", pct: "+340%" },
              { q: "matcha dessert Los Angeles", meta: "Google Search · stable trending", pct: "+120%" },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: "11px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
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
        {view === "compete" && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.lavDeep, fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>Competitor Intelligence</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65 }}>Don't copy them. Transform their hooks, topics, and angles into your niche. Compete with them, not against them — and when the time is right, collab.</p>
            </div>
            {[
              {
                name: "LAtryGuy", handle: "@latryguy · 960K YouTube · 287K IG", avatarBg: P.sageSoft, avatarColor: P.sageDeep, initials: "LA",
                hooks: ["'Best [food] in South LA'", "'Hidden gem in [city]'", "'Nobody talks about this spot'"],
                comments: [
                  { text: "You should cover the Korean BBQ taco spot on Olympic — been asking for months", likes: 341, note: "opportunity alert" },
                  { text: "What's the best fried chicken in Inglewood? Cover that next", likes: 218, note: "unserved demand" },
                ],
                play: "LAtryGuy is LA-wide. Matt is hyperlocal South Bay + OC. Own that lane. Their audience is asking for spots outside their usual radius — you're already there.",
                collab: "Collab ready?", color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
              },
              {
                name: "Jack's Dining Room", handle: "@jacksdiningroom · 2.3M TikTok · 3M IG", avatarBg: P.roseSoft, avatarColor: P.roseDeep, initials: "JD",
                hooks: ["'This place did 200+ sandwiches after my video'", "'The restaurant that opened 8 locations'"],
                filming: [
                  { name: "NYC Korean fried chicken", meta: "Posted 2 days ago · 1.2M views" },
                  { name: "Hidden dumpling spot, Flushing", meta: "Posted 5 days ago · 880K views" },
                ],
                play: "Jack does NYC. You do SoCal. Same energy, different coast. His Korean fried chicken video is at 1.2M — film the best Korean fried chicken in Torrance or OC this week and ride the algorithm wave he just created.",
                collab: "Dream collab", color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
              },
              {
                name: "Gareth Eats", handle: "@garetheats · 750K YouTube · San Diego", avatarBg: P.butterSoft, avatarColor: P.butterDeep, initials: "GE",
                play: "Gareth owns San Diego. You own South Bay and OC. The overlap is the 405 corridor — film a joint 'LA vs SD [food]' video. Pitch: 'Same food, different county — who wins?'",
                collab: "SD collab opp", color: P.butter, colorSoft: P.butterSoft, colorDeep: P.butterDeep,
              },
            ].map((comp, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, padding: "16px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: comp.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: comp.avatarColor, flexShrink: 0 }}>{comp.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Fraunces',serif" }}>{comp.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft }}>{comp.handle}</div>
                  </div>
                  <Tag color={comp.colorDeep} bg={comp.colorSoft}>{comp.collab}</Tag>
                </div>
                {comp.hooks && (
                  <>
                    <SH children="Their Hooks — Transform for Your Niche" />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 4 }}>
                      {comp.hooks.map((h, j) => <Tag key={j} color={comp.colorDeep} bg={comp.colorSoft}>{h}</Tag>)}
                    </div>
                  </>
                )}
                {comp.comments && (
                  <>
                    <SH>Demand in Their Comments — Your Opportunity</SH>
                    {comp.comments.map((c, j) => (
                      <div key={j} style={{ background: comp.colorSoft, borderRadius: 10, padding: "10px 12px", marginBottom: 7 }}>
                        <div style={{ fontSize: 12, color: P.inkMid, fontStyle: "italic" }}>"{c.text}"</div>
                        <div style={{ fontSize: 10, color: comp.colorDeep, marginTop: 5 }}>♥ {c.likes} · {c.note}</div>
                      </div>
                    ))}
                  </>
                )}
                {comp.filming && (
                  <>
                    <SH>What They're Filming This Week</SH>
                    {comp.filming.map((f, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: j < comp.filming.length - 1 ? `1px solid ${P.borderLight}` : "none" }}>
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
        {view === "prospects" && (
          <div>
            <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.butterDeep, fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>Burner Account · Active · SoCal</div>
              <p style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.75 }}>Monitoring 47 accounts in LA, OC, and San Diego. 4 high-priority prospects surfaced this week — sorted by Heat Score.</p>
            </div>
            {[...PROSPECTS].sort((a, b) => b.heat - a.heat).map((p, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${p.color}`, borderRadius: 14, padding: "15px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces',serif" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>{p.handle} · {p.followers} followers · {p.lastPost}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>Heat Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Fraunces',serif", color: p.color }}>{p.heat}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>Food Quality</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Bar val={p.foodScore} max={10} color={P.sageDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.sageDeep, fontFamily: "'Fraunces',serif" }}>{p.foodScore}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>Social Presence</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Bar val={p.socialScore} max={10} color={P.roseDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.roseDeep, fontFamily: "'Fraunces',serif" }}>{p.socialScore}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 12 }}>{p.note}</div>
                <button style={{ background: p.colorSoft, border: `1px solid ${p.color}`, borderRadius: 20, padding: "8px 18px", color: P.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Reach Out via Maison Adari →</button>
              </div>
            ))}
          </div>
        )}

        {/* REVENUE */}
        {view === "revenue" && (
          <div>
            <div style={{ background: P.dark, borderRadius: 18, padding: "20px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7a7268", fontFamily: "'DM Mono',monospace", marginBottom: 12 }}>✦ Agency Revenue · Maison Adari</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Billed This Month", value: "$0", sub: "0 active clients", color: P.sage },
                  { label: "Pipeline Value", value: "$2,400", sub: "4 prospects identified", color: P.lavender },
                  { label: "Projected (1 Client)", value: "$800/mo", sub: "Standard AFE rate", color: P.butter },
                  { label: "Monthly Target", value: "$5,000", sub: "6 clients @ $800", color: P.rose },
                ].map((s, i) => (
                  <div key={i} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 13, padding: "14px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 10, color: "#7a7268", textTransform: "uppercase", letterSpacing: "0.09em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Fraunces',serif", color: "#f0e8dc" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#6a6258", marginTop: 3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: "#7a7268", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>Progress to $5K/mo Target</div>
                <div style={{ background: P.darkBorder, borderRadius: 99, height: 8 }}>
                  <div style={{ background: P.sage, height: 8, width: "0%", borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 11, color: "#7a7268", marginTop: 6, fontStyle: "italic" }}>First client unlocks the flywheel. Everything after is momentum.</div>
              </div>
            </div>
            <SH>Pricing Tiers</SH>
            {[
              { tier: "Starter", price: "$500/mo", desc: "2 posts/week, monthly report, basic analytics", color: P.sage },
              { tier: "Growth", price: "$800/mo", desc: "4 posts/week, weekly report, competitor analysis, hook strategy", color: P.lavender },
              { tier: "Pro", price: "$1,200/mo", desc: "Daily content, live dashboard access, creator DM agent, full AFE deployment", color: P.rose },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 13, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Fraunces',serif" }}>{t.tier}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Fraunces',serif", color: t.color }}>{t.price}</div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid }}>{t.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* AFE ENGINE */}
        {view === "engine" && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 18, padding: "18px 20px", marginBottom: 22 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: P.lavDeep, fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>The Adari Food Engine</div>
              <div style={{ fontSize: 15, fontFamily: "'Fraunces',serif", color: P.ink, lineHeight: 1.75, fontStyle: "italic" }}>"We don't post content. We engineer virality. Every frame, hook, and caption is built to make the food so compelling it forces the viewer to act — visit, share, or remember."</div>
            </div>
            {[
              { step: "01", label: "Identify", desc: "Burner account surfaces restaurants with exceptional food and underdeveloped social. We find the gap before someone else does.", color: P.lavender, colorDeep: P.lavDeep },
              { step: "02", label: "Outreach", desc: "Value-first cold call + tailored DM. We lead with what we see, not what we sell.", color: P.rose, colorDeep: P.roseDeep },
              { step: "03", label: "Analyze", desc: "Apify scrapes top hooks in their niche. We identify psychology triggers, content gaps, and exactly where the algorithm is rewarding.", color: P.peach, colorDeep: P.peachDeep },
              { step: "04", label: "Execute", desc: "Weekly short-form content built purely off data. Nothing random, nothing guessed.", color: P.sage, colorDeep: P.sageDeep },
              { step: "05", label: "Report", desc: "Live dashboard showing client growth, winners, top comments, and milestone tracking updated every 24 hours.", color: P.butter, colorDeep: P.butterDeep },
              { step: "06", label: "Scale", desc: "Creator DM agent handles inbound, qualifies by niche + follower count, and books slots to the client's calendar automatically.", color: P.sky, colorDeep: P.skyDeep },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "flex", gap: 13, marginBottom: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "'DM Mono',monospace", color: P.ink, fontWeight: 500, flexShrink: 0 }}>{s.step}</div>
                  {i < 5 && <div style={{ width: 2, flex: 1, background: P.borderLight, marginTop: 4, minHeight: 16 }} />}
                </div>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: "13px 15px", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.colorDeep, fontFamily: "'Fraunces',serif", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
            <SH children="Agent Ideas to Build" sub="What Maison Adari should deploy next" />
            {[
              { title: "Creator DM Agent", desc: "Monitors incoming DMs, checks follower count + niche fit, auto-responds with rate card and dates. Books to calendar.", tag: "High Value", color: P.sage },
              { title: "Menu Drop Scheduler", desc: "When a restaurant drops a new item, generates 3 hook variations, selects the data-winner, and queues for posting.", tag: "Time-Saving", color: P.lavender },
              { title: "Review Aggregator", desc: "Pulls Yelp + Google reviews weekly, surfaces best quotes for captions, flags negative sentiment before it's a PR issue.", tag: "Reputation", color: P.butter },
              { title: "Missed Call VAPI Agent", desc: "Answers calls when the owner can't. Takes orders, answers hours/location, logs everything to a daily digest.", tag: "Revenue", color: P.rose },
              { title: "Hook A/B Tester", desc: "Posts two versions with different hooks, tracks reach in the first 2 hours, boosts the winner automatically.", tag: "Growth", color: P.sky },
            ].map((idea, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `3px solid ${idea.color}`, borderRadius: 13, padding: "13px 15px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
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