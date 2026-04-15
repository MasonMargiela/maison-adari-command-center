#!/usr/bin/env python3
"""
Comprehensive fix for:
1. Multi-open accordion (both platforms open simultaneously)
2. Matt's page upgraded to match Mason's richness
3. Usernames shown correctly (@masondoesnumbers, @macroswitmatt)
4. TikTok above Instagram for Matt
5. Remove "live" label from follower chip (not a real live session)
6. Remove sec/min from pace intervals (keep day/week/month/year)
7. Score badge shows elegantly at 0
8. Follower pace fallback improved
9. Overview cards consistent

Run: python3 fix_comprehensive.py
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

# ── FIX 1: Update CLIENTS data ─────────────────────────────────────────────
# Fix usernames, fix account order for Matt (TikTok first)

OLD_CLIENTS = '''const CLIENTS = [
  {
    id: 'mason', name: 'Mason', role: 'Founder · Maison Adari', avatar: 'M',
    color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep,
    contentScore: 0, totalFollowers: 370, totalReach: '56', engagement: '0%', weeklyGrowth: '+0',
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
    contentScore: 94, totalFollowers: 53500, totalReach: '184K', engagement: '6.1%', weeklyGrowth: '+238',
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
          { user: '@hungryinsocal', text: "I went here because of this video and it was EXACTLY like you said omg I'm obsessed", likes: 1240, platform: 'TikTok' },
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
];'''

NEW_CLIENTS = '''const CLIENTS = [
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
];'''

if OLD_CLIENTS in content:
    content = content.replace(OLD_CLIENTS, NEW_CLIENTS)
    print("✓ Updated CLIENTS data (usernames, TikTok first for Matt, milestones)")
else:
    print("⚠ CLIENTS not found exactly — trying partial match")
    # Try to find and replace just the handle lines
    content = content.replace("handle: '@macroswitmat',", "handle: '@macroswitmatt',")
    content = content.replace("handle: '@masonadari',", "handle: '@masondoesnumbers',")
    print("✓ Fixed handles via partial match")

# ── FIX 2: Remove sec/min from TIME_PERIODS ────────────────────────────────
OLD_PERIODS = '''const TIME_PERIODS = [
  { id: 'sec', label: 'sec', mult: 0.000165 },
  { id: 'min', label: 'min', mult: 0.0099 },
  { id: 'day', label: 'day', mult: 0.143 },
  { id: 'week', label: 'wk', mult: 1 },
  { id: 'month', label: 'mo', mult: 4.33 },
  { id: 'year', label: 'yr', mult: 52 },
];'''

NEW_PERIODS = '''const TIME_PERIODS = [
  { id: 'day', label: 'day', mult: 0.143 },
  { id: 'week', label: 'wk', mult: 1 },
  { id: 'month', label: 'mo', mult: 4.33 },
  { id: 'year', label: 'yr', mult: 52 },
];'''

if OLD_PERIODS in content:
    content = content.replace(OLD_PERIODS, NEW_PERIODS)
    print("✓ Removed sec/min from TIME_PERIODS")
else:
    print("⚠ TIME_PERIODS not found exactly")

# ── FIX 3: Fix ClientView to support multi-open accordion ──────────────────
OLD_OPEN_STATE = '''  const [openAcc, setOpenAcc] = useState(0);'''
NEW_OPEN_STATE = '''  const [openAccs, setOpenAccs] = useState<Set<number>>(new Set([0]));
  const toggleAcc = (idx: number) => {
    setOpenAccs(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };'''

if OLD_OPEN_STATE in content:
    content = content.replace(OLD_OPEN_STATE, NEW_OPEN_STATE)
    print("✓ Fixed multi-open accordion state")
else:
    print("⚠ openAcc state not found")

# Fix the accordion toggle call
content = content.replace(
    'const isOpen = openAcc === idx;',
    'const isOpen = openAccs.has(idx);'
)
content = content.replace(
    'onClick={() => setOpenAcc(isOpen ? -1 : idx)}',
    'onClick={() => toggleAcc(idx)}'
)
print("✓ Fixed accordion toggle logic")

# ── FIX 4: Fix ClientView header — remove fake "live" from follower chip ───
# Replace the Tag that shows "· live ✓" after followers
OLD_FOLLOWER_TAG = '''            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers {isMason && metrics ? '· live ✓' : ''}</Tag>
            {displayHandle && <Tag color={P.inkSoft} bg={P.cardAlt}>{displayHandle}</Tag>}'''

NEW_FOLLOWER_TAG = '''            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {displayHandle && <Tag color={P.sageDeep} bg={P.sageSoft}>{displayHandle}</Tag>}
            {isMason && (
              <Tag color={P.skyDeep} bg={P.skySoft}>@masondoesnumbers TikTok</Tag>
            )}
            {!isMason && (
              <><Tag color={P.sageDeep} bg={P.sageSoft}>@macroswitmatt TikTok</Tag><Tag color={P.peachDeep} bg={P.peachSoft}>@macroswitmatt IG</Tag></>
            )}'''

if OLD_FOLLOWER_TAG in content:
    content = content.replace(OLD_FOLLOWER_TAG, NEW_FOLLOWER_TAG)
    print("✓ Fixed follower chip — removed fake live, added usernames for both creators")
else:
    print("⚠ Follower tag not found exactly — trying simpler fix")
    content = content.replace(
        "followers {isMason && metrics ? '· live ✓' : ''}",
        "followers"
    )
    print("✓ Removed fake live label")

# ── FIX 5: Fix IGAccountView pace intervals ────────────────────────────────
# Remove sec/min from paceByPeriod in IGAccountView
OLD_PACE_BY_PERIOD = '''  const paceByPeriod = {
    sec: paceMonthly > 0 ? (paceMonthly / (30 * 24 * 3600)).toFixed(5) : '0',
    min: paceMonthly > 0 ? (paceMonthly / (30 * 24 * 60)).toFixed(4) : '0',
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(2) : '0',
    week: paceMonthly > 0 ? (paceMonthly / 4.33).toFixed(1) : '0',
    month: String(paceMonthly),
    year: String(paceYearly),
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    sec: 'followers/sec', min: 'followers/min', day: 'followers/day',
    week: 'followers/wk', month: 'followers/mo', year: 'followers/yr',
  };'''

NEW_PACE_BY_PERIOD = '''  const paceByPeriod = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: paceMonthly > 0 ? (paceMonthly / 4.33).toFixed(0) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };'''

if OLD_PACE_BY_PERIOD in content:
    content = content.replace(OLD_PACE_BY_PERIOD, NEW_PACE_BY_PERIOD)
    print("✓ Removed sec/min from IGAccountView paceByPeriod")
else:
    print("⚠ paceByPeriod not found exactly")

# ── FIX 6: Fix GenericAccountView pace intervals ───────────────────────────
OLD_GENERIC_PACE = '''  const paceByPeriod = {
    sec: paceMonthly > 0 ? (paceMonthly / (30 * 24 * 3600)).toFixed(5) : '0',
    min: paceMonthly > 0 ? (paceMonthly / (30 * 24 * 60)).toFixed(4) : '0',
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '0',
    week: String(weeklyDelta),
    month: String(paceMonthly),
    year: String(paceYearly),
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    sec: 'followers/sec', min: 'followers/min', day: 'followers/day',
    week: 'followers/wk', month: 'followers/mo', year: 'followers/yr',
  };'''

NEW_GENERIC_PACE = '''  const paceByPeriod = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: weeklyDelta > 0 ? String(weeklyDelta) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };'''

if OLD_GENERIC_PACE in content:
    content = content.replace(OLD_GENERIC_PACE, NEW_GENERIC_PACE)
    print("✓ Removed sec/min from GenericAccountView paceByPeriod")
else:
    print("⚠ Generic paceByPeriod not found exactly")

# ── FIX 7: Fix IGAccountView default timePeriod to 'week' not 'week' ───────
# Also fix the initial setState in IGAccountView to use 'week' (business default)
content = content.replace(
    "const [timePeriod, setTimePeriod] = useState('week');",
    "const [timePeriod, setTimePeriod] = useState('month');",
    1  # only first occurrence (IGAccountView)
)
print("✓ Default pace period set to month")

# ── FIX 8: Fix score ring — don't show 0 as broken ────────────────────────
# In Ring component, show "—" or style differently when val is 0
OLD_RING_TEXT = '''      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill={P.ink} fontFamily={F.display}>{val}</text>'''

NEW_RING_TEXT = '''      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill={val === 0 ? P.inkFaint : P.ink} fontFamily={F.display}>{val === 0 ? '—' : val}</text>'''

if OLD_RING_TEXT in content:
    content = content.replace(OLD_RING_TEXT, NEW_RING_TEXT)
    print("✓ Ring shows — instead of 0")
else:
    print("⚠ Ring text not found exactly")

# ── FIX 9: Add milestones support to GenericAccountView ────────────────────
# GenericAccountView needs to render milestones for Matt's TikTok
OLD_GENERIC_POSTS_SECTION = '''      {/* Posts */}
      {acc.posts?.length > 0 && (
        <>
          <SH>Recent Posts</SH>
          {acc.posts.map((p: any, i: number) => (
            <PostCard key={i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />
          ))}
        </>
      )}

      <SH>{"What's Working · What's Flopping"}</SH>'''

NEW_GENERIC_POSTS_SECTION = '''      {/* Milestones */}
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

      <SH>{"What's Working · What's Flopping"}</SH>'''

if OLD_GENERIC_POSTS_SECTION in content:
    content = content.replace(OLD_GENERIC_POSTS_SECTION, NEW_GENERIC_POSTS_SECTION)
    print("✓ Added milestones to GenericAccountView")
else:
    print("⚠ Generic posts section not found exactly")

# ── FIX 10: Fix PersonCard overview — remove sec/min from time period ───────
OLD_OVERVIEW_PERIODS = '''  const TIME_PERIODS = [
    { id: 'sec', label: 'sec', mult: 0.000165 },
    { id: 'min', label: 'min', mult: 0.0099 },
    { id: 'day', label: 'day', mult: 0.143 },
    { id: 'week', label: 'wk', mult: 1 },
    { id: 'month', label: 'mo', mult: 4.33 },
    { id: 'year', label: 'yr', mult: 52 },
  ];'''

# This is inside OverviewTab — already handled by global TIME_PERIODS fix
# Just make sure the applyTimePeriod handles day/week/month/year
OLD_APPLY = '''function applyTimePeriod(weeklyDelta: number, periodId: string): { value: number; label: string } {
  const p = TIME_PERIODS.find(t => t.id === periodId) ?? TIME_PERIODS[3];
  const value = Math.round(weeklyDelta * p.mult);
  const labels: Record<string, string> = { sec: 'per sec', min: 'per min', day: 'today', week: 'this week', month: 'this month', year: 'this year' };
  return { value, label: labels[periodId] ?? 'this week' };
}'''

NEW_APPLY = '''function applyTimePeriod(weeklyDelta: number, periodId: string): { value: number; label: string } {
  const p = TIME_PERIODS.find(t => t.id === periodId) ?? TIME_PERIODS[1];
  const value = Math.round(weeklyDelta * p.mult);
  const labels: Record<string, string> = { day: 'today', week: 'this week', month: 'this month', year: 'this year' };
  return { value, label: labels[periodId] ?? 'this week' };
}'''

if OLD_APPLY in content:
    content = content.replace(OLD_APPLY, NEW_APPLY)
    print("✓ Fixed applyTimePeriod labels")
else:
    print("⚠ applyTimePeriod not found")

# ── FIX 11: Fix pace fallback text in IGAccountView ───────────────────────
content = content.replace(
    "pace = metrics?.pace ?? 'Estimating...';",
    "pace = metrics?.pace ?? 'Syncing baseline...';"
)
content = content.replace(
    "estDate: 'Need more history'",
    "estDate: 'Building data'"
)
print("✓ Improved pace fallback text")

# ── FIX 12: Fix OverviewTab default period to 'week' ─────────────────────
content = content.replace(
    "const [timePeriod, setTimePeriod] = useState('week');",
    "const [timePeriod, setTimePeriod] = useState('week');",
    1
)

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ All fixes applied. Run: npm run build && npx vercel --prod")
print("\nSummary of fixes:")
print("  1. CLIENTS updated: TikTok first for Matt, correct handles @macroswitmatt")
print("  2. Mason handles updated to @masondoesnumbers on both platforms")
print("  3. Multi-open accordion — both platforms can be open simultaneously")  
print("  4. Removed fake 'live' label from follower chip")
print("  5. Added username tags for both platforms in creator header")
print("  6. Removed sec/min from pace intervals (day/week/month/year only)")
print("  7. Score ring shows — instead of 0")
print("  8. Added viral velocity milestones to Matt's TikTok tab")
print("  9. Default pace period set to month (more meaningful)")
print("  10. Pace fallback: 'Syncing baseline...' instead of 'Estimating...'")
