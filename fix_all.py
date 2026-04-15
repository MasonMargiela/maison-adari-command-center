#!/usr/bin/env python3
"""
Fix script for Maison Adari Command Center.
Fixes:
1. Mason card identical layout to Matt card
2. Time period switcher actually changes numbers
3. Restores full rich tab content from v5-final
4. Combined totals banner updates with time period

Run: python3 fix_all.py
"""

import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Replace the stripped tab content with full v5-final rich content
# ─────────────────────────────────────────────────────────────────────────────

OLD_TABS = '''        {view === 'trends' && (
          <div>
            <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.sageDeep, fontFamily: F.mono, marginBottom: 6 }}>Trend Radar · SoCal Food · Before the Hype</div>
              <p style={{ fontSize: 12, color: P.sageDeep, lineHeight: 1.65, margin: 0 }}>These are rising before they hit mainstream. Film first and own the SEO before the crowds arrive.</p>
            </div>
            {[
              { rank: 1, name: 'Korean BBQ Tacos LA', meta: 'TikTok Search · +840% this week · SoCal geo', tag: '🔥 Film now', tc: P.sageDeep, tb: P.sageSoft },
              { rank: 2, name: 'Birria Ramen Fusion', meta: 'TikTok + IG · +620% · Under the radar', tag: '🔥 Film now', tc: P.sageDeep, tb: P.sageSoft },
              { rank: 3, name: 'LA Smash Burger hidden gem', meta: 'Google Trends · +410% · Accelerating', tag: '↑ Rising', tc: P.butterDeep, tb: P.butterSoft },
              { rank: 4, name: 'Thai Tea Ice Cream rolls', meta: 'TikTok FYP · +290% · Just cresting', tag: '↑ Rising', tc: P.butterDeep, tb: P.butterSoft },
              { rank: 5, name: 'Wagyu Beef Dumplings', meta: 'IG Explore · +180% · Building', tag: '👁 Watch', tc: P.skyDeep, tb: P.skySoft },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '10px 13px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: P.inkFaint, width: 20, fontFamily: F.mono }}>{t.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <Tag color={t.tc} bg={t.tb}>{t.tag}</Tag>
              </div>
            ))}
          </div>
        )}

        {/* COMPETITORS */}
        {view === 'compete' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>Competitor Intelligence</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65, margin: 0 }}>Transform their hooks, topics, and angles into your niche. Compete smart, not against.</p>
            </div>
            {[
              { name: 'LAtryGuy', handle: '@latryguy · 960K YouTube', initials: 'LA', color: P.sage, play: 'LAtryGuy is LA-wide. Matt is hyperlocal South Bay + OC. Own that lane. Their audience asks for spots outside their radius — you\\'re already there.' },
              { name: "Jack's Dining Room", handle: '@jacksdiningroom · 2.3M TikTok', initials: 'JD', color: P.rose, play: 'Jack does NYC. You do SoCal. His Korean fried chicken at 1.2M — film the best Korean fried chicken in Torrance this week and ride the wave he created.' },
              { name: 'Gareth Eats', handle: '@garetheats · 750K YouTube · San Diego', initials: 'GE', color: P.butter, play: 'Gareth owns San Diego. You own South Bay and OC. The overlap is the 405 corridor. Pitch: \\'LA vs SD [food] — who wins?\\'' },
            ].map((comp, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '15px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${comp.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: P.ink, flexShrink: 0 }}>{comp.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: F.display }}>{comp.name}</div>
                    <div style={{ fontSize: 10, color: P.inkSoft }}>{comp.handle}</div>
                  </div>
                </div>
                <AIInsight text={comp.play} platform={comp.name} />
              </div>
            ))}
          </div>
        )}

        {/* PROSPECTS */}
        {view === 'prospects' && (
          <div>
            <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 15, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.butterDeep, fontFamily: F.mono, marginBottom: 6 }}>Burner Account · Active · SoCal</div>
              <p style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.75, margin: 0 }}>Monitoring 47 accounts in LA, OC, and San Diego. 3 high-priority prospects this week.</p>
            </div>
            {PROSPECTS.map((p, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${p.color}`, borderRadius: 13, padding: '14px', marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: P.inkSoft }}>{p.handle} · {p.followers} · {p.lastPost}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono }}>Heat</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: F.display, color: p.color }}>{p.heat}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>Food Quality</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.foodScore} max={10} color={P.sageDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.sageDeep }}>{p.foodScore}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 3 }}>Social</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.socialScore} max={10} color={P.roseDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.roseDeep }}>{p.socialScore}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 11 }}>{p.note}</div>
                <button style={{ background: p.colorSoft, border: `1px solid ${p.color}`, borderRadius: 20, padding: '7px 16px', color: P.ink, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reach Out via Maison Adari →</button>
              </div>
            ))}
          </div>
        )}

        {/* REVENUE */}
        {view === 'revenue' && (
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
        )}

        {/* AFE ENGINE */}
        {view === 'engine' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 7 }}>The Adari Food Engine</div>
              <div style={{ fontSize: 14, fontFamily: F.display, color: P.ink, lineHeight: 1.75, fontStyle: 'italic' }}>
                "We don't post content. We engineer virality. Every frame, hook, and caption is built to make the food so compelling it forces the viewer to act."
              </div>
            </div>
            {[
              { step: '01', label: 'Identify', desc: 'Burner account surfaces restaurants with exceptional food and underdeveloped social.', color: P.lavender },
              { step: '02', label: 'Outreach', desc: 'Value-first cold call + tailored DM. We lead with what we see, not what we sell.', color: P.rose },
              { step: '03', label: 'Analyze', desc: 'Apify scrapes top hooks in their niche. We identify psychology triggers and content gaps.', color: P.peach },
              { step: '04', label: 'Execute', desc: 'Weekly short-form content built purely off data. Nothing random, nothing guessed.', color: P.sage },
              { step: '05', label: 'Report', desc: 'Live dashboard showing growth, winners, top comments, and milestone tracking.', color: P.butter },
              { step: '06', label: 'Scale', desc: 'Creator DM agent handles inbound, qualifies by niche, and books to calendar automatically.', color: P.sky },
            ].map((s, i) => (
              <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: F.mono, color: P.ink, fontWeight: 500, flexShrink: 0 }}>{s.step}</div>
                  {i < 5 && <div style={{ width: 1, flex: 1, background: P.borderLight, marginTop: 4, minHeight: 14 }} />}
                </div>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P.ink, fontFamily: F.display, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}'''

