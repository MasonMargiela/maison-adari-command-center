#!/usr/bin/env python3
"""
Strips all mock data from page.tsx.
Replaces with clean — placeholder states.
Run: python3 fix_mock_data.py
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

changes = []

# ── 1. Strip Matt's mock account data ─────────────────────────────────────
old_matt_accounts = """      {
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
        platform: 'Instagram', icon: '📸', handle: '@macroswithmatt',
        followers: 5300, followerDelta: '+44', reach: 21000, engagement: '4.4%',
        color: P.peach, colorSoft: P.peachSoft, colorDeep: P.peachDeep,
        insight: 'Cross-posting proven TikTok content to IG Reels generates 35–50% secondary reach at zero additional effort.',
        posts: [
          { id: '4', caption: 'BEST Ramen in LA 🍜 (full video on TikTok)', like_count: 3800, comments_count: 120, media_type: 'REEL', perf: 'hot', hook: 'Cross-platform tease' },
          { id: '5', caption: 'Birria tacos that broke my brain and my diet', like_count: 2100, comments_count: 67, media_type: 'REEL', perf: 'hot', hook: 'Hyperbole pair' },
        ],
        topComments: [
          { user: '@la_foodie', text: 'I drive past this place every day and never went in. Going tomorrow morning.', likes: 234, platform: 'Instagram' },
        ],
        working: 'Cross-posting proven TikTok content gets 35–50% secondary reach with zero additional filming.',
        flopping: 'Static photos without text overlay getting minimal saves.',
      },"""

new_matt_accounts = """      {
        platform: 'TikTok', icon: '🎵', handle: '@macroswitmatt',
        followers: 0, followerDelta: '+0', reach: 0, engagement: '—',
        color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
        notConnected: true,
        insight: 'Connect TikTok to see real analytics — followers, views, engagement, top posts, and viral velocity tracking.',
        posts: [],
        topComments: [],
        working: 'Connect TikTok to see what is working.',
        flopping: 'Connect TikTok to identify patterns.',
      },
      {
        platform: 'Instagram', icon: '📸', handle: '@macroswithmatt',
        followers: 0, followerDelta: '+0', reach: 0, engagement: '—',
        color: P.peach, colorSoft: P.peachSoft, colorDeep: P.peachDeep,
        notConnected: true,
        insight: 'Connect Instagram to see real analytics — followers, reach, engagement, and top posts.',
        posts: [],
        topComments: [],
        working: 'Connect Instagram to see what is working.',
        flopping: 'Connect Instagram to identify patterns.',
      },"""

if old_matt_accounts in content:
    content = content.replace(old_matt_accounts, new_matt_accounts)
    changes.append("✓ Stripped Matt's mock account data")
else:
    changes.append("⚠ Matt account data not found exactly")

# ── 2. Strip Matt's mock client-level totals ──────────────────────────────
old_matt_totals = """    contentScore: 94, totalFollowers: 53500, totalReach: '184K', engagement: '6.1%', weeklyGrowth: '+238',"""
new_matt_totals = """    contentScore: 0, totalFollowers: 0, totalReach: '—', engagement: '—', weeklyGrowth: '+0',"""

if old_matt_totals in content:
    content = content.replace(old_matt_totals, new_matt_totals)
    changes.append("✓ Stripped Matt's mock totals")
else:
    changes.append("⚠ Matt totals not found")

# ── 3. Strip Matt overview PersonCard mock data ────────────────────────────
old_matt_overview = """  const mattAccounts = [
    { platform: 'TikTok', followers: 48200, followerDelta: '+194', reach: '163K' },
    { platform: 'Instagram', followers: 5300, followerDelta: '+44', reach: '21K' },
  ];"""

new_matt_overview = """  const mattAccounts = [
    { platform: 'TikTok', followers: 0, followerDelta: '+0', reach: '—' },
    { platform: 'Instagram', followers: 0, followerDelta: '+0', reach: '—' },
  ];"""

if old_matt_overview in content:
    content = content.replace(old_matt_overview, new_matt_overview)
    changes.append("✓ Stripped Matt overview mock accounts")
else:
    changes.append("⚠ Matt overview accounts not found")

# ── 4. Strip Matt overview PersonCard mock stats ──────────────────────────
old_matt_person = """        contentScore={94}
        engagement="6.1%"
        reach="184K"
        liveMetrics={null}"""

new_matt_person = """        contentScore={0}
        engagement="—"
        reach="—"
        liveMetrics={null}"""

if old_matt_person in content:
    content = content.replace(old_matt_person, new_matt_person)
    changes.append("✓ Stripped Matt PersonCard mock stats")
else:
    changes.append("⚠ Matt PersonCard not found")

# ── 5. Strip mock combined totals ─────────────────────────────────────────
old_combined = """  const mattWeeklyDelta = 194 + 44; // mock until Matt connects"""
new_combined = """  const mattWeeklyDelta = 0; // real data once Matt connects"""

if old_combined in content:
    content = content.replace(old_combined, new_combined)
    changes.append("✓ Stripped mock combined delta")
else:
    changes.append("⚠ Combined delta not found")

# ── 6. Strip mock top content ─────────────────────────────────────────────
old_top_content = """  const allContent = [
    { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'BEST Ramen in LA (not Daikokuya)', likes: 41200, color: P.sage },
    { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'This birria spot literally changed my life fr', likes: 28400, color: P.sage },
    { creator: 'Macros Wit Matt', platform: 'Instagram', caption: 'BEST Ramen in LA 🍜 (full video on TikTok)', likes: 3800, color: P.peach },
    { creator: 'Macros Wit Matt', platform: 'TikTok', caption: 'Underrated sushi in Torrance nobody talks about', likes: 9800, color: P.sage },
  ].sort((a, b) => b.likes - a.likes);"""

