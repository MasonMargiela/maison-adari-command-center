'use client';

import { useState, useEffect } from 'react';

export default function ConnectPage() {
  const [expanded, setExpanded] = useState<string | null>('instagram');
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success) setConnected(prev => [...prev, success]);
  }, []);

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      available: true,
      connectPath: '/api/connect/instagram',
      desc: 'Followers · Reach · Engagement · Posts · Stories',
      metrics: ['Followers', 'Following', 'Posts', 'Reach', 'Engagement Rate', 'Profile Views', 'Story Views'],
      gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      logo: (
        `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px;">
          <defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f09433"/>
            <stop offset="25%" stop-color="#e6683c"/>
            <stop offset="50%" stop-color="#dc2743"/>
            <stop offset="75%" stop-color="#cc2366"/>
            <stop offset="100%" stop-color="#bc1888"/>
          </linearGradient></defs>
          <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="1.8" fill="none"/>
          <circle cx="17" cy="7" r="1.2" fill="white"/>
        </svg>`
      ),
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      available: true,
      connectPath: '/api/connect/tiktok',
      desc: 'Followers · Video Views · Likes · Comments · FYP Reach',
      metrics: ['Followers', 'Following', 'Video Views', 'Likes', 'Comments', 'Shares', 'Profile Views'],
      gradient: 'linear-gradient(135deg, #010101, #69C9D0)',
      logo: (
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px;">
          <rect width="24" height="24" rx="6" fill="#010101"/>
          <path d="M17 6.5c-.8-.5-1.4-1.3-1.6-2.2h-2.2v9.3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V9.4c-.2 0-.4-.1-.6-.1-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2V9.8c.8.5 1.7.8 2.7.8V8.4c-.5 0-1-.1-1.1-.2l.1-1.7z" fill="white"/>
          <path d="M15.9 8.4V6.7c1 .5 2 .8 3 .8V9.8c-.3 0-.6-.1-.9-.2-.8-.3-1.5-.7-2.1-1.2z" fill="#69C9D0"/>
          <path d="M15.9 6.7c.2.9.8 1.7 1.6 2.2.6.4 1.3.8 2.1 1v-2.2c-1-.2-2-.6-3.7-1z" fill="#EE1D52"/>
        </svg>`
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      available: true,
      connectPath: '/api/connect/youtube',
      desc: 'Subscribers · Views · Watch Time · Impressions · CTR',
      metrics: ['Subscribers', 'Total Views', 'Watch Time', 'Impressions', 'CTR', 'Avg View Duration', 'Revenue'],
      gradient: 'linear-gradient(135deg, #FF0000, #cc0000)',
      requiresSetup: true,
      setupNote: 'Requires Google Cloud project with YouTube Data API v3 enabled. Contact Mason to set up.',
      logo: (
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px;">
          <rect width="24" height="24" rx="6" fill="#FF0000"/>
          <path d="M20.5 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C15.5 5 12 5 12 5s-3.5 0-5.7.1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S3.2 9.6 3.2 11.2v1.5c0 1.5.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.8C7.8 18.9 12 19 12 19s3.5 0 5.7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.3-1.6.3-3.2v-1.5C20.8 9.6 20.5 8 20.5 8z" fill="white"/>
          <polygon points="10,8.5 10,15.5 16,12" fill="#FF0000"/>
        </svg>`
      ),
    },
    {
      id: 'twitter',
      name: 'X / Twitter',
      available: true,
      connectPath: '/api/connect/twitter',
      desc: 'Followers · Impressions · Engagements · Profile Visits · Mentions',
      metrics: ['Followers', 'Following', 'Impressions', 'Engagements', 'Profile Visits', 'Mentions', 'Link Clicks'],
      gradient: 'linear-gradient(135deg, #000000, #333333)',
      requiresSetup: true,
      setupNote: 'Twitter API v2 requires a developer account and Basic tier ($100/mo). Contact Mason to enable.',
      logo: (
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px;">
          <rect width="24" height="24" rx="6" fill="#000000"/>
          <path d="M17.75 4h-2.5l-3.25 4.5L8.75 4H4l5.5 7.5L4 20h2.5l3.5-4.75L13.5 20H18l-5.75-7.75L17.75 4z" fill="white"/>
        </svg>`
      ),
    },
    {
      id: 'threads',
      name: 'Threads',
      available: true,
      connectPath: '/api/connect/threads',
      desc: 'Followers · Views · Likes · Replies · Reposts · Reach',
      metrics: ['Followers', 'Following', 'Views', 'Likes', 'Replies', 'Reposts', 'Reach'],
      gradient: 'linear-gradient(135deg, #000000, #444444)',
      requiresSetup: true,
      setupNote: 'Threads API is in limited beta. Requires Meta developer app approval separate from Instagram. Contact Mason.',
      logo: (
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px;">
          <rect width="24" height="24" rx="6" fill="#000000"/>
          <path d="M16.2 11.2c-.1-.1-.3-.1-.4-.2-.1-1.5-1-2.4-2.5-2.4h-.1c-.9 0-1.6.4-2.1 1l.8.8c.3-.4.8-.6 1.3-.6.9 0 1.5.5 1.6 1.4-.5-.1-1-.1-1.6-.1-1.6 0-2.6.7-2.6 2 0 1.2 1 2 2.4 2 .8 0 1.5-.3 2-.9v.7h1.1v-2.6c.1-.4 0-.8-.1-1.1h.2zm-1.2 2.1c0 .9-.8 1.5-1.9 1.5-.7 0-1.2-.3-1.2-.9 0-.7.6-1 1.6-1 .5 0 1 .1 1.5.1v.3z" fill="white"/>
          <path d="M12 5.5C8.4 5.5 5.5 8.4 5.5 12S8.4 18.5 12 18.5 18.5 15.6 18.5 12 15.6 5.5 12 5.5zm3.1 9.9c-.6.7-1.5 1.1-2.5 1.1-2 0-3.4-1.2-3.4-2.9 0-1.1.6-2 1.6-2.5-.2-.4-.3-.8-.3-1.2 0-1.4.9-2.3 2.2-2.3.8 0 1.5.3 2 .8l-.7.7c-.3-.3-.8-.5-1.3-.5-.7 0-1.1.4-1.1 1.1 0 .3.1.7.3 1l.1.1c.4-.1.8-.1 1.2-.1 1.7 0 2.8.8 2.8 2.2v.1c.2.2.2.5.2.8 0 .6-.3 1.1-.8 1.6h-.3z" fill="white" opacity="0.4"/>
        </svg>`
      ),
    },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1612; }
        .connect-btn { transition: opacity 0.2s, transform 0.1s; }
        .connect-btn:active { transform: scale(0.98); }
        .platform-card { transition: border-color 0.2s; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#1a1612',
        color: '#f0e8dc',
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: 80,
      }}>
        {/* Header */}
        <div style={{
          padding: '40px 20px 28px',
          borderBottom: '1px solid #3a342c',
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a7268', fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
            Maison Adari · Command Center
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10 }}>
            Connect Your Accounts
          </div>
          <div style={{ fontSize: 13, color: '#7a7268', lineHeight: 1.7, maxWidth: 380 }}>
            Link your social profiles so your analytics sync automatically. Read-only access — we never post on your behalf.
          </div>
        </div>

        <div style={{ padding: '24px 20px 0' }}>
          {/* What gets tracked */}
          <div style={{ background: '#242018', border: '1px solid #3a342c', borderRadius: 16, padding: '16px 18px', marginBottom: 24 }}>
            <div style={{ fontSize: 9, color: '#7a7268', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>What gets tracked after connecting</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Followers & Following', 'Updated every 5 min'],
                ['Reach & Impressions', 'Per post + profile'],
                ['Engagement Rate', 'Likes, comments, saves'],
                ['Post Performance', 'All content types'],
                ['Trending Detection', '100K/day, 1M/month'],
                ['Biggest Followers', 'Ranked by their size'],
              ].map(([label, sub], i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, color: '#d4ccc4', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#7a7268', marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform cards */}
          {platforms.map(platform => {
            const isConnected = connected.includes(platform.id);
            const isExpanded = expanded === platform.id;

            return (
              <div key={platform.id} className="platform-card" style={{
                background: '#242018',
                border: `1px solid ${isConnected ? '#5a9e66' : '#3a342c'}`,
                borderRadius: 16,
                marginBottom: 10,
                overflow: 'hidden',
              }}>
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : platform.id)}
                  style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                >
                  <div dangerouslySetInnerHTML={{ __html: platform.logo }} style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#f0e8dc', fontFamily: "'Fraunces', serif" }}>{platform.name}</span>
                      {isConnected && (
                        <span style={{ background: '#5a9e6620', border: '1px solid #5a9e66', borderRadius: 20, padding: '2px 8px', fontSize: 9, color: '#5a9e66', fontFamily: "'DM Mono', monospace" }}>CONNECTED</span>
                      )}
                      {platform.requiresSetup && !isConnected && (
                        <span style={{ background: '#3a342c', borderRadius: 20, padding: '2px 8px', fontSize: 9, color: '#7a7268', fontFamily: "'DM Mono', monospace" }}>SETUP REQUIRED</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#7a7268', marginTop: 3 }}>{platform.desc}</div>
                  </div>
                  <div style={{ color: '#7a7268', fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #3a342c', padding: '16px 18px' }}>
                    {/* Metrics */}
                    <div style={{ fontSize: 9, color: '#7a7268', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Metrics tracked</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                      {platform.metrics.map((m, i) => (
                        <span key={i} style={{ background: '#1a1612', border: '1px solid #3a342c', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#a09080', fontFamily: "'DM Mono', monospace" }}>{m}</span>
                      ))}
                    </div>

                    {/* Setup note if required */}
                    {platform.requiresSetup && (
                      <div style={{ background: '#1a1612', border: '1px solid #b8940a40', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                        <div style={{ fontSize: 9, color: '#b8940a', fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Setup required</div>
                        <div style={{ fontSize: 12, color: '#7a7268', lineHeight: 1.6 }}>{platform.setupNote}</div>
                      </div>
                    )}

                    {/* Connect button */}
                    {!platform.requiresSetup ? (
                      <button
                        className="connect-btn"
                        onClick={() => { window.location.href = platform.connectPath; }}
                        disabled={isConnected}
                        style={{
                          width: '100%',
                          background: isConnected ? '#5a9e6620' : platform.gradient,
                          border: isConnected ? '1px solid #5a9e66' : 'none',
                          borderRadius: 14,
                          padding: '15px',
                          color: isConnected ? '#5a9e66' : '#ffffff',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: isConnected ? 'default' : 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                        }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: isConnected ? '' : platform.logo }} />
                        {isConnected ? '✓ Connected' : `Sign in with ${platform.name}`}
                      </button>
                    ) : (
                      <div style={{
                        width: '100%',
                        background: '#1a1612',
                        border: '1px solid #3a342c',
                        borderRadius: 14,
                        padding: '15px',
                        color: '#7a7268',
                        fontSize: 13,
                        textAlign: 'center',
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.5,
                      }}>
                        API credentials required · Contact Mason to enable
                      </div>
                    )}

                    {/* Privacy note */}
                    {!platform.requiresSetup && (
                      <div style={{ fontSize: 10, color: '#5a5248', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>
                        Read-only access · No posting or DM permissions · Syncs every 5 min · Revoke anytime from {platform.name} settings
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/" style={{ color: '#5a5248', fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: 'none', borderBottom: '1px solid #3a342c', paddingBottom: 1 }}>
              ← Back to Command Center
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