NEW_TABS = '''        {/* TRENDS */}
        {view === 'trends' && (
          <div>
            <div style={{ background: P.sageSoft, border: `1px solid ${P.sage}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.sageDeep, fontFamily: F.mono, marginBottom: 6 }}>Trend Radar · SoCal Food · Before the Hype</div>
              <p style={{ fontSize: 12, color: P.sageDeep, lineHeight: 1.65, margin: 0 }}>These are rising before they hit mainstream. Film these first and you own the SEO before the crowds arrive.</p>
            </div>
            <SH>TikTok Search — Rising Fast</SH>
            {[
              { rank: 1, name: 'Korean BBQ Tacos LA', meta: 'TikTok Search · +840% this week · SoCal geo', tag: '🔥 Film now', tagColor: P.sageDeep, tagBg: P.sageSoft },
              { rank: 2, name: 'Birria Ramen Fusion', meta: 'TikTok + IG · +620% · Under the radar', tag: '🔥 Film now', tagColor: P.sageDeep, tagBg: P.sageSoft },
              { rank: 3, name: 'LA Smash Burger hidden gem', meta: 'Google Trends · +410% · Accelerating', tag: '↑ Rising', tagColor: P.butterDeep, tagBg: P.butterSoft },
              { rank: 4, name: 'Thai Tea Ice Cream rolls', meta: 'TikTok FYP · +290% · Just cresting', tag: '↑ Rising', tagColor: P.butterDeep, tagBg: P.butterSoft },
              { rank: 5, name: 'Wagyu Beef Dumplings', meta: 'IG Explore · +180% · Building momentum', tag: '👁 Watch', tagColor: P.skyDeep, tagBg: P.skySoft },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.inkFaint, width: 22, fontFamily: F.mono }}>{t.rank}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <Tag color={t.tagColor} bg={t.tagBg}>{t.tag}</Tag>
              </div>
            ))}
            <SH>Google Trends · Food &amp; Drink · California</SH>
            {[
              { q: 'Best birria near me', meta: 'Google Search · past 7 days · LA+OC', pct: '+890%' },
              { q: 'Torrance ramen restaurant', meta: 'Google Search · past 7 days · South Bay', pct: '+340%' },
              { q: 'matcha dessert Los Angeles', meta: 'Google Search · stable trending', pct: '+120%' },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: P.ink }}>{t.q}</div>
                  <div style={{ fontSize: 10, color: P.inkSoft, marginTop: 2 }}>{t.meta}</div>
                </div>
                <div style={{ fontSize: 12, color: P.sageDeep, fontWeight: 700 }}>{t.pct}</div>
              </div>
            ))}
          </div>
        )}

        {/* COMPETITORS */}
        {view === 'compete' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 6 }}>Competitor Intelligence</div>
              <p style={{ fontSize: 12, color: P.lavDeep, lineHeight: 1.65, margin: 0 }}>{"Don't copy them. Transform their hooks, topics, and angles into your niche. Compete with them, not against them — and when the time is right, collab."}</p>
            </div>
            {[
              {
                name: 'LAtryGuy', handle: '@latryguy · 960K YouTube · 287K IG', avatarBg: P.sageSoft, avatarColor: P.sageDeep, initials: 'LA',
                hooks: ["'Best [food] in South LA'", "'Hidden gem in [city]'", "'Nobody talks about this spot'"],
                comments: [
                  { text: 'You should cover the Korean BBQ taco spot on Olympic — been asking for months', likes: 341, note: 'opportunity alert' },
                  { text: "What's the best fried chicken in Inglewood? Cover that next", likes: 218, note: 'unserved demand' },
                ],
                play: "LAtryGuy is LA-wide. Matt is hyperlocal South Bay + OC. Own that lane. Their audience is asking for spots outside their usual radius — you're already there.",
                collab: 'Collab ready?', color: P.sage, colorSoft: P.sageSoft, colorDeep: P.sageDeep,
              },
              {
                name: "Jack's Dining Room", handle: '@jacksdiningroom · 2.3M TikTok · 3M IG', avatarBg: P.roseSoft, avatarColor: P.roseDeep, initials: 'JD',
                hooks: ["'This place did 200+ sandwiches after my video'", "'The restaurant that opened 8 locations'"],
                filming: [
                  { name: 'NYC Korean fried chicken', meta: 'Posted 2 days ago · 1.2M views' },
                  { name: 'Hidden dumpling spot, Flushing', meta: 'Posted 5 days ago · 880K views' },
                ],
                play: 'Jack does NYC. You do SoCal. Same energy, different coast. His Korean fried chicken video is at 1.2M — film the best Korean fried chicken in Torrance or OC this week and ride the algorithm wave he just created.',
                collab: 'Dream collab', color: P.rose, colorSoft: P.roseSoft, colorDeep: P.roseDeep,
              },
              {
                name: 'Gareth Eats', handle: '@garetheats · 750K YouTube · San Diego', avatarBg: P.butterSoft, avatarColor: P.butterDeep, initials: 'GE',
                play: "Gareth owns San Diego. You own South Bay and OC. The overlap is the 405 corridor — film a joint 'LA vs SD [food]' video. Pitch: 'Same food, different county — who wins?'",
                collab: 'SD collab opp', color: P.butter, colorSoft: P.butterSoft, colorDeep: P.butterDeep,
              },
            ].map((comp: any, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16, padding: '16px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: comp.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: comp.avatarColor, flexShrink: 0 }}>{comp.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display }}>{comp.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft }}>{comp.handle}</div>
                  </div>
                  <Tag color={comp.colorDeep} bg={comp.colorSoft}>{comp.collab}</Tag>
                </div>
                {comp.hooks && (
                  <>
                    <SH>Their Hooks — Transform for Your Niche</SH>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
                      {comp.hooks.map((h: string, j: number) => <Tag key={j} color={comp.colorDeep} bg={comp.colorSoft}>{h}</Tag>)}
                    </div>
                  </>
                )}
                {comp.comments && (
                  <>
                    <SH>Demand in Their Comments — Your Opportunity</SH>
                    {comp.comments.map((c: any, j: number) => (
                      <div key={j} style={{ background: comp.colorSoft, borderRadius: 10, padding: '10px 12px', marginBottom: 7 }}>
                        <div style={{ fontSize: 12, color: P.inkMid, fontStyle: 'italic' }}>"{c.text}"</div>
                        <div style={{ fontSize: 10, color: comp.colorDeep, marginTop: 5 }}>♥ {c.likes} · {c.note}</div>
                      </div>
                    ))}
                  </>
                )}
                {comp.filming && (
                  <>
                    <SH>What They're Filming This Week</SH>
                    {comp.filming.map((f: any, j: number) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: j < comp.filming.length - 1 ? `1px solid ${P.borderLight}` : 'none' }}>
                        <div style={{ fontSize: 12, color: P.ink }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: P.sageDeep }}>{f.meta}</div>
                      </div>
                    ))}
                  </>
                )}
                <AIInsight text={comp.play} platform={comp.name} />
              </div>
            ))}
          </div>
        )}

        {/* PROSPECTS */}
        {view === 'prospects' && (
          <div>
            <div style={{ background: P.butterSoft, border: `1px solid ${P.butter}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.butterDeep, fontFamily: F.mono, marginBottom: 6 }}>Burner Account · Active · SoCal</div>
              <p style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.75, margin: 0 }}>Monitoring 47 accounts in LA, OC, and San Diego. 4 high-priority prospects surfaced this week — sorted by Heat Score.</p>
            </div>
            {[...PROSPECTS].sort((a: any, b: any) => b.heat - a.heat).map((p: any, i: number) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${p.color}`, borderRadius: 14, padding: '15px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: P.inkSoft, marginTop: 2 }}>{p.handle} · {p.followers} followers · {p.lastPost}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 4 }}>Heat Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: F.display, color: p.color }}>{p.heat}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 4 }}>Food Quality</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.foodScore} max={10} color={P.sageDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.sageDeep, fontFamily: F.display }}>{p.foodScore}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: P.inkFaint, fontFamily: F.mono, marginBottom: 4 }}>Social Presence</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <MiniBar val={p.socialScore} max={10} color={P.roseDeep} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.roseDeep, fontFamily: F.display }}>{p.socialScore}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7, marginBottom: 12 }}>{p.note}</div>
                <button style={{ background: p.colorSoft, border: `1px solid ${p.color}`, borderRadius: 20, padding: '8px 18px', color: P.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.body }}>Reach Out via Maison Adari →</button>
              </div>
            ))}
          </div>
        )}

        {/* REVENUE */}
        {view === 'revenue' && (
          <div>
            <div style={{ background: P.dark, borderRadius: 18, padding: '20px', marginBottom: 18 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono, marginBottom: 12 }}>✦ Agency Revenue · Maison Adari</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Billed This Month', value: '$0', sub: '0 active clients', color: P.sage },
                  { label: 'Pipeline Value', value: '$2,400', sub: '4 prospects identified', color: P.lavender },
                  { label: 'Projected (1 Client)', value: '$800/mo', sub: 'Standard AFE rate', color: P.butter },
                  { label: 'Monthly Target', value: '$5,000', sub: '6 clients @ $800', color: P.rose },
                ].map((s, i) => (
                  <div key={i} style={{ background: P.darkCard, border: `1px solid ${P.darkBorder}`, borderRadius: 13, padding: '14px', borderTop: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 9, color: P.darkMuted, textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: F.mono, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, marginBottom: 6 }}>Progress to $5K/mo Target</div>
                <div style={{ background: P.darkBorder, borderRadius: 99, height: 8 }}>
                  <div style={{ background: P.sage, height: 8, width: '0%', borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 6, fontStyle: 'italic' }}>First client unlocks the flywheel. Everything after is momentum.</div>
              </div>
            </div>
            <SH>Pricing Tiers</SH>
            {[
              { tier: 'Starter', price: '$500/mo', desc: '2 posts/week, monthly report, basic analytics', color: P.sage },
              { tier: 'Growth', price: '$800/mo', desc: '4 posts/week, weekly report, competitor analysis, hook strategy', color: P.lavender },
              { tier: 'Pro', price: '$1,200/mo', desc: 'Daily content, live dashboard access, creator DM agent, full AFE deployment', color: P.rose },
            ].map((t, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `4px solid ${t.color}`, borderRadius: 13, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display }}>{t.tier}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.display, color: t.color }}>{t.price}</div>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid }}>{t.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* AFE ENGINE */}
        {view === 'engine' && (
          <div>
            <div style={{ background: P.lavSoft, border: `1px solid ${P.lavender}`, borderRadius: 18, padding: '18px 20px', marginBottom: 22 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.lavDeep, fontFamily: F.mono, marginBottom: 8 }}>The Adari Food Engine</div>
              <div style={{ fontSize: 15, fontFamily: F.display, color: P.ink, lineHeight: 1.75, fontStyle: 'italic' }}>{"We don't post content. We engineer virality. Every frame, hook, and caption is built to make the food so compelling it forces the viewer to act — visit, share, or remember."}</div>
            </div>
            {[
              { step: '01', label: 'Identify', desc: 'Burner account surfaces restaurants with exceptional food and underdeveloped social. We find the gap before someone else does.', color: P.lavender, colorDeep: P.lavDeep },
              { step: '02', label: 'Outreach', desc: 'Value-first cold call + tailored DM. We lead with what we see, not what we sell.', color: P.rose, colorDeep: P.roseDeep },
              { step: '03', label: 'Analyze', desc: 'Apify scrapes top hooks in their niche. We identify psychology triggers, content gaps, and exactly where the algorithm is rewarding.', color: P.peach, colorDeep: P.peachDeep },
              { step: '04', label: 'Execute', desc: 'Weekly short-form content built purely off data. Nothing random, nothing guessed.', color: P.sage, colorDeep: P.sageDeep },
              { step: '05', label: 'Report', desc: 'Live dashboard showing client growth, winners, top comments, and milestone tracking updated every 24 hours.', color: P.butter, colorDeep: P.butterDeep },
              { step: '06', label: 'Scale', desc: "Creator DM agent handles inbound, qualifies by niche + follower count, and books slots to the client's calendar automatically.", color: P.sky, colorDeep: P.skyDeep },
            ].map((s: any, i) => (
              <div key={s.step} style={{ display: 'flex', gap: 13, marginBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: F.mono, color: P.ink, fontWeight: 500, flexShrink: 0 }}>{s.step}</div>
                  {i < 5 && <div style={{ width: 2, flex: 1, background: P.borderLight, marginTop: 4, minHeight: 16 }} />}
                </div>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 13, padding: '13px 15px', flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.colorDeep, fontFamily: F.display, marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: P.inkMid, lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
            <SH children="Agent Ideas to Build" sub="What Maison Adari should deploy next" />
            {[
              { title: 'Creator DM Agent', desc: 'Monitors incoming DMs, checks follower count + niche fit, auto-responds with rate card and dates. Books to calendar.', tag: 'High Value', color: P.sage },
              { title: 'Menu Drop Scheduler', desc: "When a restaurant drops a new item, generates 3 hook variations, selects the data-winner, and queues for posting.", tag: 'Time-Saving', color: P.lavender },
              { title: 'Review Aggregator', desc: "Pulls Yelp + Google reviews weekly, surfaces best quotes for captions, flags negative sentiment before it's a PR issue.", tag: 'Reputation', color: P.butter },
              { title: 'Missed Call VAPI Agent', desc: "Answers calls when the owner can't. Takes orders, answers hours/location, logs everything to a daily digest.", tag: 'Revenue', color: P.rose },
              { title: 'Hook A/B Tester', desc: 'Posts two versions with different hooks, tracks reach in the first 2 hours, boosts the winner automatically.', tag: 'Growth', color: P.sky },
            ].map((idea: any, i) => (
              <div key={i} style={{ background: P.white, border: `1px solid ${P.border}`, borderLeft: `3px solid ${idea.color}`, borderRadius: 13, padding: '13px 15px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{idea.title}</div>
                  <Tag color={idea.color} bg={`${idea.color}25`}>{idea.tag}</Tag>
                </div>
                <div style={{ fontSize: 12, color: P.inkMid, lineHeight: 1.7 }}>{idea.desc}</div>
              </div>
            ))}
          </div>
        )}'''

