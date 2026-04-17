#!/usr/bin/env python3
"""
Replaces the basic revenue tab with a full revenue dashboard skeleton.
Includes:
- Agency revenue (billed, pipeline, projected, target)
- Creator revenue streams (TikTok gifts, AdSense, brand deals)
- Period switcher (day/week/month/year)
- Progress to target
- Pricing tiers
Run: python3 fix_revenue.py
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

OLD_REVENUE = """        {view === 'revenue' && (
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
        )}"""

NEW_REVENUE = """        {view === 'revenue' && (
          <RevenueTab />
        )}"""

if OLD_REVENUE in content:
    content = content.replace(OLD_REVENUE, NEW_REVENUE)
    print("✓ Replaced revenue tab with RevenueTab component")
else:
    print("⚠ Revenue tab not found exactly")

# Add RevenueTab component before the main export
REVENUE_COMPONENT = '''
// ── REVENUE TAB ────────────────────────────────────────────────────────────
const RevenueTab = () => {
  const [period, setPeriod] = useState('month');
  const [revenueType, setRevenueType] = useState<'gross' | 'net'>('gross');

  const periodLabels: Record<string, string> = {
    day: 'Today', week: 'This Week', month: 'This Month', year: 'This Year',
  };

  // Agency revenue — editable targets (localStorage persisted)
  const [billedAmount, setBilledAmount] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('billed_amount') ?? '0');
    return 0;
  });
  const [activeClients, setActiveClients] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('active_clients') ?? '0');
    return 0;
  });
  const monthlyTarget = 5000;
  const pipelineValue = 2400;
  const progressPct = Math.min(100, (billedAmount / monthlyTarget) * 100);

  // Creator revenue streams — all "connect to track" until APIs connected
  const creatorStreams = [
    {
      name: 'TikTok Gifts & Diamonds',
      icon: '💎',
      platform: 'TikTok',
      status: 'connect',
      description: 'Live stream gifts converted to diamonds. Tracked via TikTok API.',
      color: P.sage,
      colorSoft: P.sageSoft,
    },
    {
      name: 'TikTok Creator Fund',
      icon: '🎵',
      platform: 'TikTok',
      status: 'connect',
      description: 'Per-view earnings from the TikTok Creator Rewards Program.',
      color: P.sage,
      colorSoft: P.sageSoft,
    },
    {
      name: 'Instagram Badges',
      icon: '❤️',
      platform: 'Instagram',
      status: 'connect',
      description: 'Live badges from Instagram followers. Tracked via Instagram API.',
      color: P.rose,
      colorSoft: P.roseSoft,
    },
    {
      name: 'AdSense / YouTube',
      icon: '▶️',
      platform: 'YouTube',
      status: 'setup',
      description: 'Ad revenue from YouTube monetization. Requires YouTube connection.',
      color: P.butter,
      colorSoft: P.butterSoft,
    },
    {
      name: 'Brand Deals',
      icon: '🤝',
      platform: 'Manual',
      status: 'manual',
      description: 'Log brand deal payments manually. Not trackable via API.',
      color: P.lavender,
      colorSoft: P.lavSoft,
      amount: 0,
    },
    {
      name: 'Affiliate & Link Revenue',
      icon: '🔗',
      platform: 'Manual',
      status: 'manual',
      description: 'Log affiliate commissions and link revenue manually.',
      color: P.sky,
      colorSoft: P.skySoft,
      amount: 0,
    },
  ];

  const statusLabel: Record<string, string> = {
    connect: 'Connect account to track',
    setup: 'Requires platform setup',
    manual: 'Manual entry',
    live: 'Live tracking',
  };

  const statusColor: Record<string, string> = {
    connect: P.inkFaint,
    setup: P.butterDeep,
    manual: P.lavDeep,
    live: P.sageDeep,
  };

  return (
    <div>
      {/* Period + type switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {['day', 'week', 'month', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ background: period === p ? P.ink : 'none', color: period === p ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s' }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: 2, gap: 1 }}>
          {(['gross', 'net'] as const).map(t => (
            <button key={t} onClick={() => setRevenueType(t)}
              style={{ background: revenueType === t ? P.ink : 'none', color: revenueType === t ? P.white : P.inkSoft, border: 'none', borderRadius: 16, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono, transition: 'all 0.15s', textTransform: 'uppercase' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Agency Revenue */}
      <div style={{ background: P.dark, borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono, marginBottom: 14 }}>
          ✦ Agency Revenue · Maison Adari · {periodLabels[period]}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9, marginBottom: 14 }}>
          {[
            {
              label: 'Billed ' + periodLabels[period],
              val: '$' + (period === 'year' ? (billedAmount * 12).toLocaleString() : period === 'week' ? Math.round(billedAmount / 4).toLocaleString() : period === 'day' ? Math.round(billedAmount / 30).toLocaleString() : billedAmount.toLocaleString()),
              sub: activeClients + ' active client' + (activeClients !== 1 ? 's' : ''),
              color: P.sage,
              editable: true,
            },
            { label: 'Pipeline Value', val: '$' + pipelineValue.toLocaleString(), sub: '4 prospects identified', color: P.lavender, editable: false },
            { label: 'Projected (1 Client)', val: '$800/mo', sub: 'Standard AFE rate', color: P.butter, editable: false },
            { label: 'Monthly Target', val: '$' + monthlyTarget.toLocaleString(), sub: '6 clients @ $800', color: P.rose, editable: false },
          ].map((s, i) => (
            <div key={i} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 12, padding: '13px', borderTop: `2px solid ${s.color}` }}>
              <div style={{ fontSize: 9, color: P.darkMuted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: F.mono, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{s.val}</div>
              <div style={{ fontSize: 10, color: P.darkMuted, marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress to target */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>Progress to ${monthlyTarget.toLocaleString()}/mo target</div>
            <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>{progressPct.toFixed(0)}%</div>
          </div>
          <div style={{ background: P.darkBorder, borderRadius: 99, height: 8 }}>
            <div style={{ background: progressPct >= 100 ? P.sageDeep : P.sage, height: 8, width: progressPct + '%', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </div>

        {/* Editable billed amount */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>Update billed:</div>
          <input type="text" inputMode="numeric" defaultValue={String(billedAmount)}
            onBlur={e => { const v = parseInt(e.target.value.replace(/,/g, '')); if (!isNaN(v) && v >= 0) { setBilledAmount(v); localStorage.setItem('billed_amount', String(v)); } }}
            onKeyDown={(e: any) => { if (e.key === 'Enter') e.target.blur(); }}
            style={{ width: 80, background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 7, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, color: P.darkText, textAlign: 'right', outline: 'none' }}
          />
          <div style={{ fontSize: 10, color: P.darkMuted, fontFamily: F.mono }}>clients:</div>
          <input type="text" inputMode="numeric" defaultValue={String(activeClients)}
            onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0) { setActiveClients(v); localStorage.setItem('active_clients', String(v)); } }}
            onKeyDown={(e: any) => { if (e.key === 'Enter') e.target.blur(); }}
            style={{ width: 40, background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 7, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, color: P.darkText, textAlign: 'right', outline: 'none' }}
          />
        </div>

        <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
          First client unlocks the flywheel. Everything after is momentum.
        </div>
      </div>

      {/* Creator Revenue Streams */}
      <SH children="Creator Revenue Streams" sub="Connect accounts to enable live tracking" />
      {creatorStreams.map((stream, i) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `3px solid ${stream.color}`, borderRadius: 13, padding: '13px 15px', marginBottom: 9 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: stream.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{stream.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, fontFamily: F.display }}>{stream.name}</div>
                <span style={{ fontSize: 9, color: statusColor[stream.status], background: `${statusColor[stream.status]}18`, borderRadius: 20, padding: '2px 7px', fontFamily: F.mono, fontWeight: 600 }}>
                  {stream.platform}
                </span>
              </div>
              <div style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>{stream.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.ink }}>
                  {stream.status === 'live' ? '$0.00' : '—'}
                </div>
                <div>
                  {stream.status === 'connect' && (
                    <a href="/connect" style={{ background: stream.colorSoft, border: `1px solid ${stream.color}`, borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 600, color: stream.color.includes('sage') ? P.sageDeep : P.ink, textDecoration: 'none', fontFamily: F.mono }}>
                      Connect →
                    </a>
                  )}
                  {stream.status === 'setup' && (
                    <span style={{ fontSize: 10, color: P.butterDeep, fontFamily: F.mono }}>Setup required</span>
                  )}
                  {stream.status === 'manual' && (
                    <input type="text" inputMode="numeric" placeholder="$0"
                      style={{ width: 70, border: `1px solid ${P.border}`, borderRadius: 7, padding: '4px 8px', fontSize: 11, fontFamily: F.mono, background: P.white, color: P.ink, textAlign: 'right', outline: 'none' }}
                    />
                  )}
                </div>
              </div>
              <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 4 }}>
                {statusLabel[stream.status]} · {periodLabels[period].toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pricing Tiers */}
      <SH>Agency Pricing Tiers</SH>
      {[
        { tier: 'Starter', price: '$500/mo', desc: '2 posts/week, monthly report, basic analytics', color: P.sage },
        { tier: 'Growth', price: '$800/mo', desc: '4 posts/week, weekly report, competitor analysis, hook strategy', color: P.lavender },
        { tier: 'Pro', price: '$1,200/mo', desc: 'Daily content, live dashboard access, creator DM agent, full AFE deployment', color: P.rose },
      ].map((t, i) => (
        <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 13, padding: '13px 15px', marginBottom: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{t.tier}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{t.price}</div>
          </div>
          <div style={{ fontSize: 12, color: P.inkMid }}>{t.desc}</div>
        </div>
      ))}
    </div>
  );
};

'''

# Insert before main export
insert_before = '\nexport default function AdariCommandCenter'
if insert_before in content:
    content = content.replace(insert_before, REVENUE_COMPONENT + insert_before)
    print("✓ Added RevenueTab component")
else:
    print("⚠ Could not find insertion point")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ Done. Run: npm run build && npx vercel --prod")
