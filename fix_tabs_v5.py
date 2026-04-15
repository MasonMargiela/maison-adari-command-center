#!/usr/bin/env python3
"""
Replaces Globe, Live, Spots, Trends, Competitors, Prospects, Revenue tab content
in app/page.tsx with the exact content from adari-v5-final.
Touches nothing else.
Run: python3 fix_tabs_v5.py
"""

# ── NEW COMPONENT CODE FROM V5-FINAL ──────────────────────────────────────

NEW_GLOBE_FEED = '''const GlobeFeed = () => {
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
'''

NEW_LIVE_STUDIO = '''const LIVE_COMMENTS_V5 = [
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
'''

NEW_RETURN_TO_SPOT = '''const SPOTS_V5: Record<string, any> = {
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
              { head: "What They Asked For", body: `"${s.topComment}" · ♥ ${s.commentLikes}\\n\\n${s.pain}`, color: P.sageDeep, bg: P.sageSoft },
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
'''

# ── ALSO UPDATE THE FEED_EVENTS CONSTANT ──────────────────────────────────
FEED_EVENTS_CONST = '''const FEED_EVENTS = [
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

'''

with open('app/page.tsx', 'r') as f:
    content = f.read()

# ── STEP 1: Replace GlobeFeed component ───────────────────────────────────
globe_start = content.find('const GlobeFeed = () => {')
globe_end = content.find('\nconst LiveStudio = ', globe_start)
if globe_start == -1 or globe_end == -1:
    print(f"ERROR: GlobeFeed bounds: start={globe_start}, end={globe_end}")
    exit(1)

# Also check for FEED_EVENTS constant before GlobeFeed
feed_events_start = content.find('const FEED_EVENTS = [')
if feed_events_start != -1 and feed_events_start < globe_start:
    # Replace from FEED_EVENTS through end of GlobeFeed
    content = content[:feed_events_start] + FEED_EVENTS_CONST + NEW_GLOBE_FEED + content[globe_end:]
    print("✓ Replaced FEED_EVENTS + GlobeFeed")
else:
    content = content[:globe_start] + FEED_EVENTS_CONST + NEW_GLOBE_FEED + content[globe_end:]
    print("✓ Replaced GlobeFeed (added FEED_EVENTS)")

# ── STEP 2: Replace LiveStudio component ──────────────────────────────────
live_start = content.find('const LiveStudio = () => {')
if live_start == -1:
    # Check for LIVE_COMMENTS or GIFTS before it
    live_start = content.find('const LIVE_COMMENTS')
    if live_start == -1:
        live_start = content.find('const LIVE_COMMENTS_V5')
live_end = content.find('\nconst ReturnToSpot = ', live_start)
if live_start == -1 or live_end == -1:
    print(f"ERROR: LiveStudio bounds: start={live_start}, end={live_end}")
    exit(1)
content = content[:live_start] + NEW_LIVE_STUDIO + content[live_end:]
print("✓ Replaced LiveStudio")

# ── STEP 3: Replace ReturnToSpot component ────────────────────────────────
spots_start = content.find('const ReturnToSpot = () => {')
if spots_start == -1:
    spots_start = content.find('const SPOTS')
    if spots_start == -1:
        spots_start = content.find('const SPOTS_V5')
spots_end = content.find('\nconst PROSPECTS = ', spots_start)
if spots_end == -1:
    spots_end = content.find('\nconst CLIENTS = ', spots_start)
if spots_start == -1 or spots_end == -1:
    print(f"ERROR: ReturnToSpot bounds: start={spots_start}, end={spots_end}")
    exit(1)
content = content[:spots_start] + NEW_RETURN_TO_SPOT + content[spots_end:]
print("✓ Replaced ReturnToSpot")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\nDone! Run: npm run build && npx vercel --prod")
