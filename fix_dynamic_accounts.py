#!/usr/bin/env python3
"""
Builds dynamic multi-account client tabs.
Each connected account gets its own card.
Smooth expand/collapse per account.
Auto-dedup on connect.
Run: python3 fix_dynamic_accounts.py
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

# ── Add DynamicClientView component before ClientView ─────────────────────
DYNAMIC_CLIENT_VIEW = '''
// ── DYNAMIC CLIENT VIEW ───────────────────────────────────────────────────
// Reads connected accounts from Supabase via API
// Each account gets its own expandable card
const DynamicClientView = ({ client, igData, igGoal, setIgGoal }: { client: any; igData: any; igGoal: number; setIgGoal: (v: number) => void }) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const isMason = client.id === 'mason';

  useEffect(() => {
    // Fetch connected accounts for this client from API
    fetch('/api/accounts/' + client.id)
      .then(r => r.json())
      .then(d => {
        setAccounts(d.accounts ?? []);
        // Open first account by default
        if (d.accounts?.length > 0) {
          setOpenIds(new Set([d.accounts[0].id]));
        }
        setLoading(false);
      })
      .catch(() => {
        // Fall back to hardcoded accounts from CLIENTS
        setAccounts(client.accounts ?? []);
        if (client.accounts?.length > 0) {
          setOpenIds(new Set([client.accounts[0].platform + '_0']));
        }
        setLoading(false);
      });
  }, [client.id]);

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const metrics = igData?.metrics;
  const displayFollowers = isMason && metrics ? metrics.followers : client.totalFollowers;
  const contentScore = isMason && metrics ? metrics.contentScore : client.contentScore;

  // Group accounts by platform
  const byPlatform: Record<string, any[]> = {};
  accounts.forEach(acc => {
    const p = acc.platform ?? 'other';
    if (!byPlatform[p]) byPlatform[p] = [];
    byPlatform[p].push(acc);
  });

  // Also include hardcoded unconnected accounts
  const connectedHandles = new Set(accounts.map(a => a.username?.toLowerCase()));
  const staticAccounts = (client.accounts ?? []).filter((a: any) => 
    !connectedHandles.has(a.handle?.replace('@', '').toLowerCase())
  );

  const platformOrder = ['tiktok', 'instagram', 'youtube', 'twitter', 'threads'];
  const platformColors: Record<string, any> = {
    tiktok: { color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep, icon: '🎵' },
    instagram: { color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep, icon: '📸' },
    youtube: { color: P.butter, colorSoft: P.butterSoft, colorDeep: P.butterDeep, icon: '▶️' },
    twitter: { color: P.sky, colorSoft: P.skySoft, colorDeep: P.skyDeep, icon: '𝕏' },
    threads: { color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep, icon: '🧵' },
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
          <div style={{ fontSize: 11, color: P.inkSoft, marginBottom: 6 }}>{client.role}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <Tag color={client.colorDeep} bg={client.colorSoft}>{fmtNum(displayFollowers)} followers</Tag>
            {isMason && metrics && <Tag color={P.roseDeep} bg={P.roseSoft}>📸 @masondoesnumbers</Tag>}
            {isMason && <Tag color={P.skyDeep} bg={P.skySoft}>🎵 @masondoesnumbers</Tag>}
            {!isMason && <Tag color={P.sageDeep} bg={P.sageSoft}>🎵 @macroswitmatt</Tag>}
            {!isMason && <Tag color={P.peachDeep} bg={P.peachSoft}>📸 @macroswithmatt</Tag>}
          </div>
        </div>
        <Ring val={contentScore} color={client.colorDeep} size={50} />
      </div>

      {/* Best times */}
      <SH>Best Times to Post</SH>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
        {client.bestTimes.map((t: string, i: number) => <Tag key={i} color={client.colorDeep} bg={client.colorSoft}>⏰ {t}</Tag>)}
      </div>

      {/* Connected accounts — dynamic from Supabase */}
      <SH children={`${accounts.length + staticAccounts.length} Connected Account${accounts.length + staticAccounts.length !== 1 ? 's' : ''}`} sub="Tap header to collapse · both open by default" />

      {loading && (
        <div style={{ background: P.card, borderRadius: 13, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: F.mono }}>Loading accounts...</div>
        </div>
      )}

      {!loading && (
        <>
          {/* Live connected accounts from Supabase */}
          {platformOrder.map(platform => {
            const platformAccs = byPlatform[platform] ?? [];
            if (platformAccs.length === 0) return null;
            const pc = platformColors[platform] ?? { color: P.lavender, colorSoft: P.lavSoft, colorDeep: P.lavDeep, icon: '📱' };

            return platformAccs.map((acc: any, accIdx: number) => {
              const accId = acc.id ?? platform + '_' + accIdx;
              const isOpen = openIds.has(accId);
              const isIGLive = isMason && platform === 'instagram' && !!metrics && acc.username === 'masondoesnumbers';
              const followers = isIGLive ? metrics.followers : (acc.follower_count ?? acc.followers ?? 0);
              const handle = '@' + acc.username;

              // Build a fake acc object for UnifiedAccountView
              const accObj = {
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                icon: pc.icon,
                handle,
                followers,
                followerDelta: '+0',
                reach: isIGLive ? metrics.reach : 0,
                engagement: isIGLive ? metrics.engagementRate.toFixed(1) + '%' : '—',
                color: pc.color,
                colorSoft: pc.colorSoft,
                colorDeep: pc.colorDeep,
                notConnected: false,
                posts: [],
                topComments: [],
                working: 'Post content to see what is working.',
                flopping: 'Post content to identify patterns.',
                insight: 'Account connected. Post content to generate AI insights.',
              };

              return (
                <div key={accId} style={{
                  background: P.card,
                  border: `1px solid ${isOpen ? pc.color : P.border}`,
                  borderRadius: 15,
                  marginBottom: 10,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}>
                  {/* Account header */}
                  <button
                    onClick={() => toggle(accId)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '13px 15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      borderBottom: isOpen ? `1px solid ${P.border}` : 'none',
                      transition: 'all 0.2s ease',
                    }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: pc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{pc.icon}</div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        {isIGLive && <LiveDot color={P.sageDeep} />}
                        {platformAccs.length > 1 && (
                          <span style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, background: P.borderLight, borderRadius: 10, padding: '1px 6px' }}>
                            {accIdx + 1} of {platformAccs.length}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: P.inkSoft }}>{handle}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: P.ink }}>{fmtNum(followers)}</div>
                      <div style={{ fontSize: 9, color: isIGLive ? P.sageDeep : P.inkFaint, fontFamily: F.mono }}>
                        {isIGLive ? 'synced ✓' : 'connected'}
                      </div>
                    </div>
                    <div style={{
                      color: P.inkFaint,
                      fontSize: 10,
                      marginLeft: 3,
                      transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>▼</div>
                  </button>

                  {/* Smooth expand */}
                  <div style={{
                    maxHeight: isOpen ? '2000px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div style={{ padding: '14px 15px' }}>
                      <UnifiedAccountView
                        acc={accObj}
                        igData={isIGLive ? igData : null}
                        goal={igGoal}
                        setGoal={setIgGoal}
                      />
                    </div>
                  </div>
                </div>
              );
            });
          })}

          {/* Static unconnected accounts */}
          {staticAccounts.map((acc: any, idx: number) => {
            const accId = 'static_' + idx;
            const isOpen = openIds.has(accId);
            return (
              <div key={accId} style={{
                background: P.card,
                border: `1px solid ${P.border}`,
                borderRadius: 15,
                marginBottom: 10,
                overflow: 'hidden',
                opacity: 0.7,
              }}>
                <button onClick={() => toggle(accId)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 9, borderBottom: isOpen ? `1px solid ${P.border}` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: acc.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{acc.icon}</div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{acc.platform}</div>
                    <div style={{ fontSize: 10, color: P.inkSoft }}>{acc.handle}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: P.inkFaint, fontFamily: F.mono }}>not connected</div>
                  </div>
                  <div style={{ color: P.inkFaint, fontSize: 10, marginLeft: 3, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
                </button>
                <div style={{ maxHeight: isOpen ? '400px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div style={{ padding: '14px 15px' }}>
                    <UnifiedAccountView acc={acc} igData={null} goal={igGoal} setGoal={setIgGoal} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add account CTA */}
          <a href={'/connect/invite?invite=' + client.id}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: P.card, border: `1px dashed ${P.border}`, borderRadius: 15, padding: '13px 15px', textDecoration: 'none', marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: client.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: client.colorDeep, flexShrink: 0 }}>+</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>Connect another account</div>
              <div style={{ fontSize: 10, color: P.inkSoft }}>Instagram · TikTok · YouTube · more</div>
            </div>
          </a>
        </>
      )}
    </div>
  );
};

'''

# Insert DynamicClientView before ClientView
insert_before = 'const ClientView = ('
if insert_before in content:
    content = content.replace(insert_before, DYNAMIC_CLIENT_VIEW + insert_before)
    print("✓ Added DynamicClientView component")
else:
    print("⚠ ClientView not found")

# Replace ClientView usage with DynamicClientView in the main render
old_client_render = '''        {activeClient && (
          <ClientView
            client={activeClient}
            igData={activeClient.id === 'mason' ? igData : null}
            igGoal={igGoal}
            setIgGoal={handleSetIgGoal}
          />
        )}'''

new_client_render = '''        {activeClient && (
          <DynamicClientView
            client={activeClient}
            igData={activeClient.id === 'mason' ? igData : null}
            igGoal={igGoal}
            setIgGoal={handleSetIgGoal}
          />
        )}'''

if old_client_render in content:
    content = content.replace(old_client_render, new_client_render)
    print("✓ Switched to DynamicClientView in main render")
else:
    print("⚠ Client render not found")

with open('app/page.tsx', 'w') as f:
    f.write(content)
print("\nDone — now create the accounts API route, then build")
