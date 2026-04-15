#!/usr/bin/env python3
"""
Final comprehensive fix. Reads your actual current page.tsx and applies all fixes.
Run: python3 fix_final.py
"""
import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

changes = []

# ── 1. Reorder Mason accounts: TikTok first ──────────────────────────────
old = '''      {
        platform: 'Instagram', icon: '📸', handle: '@masondoesnumbers','''
new_before_tiktok = '''      {
        platform: 'TikTok', icon: '🎵', handle: '@masondoesnumbers',
        followers: 0, followerDelta: '+0', reach: 0, engagement: '—',
        color: P.sky, colorSoft: P.skySoft, colorDeep: P.skyDeep,
        insight: 'TikTok not yet connected. Once connected, POV cold call content and agency process content will be tracked here.',
        posts: [],
        topComments: [],
        working: 'Connect TikTok to see analytics.',
        flopping: 'Connect TikTok to see analytics.',
      },
      {
        platform: 'Instagram', icon: '📸', handle: '@masondoesnumbers','''
# Only do this if TikTok is not already first for Mason
mason_section = content[content.find("id: 'mason'"):content.find("id: 'matt'")]
if mason_section.find("platform: 'TikTok'") > mason_section.find("platform: 'Instagram'"):
    # TikTok comes after Instagram — need to reorder
    # Find and remove the TikTok block from Mason, then insert before Instagram
    tiktok_pattern = r"      \{\n        platform: 'TikTok', icon: '🎵', handle: '@masondoesnumbers',.*?      \},\n      \{\n        platform: 'Instagram'"
    match = re.search(tiktok_pattern, content[:content.find("id: 'matt'")], re.DOTALL)
    if match:
        # Extract just TikTok block
        tiktok_block = match.group(0).replace("\n      {\n        platform: 'Instagram'", "")
        # Remove it from current position
        content = content[:match.start()] + "      {\n        platform: 'Instagram'" + content[match.end():]
        # Insert before Instagram block for Mason
        ig_mason_idx = content.find("platform: 'Instagram', icon: '📸', handle: '@masondoesnumbers'")
        insert_at = content.rfind('      {', 0, ig_mason_idx)
        content = content[:insert_at] + tiktok_block + "\n" + content[insert_at:]
        changes.append("Reordered Mason accounts: TikTok first")

# ── 2. Fix Matt's Instagram handle ──────────────────────────────────────────
content = content.replace("handle: '@macroswitmat',", "handle: '@macroswitmatt',")
content = content.replace("handle: '@macroswitmat'", "handle: '@macroswitmatt'")
changes.append("Fixed Matt's handle to @macroswitmatt")

# ── 3. Fix Mason's TikTok handle ─────────────────────────────────────────────
content = content.replace("handle: '@masonadari',", "handle: '@masondoesnumbers',")
changes.append("Fixed Mason TikTok handle to @masondoesnumbers")

# ── 4. Remove sec/min from TIME_PERIODS everywhere ──────────────────────────
old_periods = """const TIME_PERIODS = [
  { id: 'sec', label: 'sec', mult: 0.000165 },
  { id: 'min', label: 'min', mult: 0.0099 },
  { id: 'day', label: 'day', mult: 0.143 },
  { id: 'week', label: 'wk', mult: 1 },
  { id: 'month', label: 'mo', mult: 4.33 },
  { id: 'year', label: 'yr', mult: 52 },
];"""
new_periods = """const TIME_PERIODS = [
  { id: 'day', label: 'day', mult: 0.143 },
  { id: 'week', label: 'wk', mult: 1 },
  { id: 'month', label: 'mo', mult: 4.33 },
  { id: 'year', label: 'yr', mult: 52 },
];"""
if old_periods in content:
    content = content.replace(old_periods, new_periods)
    changes.append("Removed sec/min from TIME_PERIODS")

# ── 5. Fix applyTimePeriod fallback index ────────────────────────────────────
content = content.replace(
    "TIME_PERIODS.find(t => t.id === periodId) ?? TIME_PERIODS[3]",
    "TIME_PERIODS.find(t => t.id === periodId) ?? TIME_PERIODS[1]"
)
content = content.replace(
    "{ sec: 'per sec', min: 'per min', day: 'today', week: 'this week', month: 'this month', year: 'this year' }",
    "{ day: 'today', week: 'this week', month: 'this month', year: 'this year' }"
)

# ── 6. Fix paceByPeriod in IGAccountView — remove sec/min ──────────────────
old_pace = """  const paceByPeriod = {
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
  };"""
new_pace = """  const paceByPeriod = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: paceMonthly > 0 ? (paceMonthly / 4.33).toFixed(0) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };"""
if old_pace in content:
    content = content.replace(old_pace, new_pace)
    changes.append("Removed sec/min from IGAccountView paceByPeriod")

# ── 7. Fix GenericAccountView paceByPeriod ──────────────────────────────────
old_gen_pace = """  const paceByPeriod = {
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
  };"""
new_gen_pace = """  const paceByPeriod = {
    day: paceMonthly > 0 ? (paceMonthly / 30).toFixed(1) : '—',
    week: weeklyDelta > 0 ? String(weeklyDelta) : '—',
    month: paceMonthly > 0 ? String(paceMonthly) : '—',
    year: paceYearly > 0 ? String(paceYearly) : '—',
  } as Record<string, string>;

  const paceLabels: Record<string, string> = {
    day: 'per day', week: 'per week', month: 'per month', year: 'per year',
  };"""