if OLD_TABS in content:
    content = content.replace(OLD_TABS, NEW_TABS)
    print("✓ Restored full tab content")
else:
    print("⚠ Could not find exact tab content match — tabs may already be updated")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Fix the PROSPECTS data to include all 4 prospects
# ─────────────────────────────────────────────────────────────────────────────
OLD_PROSPECTS = """const PROSPECTS = [
  { name: 'The Patty Lab', handle: '@thepattylabburgers', followers: '3.2K', foodScore: 9.7, socialScore: 1.3, heat: 9.4, lastPost: '6 days ago', note: 'Highest food score ever logged. Near-zero social with a product that could go viral in one video. Reach out today.', color: P.sage, colorSoft: P.sageSoft },
  { name: 'Fuego Birria Tacos', handle: '@fuegobirriatacosofficial', followers: '12.4K', foodScore: 9.2, socialScore: 2.1, heat: 8.8, lastPost: '3 days ago', note: 'Food is legitimately top-tier SoCal birria. Zero content strategy. Perfect AFE candidate.', color: P.peach, colorSoft: P.peachSoft },
  { name: 'Niku Niku Ramen', handle: '@nikunikulaofficial', followers: '8.1K', foodScore: 8.4, socialScore: 3.8, heat: 7.2, lastPost: 'Yesterday', note: 'Posting consistently but hook-less. Massive organic upside untapped.', color: P.lavender, colorSoft: P.lavSoft },
];"""

