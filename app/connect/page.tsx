'use client';

import { useState, useEffect } from 'react';

const P = {
  cream: '#faf8f4', white: '#ffffff', card: '#f6f3ee',
  border: '#e8e0d4', borderLight: '#f0ebe3',
  ink: '#1e1a16', inkMid: '#5a5248', inkSoft: '#8a8078', inkFaint: '#b8b0a4',
  dark: '#1a1612', darkCard: '#242018', darkBorder: '#3a342c',
  darkText: '#f0e8dc', darkMuted: '#7a7268',
  sage: '#aed0b2', sageSoft: '#e6f4e8', sageDeep: '#5a9e66',
  rose: '#e8b4c2', roseSoft: '#fce9ed', roseDeep: '#c4849a',
  lavender: '#c9b8e8', lavSoft: '#ede8f9', lavDeep: '#8b72cc',
  butter: '#f2dfa0', butterSoft: '#fdf6dc', butterDeep: '#b8940a',
  sky: '#b4d4f0', skySoft: '#e4f0fc', skyDeep: '#4a8ec4',
  peach: '#f2c4a0', peachSoft: '#fdeee2', peachDeep: '#c07840',
};

const F = {
  display: "'Fraunces', serif",
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

// Platform definitions
const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    colorSoft: '#fce4ef',
    colorDeep: '#c13584',
    handle: 'Connect your Instagram account',
    desc: 'Followers · Reach · Engagement · Posts · Stories · Reels',
    metrics: ['Followers', 'Following', 'Posts', 'Reach', 'Engagement Rate', 'Profile Views'],
    connectPath: '/api/connect/instagram',
    available: true,
    gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#010101',
    colorSoft: '#f0f0f0',
    colorDeep: '#010101',
    handle: 'Connect your TikTok account',
    desc: 'Followers · Views · Likes · Comments · Shares · FYP Reach',
    metrics: ['Followers', 'Following', 'Video Views', 'Likes', 'Comments', 'Shares'],
    connectPath: '/api/connect/tiktok',
    available: true,
    gradient: 'linear-gradient(135deg, #010101 0%, #69C9D0 50%, #EE1D52 100%)',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    colorSoft: '#fff0f0',
    colorDeep: '#cc0000',
    handle: 'Connect your YouTube channel',
    desc: 'Subscribers · Views · Watch Time · Impressions · CTR',
    metrics: ['Subscribers', 'Total Views', 'Watch Time', 'Impressions', 'CTR', 'Avg View Duration'],
    connectPath: '/api/connect/youtube',
    available: false,
    gradient: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    icon: '𝕏',
    color: '#000000',
    colorSoft: '#f5f5f5',
    colorDeep: '#000000',
    handle: 'Connect your X account',
    desc: 'Followers · Impressions · Engagements · Profile Visits',
    metrics: ['Followers', 'Following', 'Impressions', 'Engagements', 'Profile Visits', 'Mentions'],
    connectPath: '/api/connect/twitter',
    available: false,
    gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    color: '#000000',
    colorSoft: '#f5f5f5',
    colorDeep: '#000000',
    handle: 'Connect your Threads account',
    desc: 'Followers · Views · Likes · Replies · Reposts',
    metrics: ['Followers', 'Following', 'Views', 'Likes', 'Replies', 'Reposts'],
    connectPath: '/api/connect/threads',
    available: false,
    gradient: 'linear-gradient(135deg, #000000 0%, #444444 100%)',
  },
];

