#!/usr/bin/env python3
"""
Makes Mason and Matt tabs 1:1 identical layout.
TikTok first for both. Same component for all accounts.
Both panels open by default.
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

# ── Find ClientView and replace it completely ─────────────────────────────
cv_start = content.find('const ClientView = (')
cv_end = content.find('\n// ── REACH DATA', cv_start)
if cv_end == -1:
    cv_end = content.find('\nconst REACH_DATA', cv_start)
if cv_start == -1 or cv_end == -1:
    print(f"ERROR: ClientView bounds start={cv_start} end={cv_end}")
    exit(1)

NEW_CLIENT_VIEW = '''const ClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
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

'''

content = content[:cv_start] + NEW_CLIENT_VIEW + content[cv_end:]
print("✓ Replaced ClientView — TikTok first, multi-open, same component")

# ── Now find IGAccountView and GenericAccountView, replace both with UnifiedAccountView ──
ig_start = content.find('const IGAccountView = (')
gen_start = content.find('const GenericAccountView = (')

# Find the ClientView start to know where to stop
cv_new_start = content.find('const ClientView = (')

# Replace everything between IGAccountView and ClientView with single UnifiedAccountView
if ig_start != -1 and cv_new_start != -1 and ig_start < cv_new_start:
    section_to_replace = content[ig_start:cv_new_start]
    
    UNIFIED_VIEW = '''const UnifiedAccountView = ({ acc, igData, goal, setGoal }: { acc: any; igData: any; goal: number; setGoal: (v: number) => void }) => {
  const [timePeriod, setTimePeriod] = useState('week');
  const [goalPlatform, setGoalPlatform] = useState(acc.platform.toLowerCase());

  const metrics = igData?.metrics;
  const media = igData?.media ?? [];
  const analytics = igData?.analytics;
  const isLive = !!metrics && acc.platform === 'Instagram';

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

  const { value: deltaVal, label: deltaLabel } = applyTimePeriod(weeklyDelta, timePeriod);

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
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '13px 15px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{acc.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: P.ink }}>{acc.platform}</div>
          <div style={{ fontSize: 10, color: P.inkSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
            {handle}
            {isLive && <><LiveDot color={P.sageDeep} /><span style={{ fontSize: 9, color: P.sageDeep, fontFamily: F.mono }}>synced</span></>}
          </div>
        </div>
        <Ring val={contentScore} color={acc.colorDeep} size={44} />
      </div>

      {/* Followers card with pie chart and time switcher */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 15px', marginBottom: 8, borderTop: `2.5px solid ${acc.color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
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
            <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1, marginTop: 8, width: 'fit-content' }}>
              {TIME_PERIODS.map((tp: any) => (
                <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
                  style={{ background: timePeriod === tp.id ? P.ink : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '3px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
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

      {/* Engagement + Reach with sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Engagement</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{engagementDisplay}</div>
          <div style={{ fontSize: 9, color: isLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginBottom: 6 }}>{isLive ? 'live ✓' : 'mock'}</div>
          <Spark data={engHistory} color={acc.color} h={28} />
        </div>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '12px 13px', borderTop: `2.5px solid ${acc.color}` }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono, marginBottom: 4 }}>Reach</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{reachDisplay}</div>
          <div style={{ fontSize: 9, color: isLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginBottom: 6 }}>{isLive ? 'derived ✓' : 'mock'}</div>
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
          <div style={{ fontSize: 9, color: isLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono }}>{isLive ? 'live ✓' : 'mock'}</div>
        </div>
      </div>

      {/* Growth Pace */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth Pace</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase' }}>{paceLabels[timePeriod]}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
              {paceByPeriod[timePeriod] !== '—' ? '+' + paceByPeriod[timePeriod] : '—'}
            </div>
            <div style={{ fontSize: 9, color: isLive && paceSource === 'historical_data' ? P.sageDeep : P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>
              {isLive ? (paceSource === 'historical_data' ? 'tracked ✓' : paceSource === 'early_estimate' ? 'early data' : 'est. baseline') : 'mock data'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase' }}>Est. Goal Date</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{estDate}</div>
            <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>at {timePeriod} rate</div>
          </div>
        </div>
        <div style={{ display: 'flex', background: P.white, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {TIME_PERIODS.map((tp: any) => (
            <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
              style={{ background: timePeriod === tp.id ? acc.colorDeep : 'none', color: timePeriod === tp.id ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 0', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, flex: 1, transition: 'all 0.15s' }}>
              {tp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Follower Goal */}
      <SH>Follower Goal</SH>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: P.inkSoft }}>Target:</div>
        <input type="number" value={goal}
          onChange={(e: any) => { const v = parseInt(e.target.value); if (v > 0) setGoal(v); }}
          style={{ width: 90, border: `1px solid ${P.border}`, borderRadius: 7, padding: '4px 8px', fontSize: 12, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right' }}
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
        <div style={{ background: acc.colorSoft, border: `1px solid ${acc.color}30`, borderRadius: 12, padding: '18px', textAlign: 'center', margin: '12px 0' }}>
          <div style={{ fontSize: 20, marginBottom: 7 }}>📭</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4 }}>No posts yet</div>
          <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6 }}>Post content to start tracking performance.</div>
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

'''
    content = content[:ig_start] + UNIFIED_VIEW + content[cv_new_start:]
    print("✓ Replaced IGAccountView + GenericAccountView with single UnifiedAccountView")
else:
    print(f"⚠ Could not find component boundaries: ig_start={ig_start}, cv_start={cv_new_start}")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ Done. Run: npm run build && npx vercel --prod")
print("\nFixed:")
print("  • Single UnifiedAccountView used for ALL accounts (Mason IG, Mason TikTok, Matt TikTok, Matt IG)")
print("  • TikTok always first in connected accounts list")
print("  • Both panels open by default")
print("  • Multi-open: tap any header to collapse/expand independently")
print("  • Correct usernames: @masondoesnumbers, @macroswitmatt, @macroswithmatt")
print("  • Platform username chips in creator header")
print("  • Live data used when available, mock labeled honestly")
print("  • Viral velocity milestones shown for Matt's TikTok")
print("  • Same layout, same sections, same quality across all accounts")
