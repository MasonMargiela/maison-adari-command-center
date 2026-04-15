#!/usr/bin/env python3
"""
Fix script for Maison Adari Command Center overview tab.
Run: python3 fix_overview.py
"""

FIX_COMPONENTS = '''
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
  { id: 'sec', label: 'sec', mult: 0.000165 },
  { id: 'min', label: 'min', mult: 0.0099 },
  { id: 'day', label: 'day', mult: 0.143 },
  { id: 'week', label: 'wk', mult: 1 },
  { id: 'month', label: 'mo', mult: 4.33 },
  { id: 'year', label: 'yr', mult: 52 },
];

function applyTimePeriod(weeklyDelta: number, periodId: string): { value: number; label: string } {
  const p = TIME_PERIODS.find(t => t.id === periodId) ?? TIME_PERIODS[3];
  const value = Math.round(weeklyDelta * p.mult);
  const labels: Record<string, string> = { sec: 'per sec', min: 'per min', day: 'today', week: 'this week', month: 'this month', year: 'this year' };
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
  const [timePeriod, setTimePeriod] = useState('week');
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

'''

import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Find and replace the existing overview/person/pie components
# We need to replace everything from the PieChart comment to the IGAccountView comment
start_marker = '// ── PIE CHART ─────────────────────────────────────────────────────────────'
end_marker = '// ── INSTAGRAM ACCOUNT VIEW ─────────────────────────────────────────────────'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    # Components don't exist yet, insert before IGAccountView
    content = content.replace(end_marker, FIX_COMPONENTS + end_marker)
    print("Inserted new components before IGAccountView")
elif end_idx == -1:
    print("ERROR: Could not find IGAccountView marker")
    exit(1)
else:
    # Replace everything between the markers
    content = content[:start_idx] + FIX_COMPONENTS + content[end_idx:]
    print("Replaced existing overview components")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("Done — run: npm run build && npx vercel --prod")
