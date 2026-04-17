#!/usr/bin/env python3
"""
Bundle A:
1. Client management — add/remove clients from settings panel
2. Posts/comments/likes by period on client tabs  
3. Trending posts detection — auto-flag 100K threshold
Run: python3 fix_bundle_a.py
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

changes = []

# ── 1. Add trending detection to PostCard ─────────────────────────────────
# A post is trending if:
# - 100K+ views/likes same day (hours <= 24)
# - 100K+ views/likes in 2-3 days (hours <= 72)  
# - 1M+ in a month (hours <= 720)

OLD_POST_CARD_START = '''const PostCard = ({ post, accent, accentSoft, accentDeep }: { post: any; accent: string; accentSoft: string; accentDeep: string }) => {'''

NEW_POST_CARD_START = '''function isTrending(post: any): { trending: boolean; label: string; urgency: 'fire' | 'hot' | 'rising' } {
  const likes = post.like_count ?? post.likes ?? 0;
  const views = post.view_count ?? post.views ?? likes;
  const hours = post.hours ?? post.age_hours ?? null;
  const reach = Math.max(likes, views);
  if (hours !== null) {
    if (reach >= 1000000 && hours <= 720) return { trending: true, label: '1M+ in a month', urgency: 'fire' };
    if (reach >= 100000 && hours <= 24) return { trending: true, label: '100K same day', urgency: 'fire' };
    if (reach >= 100000 && hours <= 72) return { trending: true, label: '100K in 3 days', urgency: 'hot' };
    if (reach >= 50000 && hours <= 24) return { trending: true, label: '50K same day', urgency: 'rising' };
  } else {
    if (reach >= 1000000) return { trending: true, label: '1M+ reach', urgency: 'fire' };
    if (reach >= 100000) return { trending: true, label: '100K+ reach', urgency: 'hot' };
  }
  return { trending: false, label: '', urgency: 'rising' };
}

const PostCard = ({ post, accent, accentSoft, accentDeep }: { post: any; accent: string; accentSoft: string; accentDeep: string }) => {'''

if OLD_POST_CARD_START in content:
    content = content.replace(OLD_POST_CARD_START, NEW_POST_CARD_START)
    changes.append("✓ Added isTrending() function")
else:
    changes.append("⚠ PostCard start not found")

# Add trending badge inside PostCard after the tags row
OLD_POST_TAGS = '''          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
            <Tag color={accentDeep} bg={accentSoft}>{post.hook || post.type || post.media_type}</Tag>
            {post.hours && <Tag color={P.inkFaint} bg={P.card}>{post.hours}h ago</Tag>}
            <Tag color={perfColor} bg={`${perfColor}18`}>{post.perf === 'hot' ? '🔥 Hot' : post.perf === 'neutral' ? '〰 Avg' : '❄️ Cold'}</Tag>
          </div>'''

NEW_POST_TAGS = '''          {(() => { const t = isTrending(post); return t.trending ? (
            <div style={{ background: t.urgency === 'fire' ? '#fff3cd' : t.urgency === 'hot' ? '#fce9ed' : '#e6f4e8', border: `1px solid ${t.urgency === 'fire' ? '#f2dfa0' : t.urgency === 'hot' ? '#e8b4c2' : '#aed0b2'}`, borderRadius: 8, padding: '5px 10px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{t.urgency === 'fire' ? '🔥' : t.urgency === 'hot' ? '📈' : '↑'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.urgency === 'fire' ? '#b8940a' : t.urgency === 'hot' ? '#c4849a' : '#5a9e66', fontFamily: F.mono }}>TRENDING · {t.label}</span>
            </div>
          ) : null; })()}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
            <Tag color={accentDeep} bg={accentSoft}>{post.hook || post.type || post.media_type}</Tag>
            {post.hours && <Tag color={P.inkFaint} bg={P.card}>{post.hours}h ago</Tag>}
            <Tag color={perfColor} bg={`${perfColor}18`}>{post.perf === 'hot' ? '🔥 Hot' : post.perf === 'neutral' ? '〰 Avg' : '❄️ Cold'}</Tag>
          </div>'''

if OLD_POST_TAGS in content:
    content = content.replace(OLD_POST_TAGS, NEW_POST_TAGS)
    changes.append("✓ Added trending badge to PostCard")
else:
    changes.append("⚠ Post tags section not found")

# ── 2. Add stats-by-period section to UnifiedAccountView ─────────────────
# Insert after the engagement/reach/following/posts grid

OLD_AFTER_STATS = '''      {/* Growth Pace */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8 }}>'''

NEW_AFTER_STATS = '''      {/* Content Stats by Period */}
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '13px 15px', marginBottom: 8, borderTop: `2.5px solid ${acc.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Content Performance</div>
          <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 2, gap: 1 }}>
            {(['day', 'wk', 'mo', 'yr'] as const).map(p => (
              <button key={p} onClick={() => setTimePeriod(p === 'day' ? 'day' : p === 'wk' ? 'week' : p === 'mo' ? 'month' : 'year')}
                style={{ background: (timePeriod === 'day' && p === 'day') || (timePeriod === 'week' && p === 'wk') || (timePeriod === 'month' && p === 'mo') || (timePeriod === 'year' && p === 'yr') ? acc.colorDeep : 'none', color: (timePeriod === 'day' && p === 'day') || (timePeriod === 'week' && p === 'wk') || (timePeriod === 'month' && p === 'mo') || (timePeriod === 'year' && p === 'yr') ? P.white : P.inkSoft, border: 'none', borderRadius: 12, padding: '3px 8px', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
          {[
            { label: 'Posts', value: posts.length > 0 ? String(posts.length) : '—', sub: timePeriod === 'day' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'this year' },
            { label: 'Total Likes', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.like_count ?? p.likes ?? 0), 0)) : '—', sub: 'combined' },
            { label: 'Total Comments', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.comments_count ?? p.comments ?? 0), 0)) : '—', sub: 'combined' },
          ].map((s, i) => (
            <div key={i} style={{ background: `${acc.color}20`, borderRadius: 9, padding: '9px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{s.value}</div>
              <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {posts.filter((p: any) => isTrending(p).trending).length > 0 && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: '#fff3cd', border: '1px solid #f2dfa0', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b8940a', fontFamily: F.mono }}>
                {posts.filter((p: any) => isTrending(p).trending).length} TRENDING POST{posts.filter((p: any) => isTrending(p).trending).length > 1 ? 'S' : ''}
              </div>
              <div style={{ fontSize: 10, color: '#8a7020' }}>
                {posts.filter((p: any) => isTrending(p).trending).map((p: any) => isTrending(p).label).join(' · ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Growth Pace */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8 }}>'''

if OLD_AFTER_STATS in content:
    content = content.replace(OLD_AFTER_STATS, NEW_AFTER_STATS)
    changes.append("✓ Added content stats by period to UnifiedAccountView")
else:
    changes.append("⚠ Growth Pace section not found")

# ── 3. Add client management panel (settings tab) ─────────────────────────

# First add a settings tab to TABS
OLD_TABS_DEF = '''  const TABS: { id: string; label: string; color?: string; avatar?: string }[] = [
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
  ];'''

NEW_TABS_DEF = '''  const TABS: { id: string; label: string; color?: string; avatar?: string }[] = [
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
    { id: 'settings', label: '⚙ Clients' },
  ];'''

if OLD_TABS_DEF in content:
    content = content.replace(OLD_TABS_DEF, NEW_TABS_DEF)
    changes.append("✓ Added settings tab to nav")
else:
    changes.append("⚠ TABS definition not found")

# Add the settings view before the closing tags
OLD_LAST_TAB = '''        {view === 'engine' && ('''

NEW_SETTINGS_VIEW = '''        {/* CLIENT MANAGEMENT */}
        {view === 'settings' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>Client Management</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65, margin: 0 }}>Manage clients on the dashboard. Each client gets their own tab and invite link.</p>
            </div>

            {/* Existing clients */}
            <SH>Active Clients</SH>
            {CLIENTS.map((client, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: client.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: client.colorDeep, fontFamily: F.display, flexShrink: 0 }}>{client.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: P.inkSoft }}>{client.role}</div>
                  <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono, marginTop: 3 }}>
                    {client.accounts.length} account{client.accounts.length !== 1 ? 's' : ''} · {client.accounts.filter((a: any) => !a.notConnected).length} connected
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/connect/invite?invite=${client.id}`;
                      navigator.clipboard.writeText(link).then(() => alert('Invite link copied! Send this to ' + client.name));
                    }}
                    style={{ background: client.colorSoft, border: `1px solid ${client.color}`, borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: client.colorDeep, fontFamily: F.mono, whiteSpace: 'nowrap' }}>
                    Copy Invite Link
                  </button>
                  <button
                    onClick={() => setView(`client:${client.id}`)}
                    style={{ background: 'none', border: `1px solid ${P.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: P.inkSoft, fontFamily: F.mono, whiteSpace: 'nowrap' }}>
                    View Tab →
                  </button>
                </div>
              </div>
            ))}

            {/* Add new client */}
            <SH>Add New Client</SH>
            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 14 }}>
                To add a new client, send them their personalized invite link. They connect their accounts and their tab appears automatically.
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  id="new-client-id"
                  placeholder="client-id (e.g. sarah, la-birria-co)"
                  style={{ flex: 1, border: `1px solid ${P.border}`, borderRadius: 9, padding: '9px 12px', fontSize: 12, fontFamily: F.mono, background: P.white, color: P.ink, outline: 'none' }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('new-client-id') as HTMLInputElement;
                    const id = input?.value?.trim().toLowerCase().replace(/\s+/g, '-');
                    if (!id) return;
                    const link = `${window.location.origin}/connect/invite?invite=${id}`;
                    navigator.clipboard.writeText(link).then(() => {
                      alert(`Invite link for "${id}" copied!\n\n${link}\n\nSend this link to your new client. Once they connect their accounts, their tab will appear on the dashboard.`);
                      if (input) input.value = '';
                    });
                  }}
                  style={{ background: P.ink, border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: P.white, fontFamily: F.body, whiteSpace: 'nowrap' }}>
                  Generate Link
                </button>
              </div>
              <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono, lineHeight: 1.6 }}>
                The client opens the link on their phone → connects Instagram/TikTok → their tab appears here automatically. Colors are auto-assigned from the palette.
              </div>
            </div>

            {/* Connect page links */}
            <SH>Quick Links</SH>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              {[
                { label: 'Connect Page', url: '/connect', desc: 'Generic connect page' },
                { label: 'Token Refresh', url: '/api/cron/refresh-token', desc: 'Runs every Sunday auto' },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer"
                  style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: P.ink, marginBottom: 3 }}>{link.label}</div>
                  <div style={{ fontSize: 10, color: P.inkFaint, fontFamily: F.mono }}>{link.desc}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {view === 'engine' && ('''

if OLD_LAST_TAB in content:
    content = content.replace(OLD_LAST_TAB, NEW_SETTINGS_VIEW)
    changes.append("✓ Added client management settings tab")
else:
    changes.append("⚠ Engine tab not found for insertion point")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\n".join(changes))
print("\n✅ Done. Run: npm run build && npx vercel --prod")