NEW_PROSPECTS = """const PROSPECTS = [
  { name: 'The Patty Lab', handle: '@thepattylabburgers', followers: '3.2K', foodScore: 9.7, socialScore: 1.3, heat: 9.4, lastPost: '6 days ago', note: 'Highest food score ever logged. Best burger photography seen organically. Near-zero social with a product that could go viral in one video. Reach out today.', color: P.sage, colorSoft: P.sageSoft },
  { name: 'Fuego Birria Tacos', handle: '@fuegobirriatacosofficial', followers: '12.4K', foodScore: 9.2, socialScore: 2.1, heat: 8.8, lastPost: '3 days ago', note: 'Food is legitimately top-tier SoCal birria. Zero content strategy. Posts are blurry, no hooks. Perfect AFE candidate.', color: P.peach, colorSoft: P.peachSoft },
  { name: 'Niku Niku Ramen', handle: '@nikunikulaofficial', followers: '8.1K', foodScore: 8.4, socialScore: 3.8, heat: 7.2, lastPost: 'Yesterday', note: 'Posting consistently but hook-less. Massive organic upside untapped.', color: P.lavender, colorSoft: P.lavSoft },
  { name: 'Ume Matcha Bar', handle: '@umematchabar', followers: '5.6K', foodScore: 8.1, socialScore: 4.2, heat: 6.8, lastPost: '2 days ago', note: 'Strong aesthetic, female-skewing audience. First potential beverage client. Matcha content trending — 2 months behind the wave.', color: P.butter, colorSoft: P.butterSoft },
];"""

if OLD_PROSPECTS in content:
    content = content.replace(OLD_PROSPECTS, NEW_PROSPECTS)
    print("✓ Restored 4 prospects")
else:
    print("⚠ Prospects already updated or different format")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\nDone! Now run: npm run build && npx vercel --prod")
