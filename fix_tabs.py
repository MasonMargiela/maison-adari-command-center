#!/usr/bin/env python3
"""
Fix Mason and Matt individual tabs to be identical layout.
Adds: pie chart, time period switcher, sparklines on engagement/reach,
pace cards that update with period selector.
Run: python3 fix_tabs.py
"""

NEW_IG_ACCOUNT_VIEW = '''const IGAccountView = ({ acc, igData, igGoal, setIgGoal }: { acc: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
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
  const pace = metrics?.pace ?? 'Estimating...';
  const contentScore = metrics?.contentScore ?? 0;
  const posts = isLive && media.length > 0 ? media : acc.posts;
  const working = analytics?.working ?? acc.working;
  const flopping = analytics?.flopping ?? acc.flopping;

  // Weekly delta — for Mason use 0 since we don't have historical yet
  const weeklyDelta = paceMonthly > 0 ? Math.round(paceMonthly / 4.33) : 0;
  const { value: deltaVal, label: deltaLabel } = applyTimePeriod(weeklyDelta, timePeriod);

  // Pace by selected period
  const paceByPeriod = {
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

'''

NEW_CLIENT_VIEW = '''const ClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  const [openAcc, setOpenAcc] = useState(0);
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

'''

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Find and replace IGAccountView
ig_start = content.find('const IGAccountView = ')
ig_end = content.find('\n// ── CLIENT VIEW', ig_start)

if ig_start == -1 or ig_end == -1:
    print("ERROR: Could not find IGAccountView boundaries")
    print(f"ig_start={ig_start}, ig_end={ig_end}")
    exit(1)

content = content[:ig_start] + NEW_IG_ACCOUNT_VIEW + content[ig_end:]
print("✓ Replaced IGAccountView + added GenericAccountView")

# Find and replace ClientView
cv_start = content.find('const ClientView = ')
cv_end = content.find('\n// ── REACH DATA', cv_start)

if cv_start == -1 or cv_end == -1:
    print("ERROR: Could not find ClientView boundaries")
    print(f"cv_start={cv_start}, cv_end={cv_end}")
    exit(1)

content = content[:cv_start] + NEW_CLIENT_VIEW + content[cv_end:]
print("✓ Replaced ClientView")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\nDone! Run: npm run build && npx vercel --prod")