new_top_content = """  // Top content pulls from connected accounts only — no mock data
  const allContent: any[] = [];"""

if old_top_content in content:
    content = content.replace(old_top_content, new_top_content)
    changes.append("✓ Stripped mock top content")
else:
    changes.append("⚠ Top content not found")

# ── 7. Fix top content empty state ────────────────────────────────────────
old_top_render = """      {allContent.map((p, i) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 11, padding: '11px 13px', marginBottom: 7, display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: P.white, fontFamily: F.mono, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>
            <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{p.creator} · {p.platform} · {fmtNum(p.likes)} likes</div>
          </div>
          {i === 0 && <span>🔥</span>}
        </div>
      ))}"""

new_top_render = """      {allContent.length === 0 ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 11, padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: P.inkSoft }}>Connect accounts to see top content</div>
          <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 4 }}>Posts will appear here ranked by performance once accounts are linked</div>
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
      ))}"""

if old_top_render in content:
    content = content.replace(old_top_render, new_top_render)
    changes.append("✓ Fixed top content empty state")
else:
    changes.append("⚠ Top content render not found")

# ── 8. Strip mock Why We Do This comments ─────────────────────────────────
old_why = """      <SH children="Why We Do This" sub="Real comments. Real people." />
      {CLIENTS.find((c: any) => c.id === 'matt')!.accounts[0].topComments.map((c: any, i: number) => (
        <CmtCard key={i} c={c} accent={P.sageDeep} accentSoft={P.sageSoft} />
      ))}"""

new_why = """      <SH children="Why We Do This" sub="Real comments from real people — connect accounts to populate." />
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 11, padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: P.inkSoft }}>Connect TikTok or Instagram to see real top comments here</div>
        <div style={{ fontSize: 11, color: P.inkFaint, marginTop: 4 }}>This section pulls the highest-liked comments from your best performing posts</div>
      </div>"""

if old_why in content:
    content = content.replace(old_why, new_why)
    changes.append("✓ Stripped mock Why We Do This comments")
else:
    changes.append("⚠ Why We Do This not found")

# ── 9. Strip mock biggest followers data ──────────────────────────────────
# Replace with empty state placeholder
old_biggest = """      {/* Biggest Follower Deck */}
      <SH children="Biggest Follower" sub="Top 4 followers ranked by their own audience size · tap a card" />
      <BiggestFollowerDeck />"""

new_biggest = """      {/* Biggest Follower Deck */}
      <SH children="Biggest Follower" sub="Top 4 followers ranked by their own audience size" />
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '18px', textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>🃏</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4 }}>Biggest Follower tracking coming soon</div>
        <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6 }}>Once TikTok and Instagram are connected, this will show your top 4 highest-value followers ranked by their own audience size — updated daily.</div>
      </div>"""

if old_biggest in content:
    content = content.replace(old_biggest, new_biggest)
    changes.append("✓ Replaced mock Biggest Follower deck with honest placeholder")
else:
    changes.append("⚠ Biggest Follower section not found")

# ── 10. Strip mock combined reach sparkline ───────────────────────────────
old_combined_reach = """      {/* Combined reach sparkline */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Combined Reach · Mason + Matt</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink, marginTop: 2 }}>163K <span style={{ fontSize: 11, color: P.sageDeep, fontWeight: 400 }}>↑ 22% this week</span></div>
          </div>
          <Tag color={igMetrics ? P.sageDeep : P.inkFaint} bg={igMetrics ? P.sageSoft : P.card}>{igMetrics ? '🟢 IG Live' : 'partial data'}</Tag>
        </div>
        <Spark data={REACH_DATA} color={P.lavDeep} h={44} />
      </div>"""

new_combined_reach = """      {/* Combined reach — real data only */}
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
          <Tag color={igMetrics ? P.sageDeep : P.inkFaint} bg={igMetrics ? P.sageSoft : P.card}>{igMetrics ? '🟢 Live' : 'no data'}</Tag>
        </div>
        {igMetrics && <Spark data={REACH_DATA} color={P.lavDeep} h={44} />}
        {!igMetrics && (
          <div style={{ height: 44, background: P.borderLight, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>graph populates as data accumulates</span>
          </div>
        )}
      </div>"""

if old_combined_reach in content:
    content = content.replace(old_combined_reach, new_combined_reach)
    changes.append("✓ Fixed combined reach to use real data only")
else:
    changes.append("⚠ Combined reach not found")

# ── 11. Strip notConnected account display in UnifiedAccountView ──────────
# Add a not-connected state at the top of UnifiedAccountView
old_unified_start = """  // Core metrics — use live if available, else use mock
  const followers = isLive ? metrics.followers : acc.followers;"""

new_unified_start = """  // If account not connected, show clean placeholder
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
  const followers = isLive ? metrics.followers : acc.followers;"""

if old_unified_start in content:
    content = content.replace(old_unified_start, new_unified_start)
    changes.append("✓ Added notConnected state to UnifiedAccountView")
else:
    changes.append("⚠ UnifiedAccountView start not found")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\n".join(changes))
print("\n✅ Done. Run: npm run build && npx vercel --prod")