export default function ConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for successful connections
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success) setConnected(prev => [...prev, success]);
  }, []);

  const handleConnect = (platform: typeof PLATFORMS[0]) => {
    if (!platform.available) return;
    setConnecting(platform.id);
    window.location.href = platform.connectPath;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: P.dark,
      color: P.darkText,
      fontFamily: F.body,
      paddingBottom: 60,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: '32px 20px 24px',
        borderBottom: `1px solid ${P.darkBorder}`,
        background: P.dark,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: P.darkMuted, fontFamily: F.mono, marginBottom: 6 }}>
          Maison Adari · The AFE
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: F.display, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Connect Your Accounts
        </div>
        <div style={{ fontSize: 13, color: P.darkMuted, marginTop: 8, lineHeight: 1.6 }}>
          Link your social accounts to start tracking real analytics in the command center.
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>

        {/* What you'll track */}
        <div style={{
          background: P.darkCard,
          border: `1px solid ${P.darkBorder}`,
          borderRadius: 16,
          padding: '16px 18px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            What gets tracked
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '👥', label: 'Followers & Following' },
              { icon: '📊', label: 'Reach & Impressions' },
              { icon: '💬', label: 'Engagement Rate' },
              { icon: '📱', label: 'Posts & Content' },
              { icon: '🔥', label: 'Trending Detection' },
              { icon: '⭐', label: 'Top Followers' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: P.darkMuted }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
          Platforms
        </div>

        {PLATFORMS.map((platform) => {
          const isConnected = connected.includes(platform.id);
          const isExpanded = expanded === platform.id;
          const isConnecting = connecting === platform.id;

          return (
            <div key={platform.id} style={{
              background: P.darkCard,
              border: `1px solid ${isConnected ? P.sageDeep : P.darkBorder}`,
              borderRadius: 16,
              marginBottom: 12,
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              {/* Platform header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : platform.id)}
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                }}
              >
                {/* Icon with gradient bg */}
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: platform.available ? platform.gradient : P.darkBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {platform.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: F.display, color: P.darkText }}>
                      {platform.name}
                    </div>
                    {isConnected && (
                      <span style={{
                        background: `${P.sageDeep}20`,
                        border: `1px solid ${P.sageDeep}`,
                        borderRadius: 20,
                        padding: '2px 8px',
                        fontSize: 9,
                        color: P.sageDeep,
                        fontFamily: F.mono,
                        fontWeight: 600,
                      }}>✓ CONNECTED</span>
                    )}
                    {!platform.available && (
                      <span style={{
                        background: `${P.darkMuted}20`,
                        border: `1px solid ${P.darkBorder}`,
                        borderRadius: 20,
                        padding: '2px 8px',
                        fontSize: 9,
                        color: P.darkMuted,
                        fontFamily: F.mono,
                      }}>COMING SOON</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: P.darkMuted, marginTop: 2 }}>
                    {platform.desc}
                  </div>
                </div>

                <div style={{ color: P.darkMuted, fontSize: 11 }}>{isExpanded ? '▲' : '▼'}</div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${P.darkBorder}`, padding: '16px 18px' }}>
                  {/* Metrics tracked */}
                  <div style={{ fontSize: 9, color: P.darkMuted, fontFamily: F.mono, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Metrics tracked
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                    {platform.metrics.map((m, i) => (
                      <span key={i} style={{
                        background: `${P.darkBorder}`,
                        borderRadius: 20,
                        padding: '4px 10px',
                        fontSize: 11,
                        color: P.darkMuted,
                        fontFamily: F.mono,
                      }}>{m}</span>
                    ))}
                  </div>

                  {/* Connect button */}
                  {platform.available ? (
                    <button
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting || isConnected}
                      style={{
                        width: '100%',
                        background: isConnected ? `${P.sageDeep}20` : platform.gradient,
                        border: isConnected ? `1px solid ${P.sageDeep}` : 'none',
                        borderRadius: 14,
                        padding: '14px',
                        color: isConnected ? P.sageDeep : '#ffffff',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: isConnected ? 'default' : 'pointer',
                        fontFamily: F.body,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'opacity 0.2s',
                        opacity: isConnecting ? 0.7 : 1,
                      }}
                    >
                      {isConnected ? '✓ Connected' : isConnecting ? 'Opening...' : `Connect ${platform.name}`}
                    </button>
                  ) : (
                    <div style={{
                      width: '100%',
                      background: P.darkBorder,
                      borderRadius: 14,
                      padding: '14px',
                      color: P.darkMuted,
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: 'center',
                      fontFamily: F.body,
                    }}>
                      Coming soon — notified when ready
                    </div>
                  )}

                  {/* Privacy note */}
                  <div style={{ fontSize: 10, color: P.darkMuted, marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
                    Read-only access · No posting permissions · Data syncs every 5 min · Revoke anytime
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Already connected note */}
        <div style={{
          background: P.darkCard,
          border: `1px solid ${P.darkBorder}`,
          borderRadius: 14,
          padding: '14px 16px',
          marginTop: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: P.darkMuted, lineHeight: 1.6 }}>
            After connecting, your analytics sync automatically every 5 minutes.<br />
            Token refreshes happen every Sunday. Revoke access anytime from the platform settings.
          </div>
          <div style={{ marginTop: 10 }}>
            <a href="/" style={{
              color: P.darkMuted,
              fontSize: 11,
              fontFamily: F.mono,
              textDecoration: 'none',
              borderBottom: `1px solid ${P.darkBorder}`,
              paddingBottom: 1,
            }}>← Back to Command Center</a>
          </div>
        </div>

      </div>
    </div>
  );
}
