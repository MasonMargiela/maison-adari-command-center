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
      desc: 'Reels · Posts · Stories · Reach · Engagement',
      metrics: ['Followers', 'Following', 'Reels Views', 'Static Post Reach', 'Story Views', 'Engagement Rate', 'Profile Views', 'Saves', 'Shares'],
      gradient: 'linear-gradient(115deg, #feda77 0%, #f5a623 12%, #f56040 25%, #e1306c 45%, #c13584 62%, #833ab4 78%, #405de6 100%)',
      hoverGradient: 'linear-gradient(115deg, #405de6 0%, #833ab4 22%, #c13584 45%, #e1306c 62%, #f56040 78%, #feda77 100%)',
      hoverClass: 'connect-btn-ig',
      logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)"/><circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="1.8" fill="none"/><circle cx="17" cy="7" r="1.2" fill="white"/></svg>`,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      available: true,
      connectPath: '/api/connect/tiktok',
      desc: 'Videos · Lives · Stories · FYP Reach · Gifts',
      metrics: ['Followers', 'Following', 'Video Views', 'Live Viewers', 'Story Views', 'Likes', 'Comments', 'Shares', 'Profile Views', 'TikTok Gifts'],
      gradient: 'linear-gradient(135deg, #010101 0%, #1a1a1a 40%, #010101 100%)',
      hoverGradient: 'linear-gradient(115deg, #ffffff 0%, #f5f5f5 50%, #efefef 100%)',
      hoverClass: 'connect-btn-tt',
      logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#010101"/><path d="M17 6.5c-.8-.5-1.4-1.3-1.6-2.2h-2.2v9.3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V9.4c-.2 0-.4-.1-.6-.1-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2V9.8c.8.5 1.7.8 2.7.8V8.4c-.5 0-1-.1-1.1-.2l.1-1.7z" fill="white"/><path d="M15.9 8.4V6.7c1 .5 2 .8 3 .8V9.8c-.3 0-.6-.1-.9-.2-.8-.3-1.5-.7-2.1-1.2z" fill="#69C9D0"/><path d="M15.9 6.7c.2.9.8 1.7 1.6 2.2.6.4 1.3.8 2.1 1v-2.2c-1-.2-2-.6-3.7-1z" fill="#EE1D52"/></svg>`,
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      available: true,
      connectPath: '/api/connect/snapchat',
      desc: 'Snaps · Stories · Spotlight · Views · Subscribers',
      metrics: ['Subscribers', 'Story Views', 'Snap Views', 'Spotlight Views', 'Story Reach', 'Engagement Rate', 'Profile Views'],
      gradient: 'linear-gradient(135deg, #1a1a00 0%, #111100 100%)',
      hoverGradient: 'linear-gradient(135deg, #1a1a00 0%, #2a2a00 100%)',
      hoverClass: 'connect-btn-snap',
      requiresSetup: true,
      setupNote: 'Snapchat Business API requires approval. Contact Mason to enable.',
                  logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0;filter:drop-shadow(0 1px 4px rgba(255,252,0,0.35))">
        <defs>
          <linearGradient id="snap_shine" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="#FFFC00"/>
        <rect width="24" height="12" rx="6" fill="url(#snap_shine)"/>
        <path d="M12 4.8c-1.8 0-3.3 1.5-3.3 3.3v.3l-.1.1c-.2.1-.5.2-.7.3-.1.1-.2.2-.1.4.1.2.3.3.5.3h.2c0 .3-.2.6-.4.9-.3.4-.7.6-1.1.7-.1 0-.2.1-.2.3 0 .3.6.5 1.4.6.1.2.1.4.3.6-.3.1-.6.2-.9.4-.1.1-.2.2-.1.4.1.1.2.2.4.2h.1c.6-.2 1.2-.3 1.7-.1.4.1.8.4 1.2.4s.8-.3 1.2-.4c.5-.2 1.1-.1 1.7.1h.1c.2 0 .3-.1.4-.2.1-.2 0-.3-.1-.4-.3-.2-.6-.3-.9-.4.1-.2.2-.4.3-.6.8-.1 1.4-.3 1.4-.6 0-.2-.1-.3-.2-.3-.4-.1-.8-.3-1.1-.7-.2-.3-.4-.6-.4-.9h.2c.2 0 .4-.1.5-.3.1-.2 0-.3-.1-.4-.2-.1-.5-.2-.7-.3l-.1-.1v-.3c0-1.8-1.5-3.3-3.3-3.3z" fill="#000000"/>
        <rect width="24" height="24" rx="6" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>
      </svg>`,
    },
    {
      id: 'kick',
      name: 'Kick',
      available: true,
      connectPath: '/api/connect/kick',
      desc: 'Live Viewers · Subscribers · Clips · Chat · Revenue',
      metrics: ['Subscribers', 'Live Viewers', 'Peak Viewers', 'Clip Views', 'Chat Messages', 'Follows Gained', 'Hours Streamed'],
      gradient: 'linear-gradient(135deg, #0a1a04 0%, #061004 100%)',
      hoverGradient: 'linear-gradient(135deg, #0a1a04 0%, #0d2206 100%)',
      hoverClass: 'connect-btn-kick',
      requiresSetup: true,
      setupNote: 'Kick API is in early access. Limited metrics available. Contact Mason to enable.',
                  logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0;filter:drop-shadow(0 1px 4px rgba(83,252,24,0.2))">
        <defs>
          <linearGradient id="kick_shine" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="#000000"/>
        <rect width="24" height="12" rx="6" fill="url(#kick_shine)"/>
        <path d="M6.5 5h2.8v5l3.6-5h3.3l-4 5.5 4.3 8.5h-3.2l-2.8-5.6L9.3 15v4H6.5V5z" fill="#53fc18"/>
        <rect width="24" height="24" rx="6" fill="none" stroke="rgba(83,252,24,0.12)" stroke-width="0.5"/>
      </svg>`,
    },
    {
      id: 'twitch',
      name: 'Twitch',
      available: true,
      connectPath: '/api/connect/twitch',
      desc: 'Live Viewers · Subscribers · Bits · Clips · Revenue',
      metrics: ['Followers', 'Subscribers', 'Live Viewers', 'Peak Viewers', 'Bits Received', 'Clip Views', 'Hours Streamed', 'Sub Revenue'],
      gradient: 'linear-gradient(135deg, #9146ff 0%, #6441a5 100%)',
      hoverGradient: 'linear-gradient(135deg, #bf94ff 0%, #9146ff 100%)',
      hoverClass: 'connect-btn-twitch',
      requiresSetup: true,
      setupNote: 'Twitch API requires developer app registration. Contact Mason to enable.',
      logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#9146FF"/><path d="M6 4l-1.5 3.5V18h4v2h2.5l2-2h3l4-4V4H6zm11.5 9.5l-2 2H12l-2 2v-2H7V6h10.5v7.5z" fill="white"/><rect x="13" y="8" width="1.5" height="4" fill="white"/><rect x="10" y="8" width="1.5" height="4" fill="white"/></svg>`,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      available: true,
      connectPath: '/api/connect/youtube',
      desc: 'Subscribers · Videos · Shorts · Live · Revenue',
      metrics: ['Subscribers', 'Total Views', 'Watch Time', 'Shorts Views', 'Live Viewers', 'Impressions', 'CTR', 'Avg View Duration', 'Revenue'],
      gradient: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
      hoverGradient: 'linear-gradient(135deg, #ff4444 0%, #FF0000 100%)',
      hoverClass: 'connect-btn-yt',
      requiresSetup: true,
      setupNote: 'Requires Google Cloud project with YouTube Data API v3 enabled. Contact Mason to set up.',
      logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M20.5 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C15.5 5 12 5 12 5s-3.5 0-5.7.1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S3.2 9.6 3.2 11.2v1.5c0 1.5.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.8C7.8 18.9 12 19 12 19s3.5 0 5.7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.3-1.6.3-3.2v-1.5C20.8 9.6 20.5 8 20.5 8z" fill="white"/><polygon points="10,8.5 10,15.5 16,12" fill="#FF0000"/></svg>`,
    },
    {
      id: 'twitter',
      name: 'X / Twitter',
      available: true,
      connectPath: '/api/connect/twitter',
      desc: 'Followers · Impressions · Engagements · Mentions',
      metrics: ['Followers', 'Following', 'Impressions', 'Engagements', 'Profile Visits', 'Mentions', 'Link Clicks'],
      gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      hoverGradient: 'linear-gradient(135deg, #333333 0%, #111111 100%)',
      hoverClass: 'connect-btn-x',
      requiresSetup: true,
      setupNote: 'Twitter API v2 requires Basic tier ($100/mo developer account). Contact Mason to enable.',
      logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0"><rect width="24" height="24" rx="6" fill="#000000"/><path d="M17.75 4h-2.5l-3.25 4.5L8.75 4H4l5.5 7.5L4 20h2.5l3.5-4.75L13.5 20H18l-5.75-7.75L17.75 4z" fill="white"/></svg>`,
    },
    {
      id: 'threads',
      name: 'Threads',
      available: true,
      connectPath: '/api/connect/threads',
      desc: 'Followers · Views · Likes · Replies · Reposts',
      metrics: ['Followers', 'Following', 'Views', 'Likes', 'Replies', 'Reposts', 'Reach', 'Engagement Rate'],
      gradient: 'linear-gradient(135deg, #101010 0%, #1c1c1c 100%)',
      hoverGradient: 'linear-gradient(135deg, #2a2a2a 0%, #111111 100%)',
      hoverClass: 'connect-btn-threads',
      requiresSetup: true,
      setupNote: 'Threads API requires separate Meta app approval from Instagram. Contact Mason.',
                  logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;flex-shrink:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))">
        <defs>
          <linearGradient id="threads_shine" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.1)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="#101010"/>
        <rect width="24" height="12" rx="6" fill="url(#threads_shine)"/>
        <path d="M15.5 11.1c-.1-.8-.5-1.4-1.1-1.8-.6-.4-1.4-.5-2.1-.3-.5.1-.9.4-1.2.8l.6.6c.2-.3.5-.5.9-.6.5-.1 1 0 1.4.3.4.3.6.7.7 1.2-.4-.1-.8-.1-1.2-.1-1.4 0-2.3.6-2.3 1.8 0 .5.2.9.6 1.2.4.3.9.4 1.4.4.7 0 1.3-.3 1.7-.8.1.3.2.5.2.8h.9c0-.5-.1-1-.3-1.4.1-.4.1-.8-.2-1.1zm-1 1.9c-.1.6-.7 1-1.4 1-.3 0-.6-.1-.8-.2-.2-.2-.3-.4-.3-.6 0-.6.5-.9 1.4-.9.4 0 .7 0 1.1.1v.6z" fill="white"/>
        <path d="M12.5 6.5c-1.2 0-2.3.4-3.1 1.2-.8.8-1.2 1.9-1.2 3.1 0 .4 0 .7.1 1.1-.2.3-.4.7-.4 1.1 0 1 .8 1.8 1.8 1.8.3 0 .6-.1.9-.2.6.3 1.2.5 1.9.5 2.5 0 4.5-2 4.5-4.5s-2-5.1-4.5-5.1zm0 8.2c-.4 0-.8-.1-1.2-.2-.2.1-.4.2-.6.2-.5 0-.9-.4-.9-.9 0-.2.1-.4.2-.6-.1-.3-.1-.6-.1-.9 0-1 .4-1.9 1-2.5.7-.7 1.6-1 2.6-1 1.9 0 3.5 1.6 3.5 3.5s-2 4.4-4.5 4.4z" fill="white" opacity="0.4"/>
        <rect width="24" height="24" rx="6" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
      </svg>`,
    },
  ];

  const allPlatformIcons = platforms.map(p => p.logo);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1612; }

        .connect-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative; overflow: hidden;
        }
        .connect-btn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }
        .connect-btn:not(:disabled):hover { transform: translateY(-1px) scale(1.005); }
        .connect-btn:not(:disabled):active { transform: scale(0.97); transition-duration: 0.08s; }

        .connect-btn-ig:hover {
          background: linear-gradient(115deg, #405de6 0%, #833ab4 22%, #c13584 45%, #e1306c 62%, #f56040 78%, #feda77 100%) !important;
          border-color: rgba(255,255,255,0.06) !important;
          box-shadow: 0 8px 40px rgba(200,50,100,0.55), inset 0 1px 0 rgba(255,255,255,0.2) !important;
          color: #fff !important;
        }
        .connect-btn-tt:hover {
          background: linear-gradient(115deg, #ffffff 0%, #f5f5f5 50%, #efefef 100%) !important;
          border-color: rgba(200,200,200,0.3) !important;
          box-shadow: 0 8px 40px rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,1) !important;
          color: #0a0a0a !important;
          text-shadow: none !important;
        }
        .connect-btn-snap:hover {
          background: linear-gradient(135deg, #FFFC00 0%, #FFE000 100%) !important;
          border-color: rgba(255,255,255,0.55) !important;
          box-shadow: 0 8px 36px rgba(255,220,0,0.35), 0 0 0 1px rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.6) !important;
          color: #ffffff !important; text-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
          backdrop-filter: blur(2px) !important;
        }
        .connect-btn-kick:hover {
          background: linear-gradient(135deg, #53fc18 0%, #3dd10f 50%, #2aaa08 100%) !important;
          border-color: rgba(83,252,24,0.4) !important;
          box-shadow: 0 8px 36px rgba(83,252,24,0.35) !important;
          color: #fff !important; text-shadow: none !important;
        }
        .connect-btn-twitch:hover {
          background: linear-gradient(135deg, #bf94ff 0%, #9146ff 100%) !important;
          border-color: rgba(145,70,255,0.3) !important;
          box-shadow: 0 8px 40px rgba(145,70,255,0.4) !important;
          color: #fff !important;
        }
        .connect-btn-yt:hover {
          background: linear-gradient(115deg, #ffffff 0%, #f5f5f5 50%, #efefef 100%) !important;
          border: 1px solid rgba(180,0,0,0.4) !important;
          box-shadow: 0 8px 40px rgba(255,255,255,0.22), 0 0 0 1px rgba(150,0,0,0.1), inset 0 1px 0 rgba(255,150,150,0.3), inset 0 -1px 0 rgba(180,0,0,0.15) !important;
          color: #FF0000 !important; text-shadow: none !important;
        }
        .connect-btn-x:hover {
          background: linear-gradient(135deg, #333 0%, #111 100%) !important;
          border-color: rgba(255,255,255,0.15) !important;
          color: #fff !important;
        }
        .connect-btn-threads:hover {
          background: linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%) !important;
          border-color: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }
        .connect-btn-twitch-rest {
          border-color: rgba(145,70,255,0.35) !important;
          box-shadow: 0 0 0 1px rgba(145,70,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08) !important;
        }
        .connect-btn-yt-rest {
          border: 1px solid rgba(180,0,0,0.45) !important;
          box-shadow: 0 0 0 1px rgba(150,0,0,0.12), inset 0 1px 0 rgba(255,100,100,0.15), inset 0 -1px 0 rgba(120,0,0,0.2) !important;
        }
        .platform-card { transition: border-color 0.25s ease; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#1a1612', color: '#f0e8dc', fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ padding: '36px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
            Maison Adari · Command Center
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
                Connect Your Accounts
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, maxWidth: 300, fontWeight: 300 }}>
                Link your profiles. Analytics sync every 5 minutes. Read-only — we never post.
              </div>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, paddingTop: 2 }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.18)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {platforms.length} platforms
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 120 }}>
                {platforms.map((p, i) => (
                  <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    dangerouslySetInnerHTML={{ __html: p.logo.replace('width:22px;height:22px', 'width:14px;height:14px') }} />
                ))}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.12)', fontFamily: "'DM Mono', monospace" }}>read-only · revoke anytime</div>
            </div>
          </div>
        </div>

        {/* What gets tracked */}
        <div style={{ margin: '20px 20px 0', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            What gets tracked after connecting
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
            {[
              ['Followers & Following', 'Every 5 minutes'],
              ['Reach & Impressions', 'Per post + profile'],
              ['Reels vs Static Posts', 'Differentiated'],
              ['Video Length Buckets', '30s / 60s / 3min+'],
              ['Story Views', 'All platforms'],
              ['Live Stream Metrics', 'Viewers, gifts, subs'],
              ['Trending Detection', '100K/day threshold'],
              ['Revenue Streams', 'Gifts, subs, AdSense'],
            ].map(([label, sub], i) => (
              <div key={i}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform list */}
        <div style={{ padding: '20px 20px 0' }}>
          {platforms.map((platform, idx) => {
            const isConnected = connected.includes(platform.id);
            const isExpanded = expanded === platform.id;

            return (
              <div key={platform.id} className="platform-card fade-up" style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${isConnected ? 'rgba(90,158,102,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16,
                marginBottom: 8,
                overflow: 'hidden',
                animationDelay: `${idx * 0.04}s`,
                opacity: 0,
              }}>
                {/* Header row */}
                <button onClick={() => setExpanded(isExpanded ? null : platform.id)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div dangerouslySetInnerHTML={{ __html: platform.logo }} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#f0e8dc', fontFamily: "'Fraunces', serif" }}>{platform.name}</span>
                      {isConnected && <span style={{ fontSize: 8, color: '#5a9e66', background: 'rgba(90,158,102,0.15)', border: '1px solid rgba(90,158,102,0.3)', borderRadius: 20, padding: '2px 7px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>LIVE</span>}
                      {(platform as any).requiresSetup && !isConnected && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '2px 7px', fontFamily: "'DM Mono', monospace" }}>SETUP REQ.</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{platform.desc}</div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, fontFamily: "'DM Mono', monospace", transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: '16px' }}>
                    {/* Metrics */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                      {platform.metrics.map((m, i) => (
                        <span key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '3px 10px', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>{m}</span>
                      ))}
                    </div>

                    {/* Setup note */}
                    {(platform as any).requiresSetup && (
                      <div style={{ background: 'rgba(184,148,10,0.07)', border: '1px solid rgba(184,148,10,0.18)', borderRadius: 12, padding: '10px 13px', marginBottom: 14 }}>
                        <div style={{ fontSize: 8, color: 'rgba(184,148,10,0.7)', fontFamily: "'DM Mono', monospace", marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Setup required</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, fontWeight: 300 }}>{(platform as any).setupNote}</div>
                      </div>
                    )}

                    {/* Connect button */}
                    <button
                      className={`connect-btn ${(platform as any).hoverClass || ''}${platform.id === 'twitch' ? ' connect-btn-twitch-rest' : ''}${platform.id === 'youtube' ? ' connect-btn-yt-rest' : ''}`}
                      onClick={() => !isConnected && (window.location.href = platform.connectPath)}
                      disabled={isConnected}
                      style={{
                        width: '100%',
                        background: isConnected ? 'rgba(90,158,102,0.1)' : platform.gradient,
                        border: `1px solid ${isConnected ? 'rgba(90,158,102,0.3)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: 13,
                        padding: '13px 16px',
                        color: isConnected ? '#5a9e66' : (platform.id === 'snapchat' ? '#1a1600' : 'rgba(255,255,255,0.95)'),
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: isConnected ? 'default' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 9,
                        letterSpacing: '0.02em',
                        textShadow: isConnected ? 'none' : '0 1px 3px rgba(0,0,0,0.35)',
                        boxShadow: isConnected ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      {!isConnected && <span dangerouslySetInnerHTML={{ __html: platform.logo }} />}
                      {isConnected ? '✓ Connected' : `Sign in with ${platform.name}`}
                    </button>

                    {!isConnected && (
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', marginTop: 10, textAlign: 'center', fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>
                        read-only · no posting · syncs every 5 min · revoke anytime
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', padding: '0 20px' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: "'DM Mono', monospace", textDecoration: 'none', letterSpacing: '0.05em' }}>
            ← command center
          </a>
        </div>
      </div>
    </>
  );
}