if old_gen_pace in content:
    content = content.replace(old_gen_pace, new_gen_pace)
    changes.append("Removed sec/min from GenericAccountView paceByPeriod")

# ── 8. Fix multi-open accordion in ClientView ──────────────────────────────
old_state = "  const [openAcc, setOpenAcc] = useState(0);"
new_state = """  const [openAccs, setOpenAccs] = useState<Set<number>>(new Set([0]));
  const toggleAcc = (idx: number) => setOpenAccs(prev => {
    const s = new Set(prev);
    s.has(idx) ? s.delete(idx) : s.add(idx);
    return new Set(s);
  });"""
if old_state in content:
    content = content.replace(old_state, new_state)
    changes.append("Fixed multi-open accordion")

content = content.replace("const isOpen = openAcc === idx;", "const isOpen = openAccs.has(idx);")
content = content.replace(
    "onClick={() => setOpenAcc(isOpen ? -1 : idx)}",
    "onClick={() => toggleAcc(idx)}"
)

# ── 9. Remove fake "live" from follower chip ─────────────────────────────────
content = content.replace(
    "followers {isMason && metrics ? '· live ✓' : ''}",
    "followers"
)
content = content.replace(
    "{fmtNum(displayFollowers)} followers {isMason && metrics ? '· live ✓' : ''}",
    "{fmtNum(displayFollowers)} followers"
)
changes.append("Removed fake live label from follower chip")

# ── 10. Add Matt milestones to GenericAccountView ──────────────────────────
old_generic_posts = """      {/* Posts */}
      {acc.posts?.length > 0 && (
        <>
          <SH>Recent Posts</SH>
          {acc.posts.map((p: any, i: number) => (
            <PostCard key={i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />
          ))}
        </>
      )}

      <SH>{"What's Working · What's Flopping"}</SH>"""
new_generic_posts = """      {/* Milestones */}
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
      {acc.posts?.length > 0 && (
        <>
          <SH>Recent Posts</SH>
          {acc.posts.map((p: any, i: number) => (
            <PostCard key={i} post={p} accent={acc.color} accentSoft={acc.colorSoft} accentDeep={acc.colorDeep} />
          ))}
        </>
      )}

      <SH>{"What's Working · What's Flopping"}</SH>"""
if old_generic_posts in content:
    content = content.replace(old_generic_posts, new_generic_posts)
    changes.append("Added viral velocity milestones to GenericAccountView")

# ── 11. Fix Ring to show — instead of 0 ──────────────────────────────────────
old_ring = "fontSize=\"11\" fontWeight=\"700\" fill={val === 0 ? P.inkFaint : P.ink} fontFamily={F.display}>{val === 0 ? '—' : val}</text>"
if old_ring not in content:
    content = content.replace(
        "fontSize=\"11\" fontWeight=\"700\" fill={P.ink} fontFamily={F.display}>{val}</text>",
        "fontSize=\"11\" fontWeight=\"700\" fill={val === 0 ? P.inkFaint : P.ink} fontFamily={F.display}>{val === 0 ? '—' : val}</text>"
    )
    changes.append("Ring shows — for 0")

# ── 12. Fix pace fallback text ────────────────────────────────────────────────
content = content.replace("'Estimating...'", "'Syncing baseline'")
content = content.replace("'Need more history'", "'Building data'")
changes.append("Improved pace fallback text")

# ── 13. Fix ClientView header to show usernames for both creators ─────────────
old_header_tags = """            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {displayHandle && <Tag color={P.sageDeep} bg={P.sageSoft}>{displayHandle}</Tag>}
            {isMason && (
              <Tag color={P.skyDeep} bg={P.skySoft}>@masondoesnumbers TikTok</Tag>
            )}
            {!isMason && (
              <><Tag color={P.sageDeep} bg={P.sageSoft}>@macroswitmatt TikTok</Tag><Tag color={P.peachDeep} bg={P.peachSoft}>@macroswitmatt IG</Tag></>
            )}"""
if old_header_tags in content:
    # Already has the fix, just update Matt's Instagram handle
    content = content.replace(
        "@macroswitmatt IG</Tag></>",
        "@macroswithmatt IG</Tag></>"
    )
    changes.append("Corrected @macroswithmatt IG label")
else:
    # Need to add username tags
    old_simple_tags = """            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {displayHandle && <Tag color={P.inkSoft} bg={P.cardAlt}>{displayHandle}</Tag>}"""
    new_tags = """            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {isMason ? (
              <>
                <Tag color={P.roseDeep} bg={P.roseSoft}>IG @masondoesnumbers</Tag>
                <Tag color={P.skyDeep} bg={P.skySoft}>TT @masondoesnumbers</Tag>
              </>
            ) : (
              <>
                <Tag color={P.sageDeep} bg={P.sageSoft}>TT @macroswitmatt</Tag>
                <Tag color={P.peachDeep} bg={P.peachSoft}>IG @macroswithmatt</Tag>
              </>
            )}"""
    if old_simple_tags in content:
        content = content.replace(old_simple_tags, new_tags)
        changes.append("Added platform username tags to creator header")
    else:
        changes.append("⚠ Could not add username tags — header format different")

# ── 14. Default time period to 'week' not 'month' in IGAccountView ──────────
# (month as default for pace display is correct, keep it)

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("✅ Done. Changes applied:")
for c in changes:
    print(f"  • {c}")
print("\nRun: npm run build && npx vercel --prod")
