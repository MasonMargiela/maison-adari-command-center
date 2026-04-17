'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ── Color palette — auto-assigned to clients in order ─────────────────────
const CLIENT_COLORS = [
  { color: '#aed0b2', colorDeep: '#5a9e66', colorSoft: '#e6f4e8', name: 'sage' },
  { color: '#c9b8e8', colorDeep: '#8b72cc', colorSoft: '#ede8f9', name: 'lavender' },
  { color: '#f2c4a0', colorDeep: '#c07840', colorSoft: '#fdeee2', name: 'peach' },
  { color: '#b4d4f0', colorDeep: '#4a8ec4', colorSoft: '#e4f0fc', name: 'sky' },
  { color: '#f2dfa0', colorDeep: '#b8940a', colorSoft: '#fdf6dc', name: 'butter' },
  { color: '#e8b4c2', colorDeep: '#c4849a', colorSoft: '#fce9ed', name: 'rose' },
];

function getColorForClient(clientId: string) {
  // Hash client ID to pick consistent color from palette
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLIENT_COLORS[Math.abs(hash) % CLIENT_COLORS.length];
}

// ── Known clients — add new ones here or they get auto-generated ───────────
const KNOWN_CLIENTS: Record<string, any> = {
  matt: {
    name: 'Macros Wit Matt',
    greeting: 'Hey Matt',
    role: 'Creator · Food Content · South Bay & OC',
    avatar: 'B',
    client_id: 'matt',
  },
  mason: {
    name: 'Mason',
    greeting: 'Hey Mason',
    role: 'Founder · Maison Adari',
    avatar: 'M',
    client_id: 'mason',
  },
};

const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    connectPath: '/api/connect/instagram',
    gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    logo: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;"><defs><linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f09433"/><stop offset="50%" stop-color="#dc2743"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig2)"/><circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="1.8" fill="none"/><circle cx="17" cy="7" r="1.2" fill="white"/></svg>',
    metrics: ['Followers', 'Reach', 'Engagement', 'Posts', 'Profile Views'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    connectPath: '/api/connect/tiktok',
    gradient: 'linear-gradient(135deg, #010101, #69C9D0)',
    logo: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;"><rect width="24" height="24" rx="6" fill="#010101"/><path d="M17 6.5c-.8-.5-1.4-1.3-1.6-2.2h-2.2v9.3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V9.4c-.2 0-.4-.1-.6-.1-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2V9.8c.8.5 1.7.8 2.7.8V8.4c-.5 0-1-.1-1.1-.2l.1-1.7z" fill="white"/></svg>',
    metrics: ['Followers', 'Video Views', 'Likes', 'Comments', 'Shares'],
  },
];

function ConnectInviteContent() {
  const searchParams = useSearchParams();
  const inviteCode = (searchParams.get('invite') ?? '').toLowerCase().trim();
  const [connected, setConnected] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Build client config — known or auto-generated
  const knownClient = KNOWN_CLIENTS[inviteCode];
  const clientColors = getColorForClient(inviteCode || 'default');
  
  const config = knownClient ? {
    ...knownClient,
    ...clientColors,
  } : inviteCode ? {
    name: inviteCode.charAt(0).toUpperCase() + inviteCode.slice(1),
    greeting: 'Hey ' + inviteCode.charAt(0).toUpperCase() + inviteCode.slice(1),
    role: 'Connect your social accounts',
    avatar: inviteCode.charAt(0).toUpperCase(),
    client_id: inviteCode,
    ...clientColors,
  } : null;

  useEffect(() => {
    const igSuccess = searchParams.get('ig_success');
    const igError = searchParams.get('ig_error');
    if (igSuccess) {
      setConnected(prev => [...prev, 'instagram']);
      setSuccessMsg('@' + igSuccess + ' connected successfully!');
    }
    if (igError) {
      setSuccessMsg('Error: ' + decodeURIComponent(igError));
    }
    if (inviteCode && typeof window !== 'undefined') {
      sessionStorage.setItem('invite_code', inviteCode);
      sessionStorage.setItem('invite_client_id', config?.client_id ?? inviteCode);
    }
  }, [searchParams, inviteCode]);

  const handleConnect = (platform: typeof PLATFORMS[0]) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('invite_code', inviteCode);
      sessionStorage.setItem('invite_client_id', config?.client_id ?? inviteCode);
    }
    window.location.href = platform.connectPath;
  };

  if (!config) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ minHeight: '100vh', background: '#1a1612', color: '#f0e8dc', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Fraunces', serif", marginBottom: 12 }}>Invalid invite link</div>
            <div style={{ fontSize: 13, color: '#7a7268', marginBottom: 24 }}>This link is missing an invite code. Contact Mason for a valid link.</div>
            <a href="/" style={{ color: '#7a7268', fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: 'none' }}>← Dashboard</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1612; }

        .connect-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .connect-btn:not(:disabled):hover { transform: translateY(-1px) scale(1.005); }
        .connect-btn:not(:disabled):active { transform: scale(0.97); transition-duration: 0.08s; }
        .connect-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          z-index: 3;
        }
        .connect-btn-ig:hover {
          background: linear-gradient(115deg, #f5c400 0%, #f55f00 20%, #e8264e 45%, #b02f7a 70%, #6f32a0 100%) !important;
          border-color: rgba(255,255,255,0.04) !important;
          box-shadow: 0 0 0 1px rgba(220,80,80,0.25), 0 8px 36px rgba(200,40,90,0.5), 0 4px 14px rgba(240,90,0,0.3) !important;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
        .connect-btn-tt:hover {
          background: linear-gradient(115deg, #ffffff 0%, #f9f9f9 30%, #f3f3f3 60%, #fafafa 100%) !important;
          border-color: rgba(255,255,255,0.03) !important;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.6), 0 8px 38px rgba(255,255,255,0.32), 0 4px 18px rgba(255,255,255,0.2) !important;
          color: #0a0a0a !important;
          text-shadow: none !important;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#1a1612', color: '#f0e8dc', fontFamily: "'DM Sans', sans-serif", paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ padding: '40px 20px 28px', borderBottom: '1px solid #3a342c' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a7268', fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
            Maison Adari · Command Center
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: config.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: config.colorDeep, fontFamily: "'Fraunces', serif", flexShrink: 0 }}>
              {config.avatar}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Fraunces', serif", lineHeight: 1.1 }}>{config.greeting} 👋</div>
              <div style={{ fontSize: 12, color: '#7a7268', marginTop: 4 }}>{config.role}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#a09080', lineHeight: 1.7 }}>
            Connect your accounts to start seeing real analytics in your Maison Adari dashboard. Read-only access — we never post on your behalf.
          </div>
        </div>

        <div style={{ padding: '24px 20px 0' }}>

          {successMsg && (
            <div style={{ background: successMsg.includes('Error') ? '#c4849a20' : '#5a9e6620', border: '1px solid ' + (successMsg.includes('Error') ? '#c4849a' : '#5a9e66'), borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: successMsg.includes('Error') ? '#c4849a' : '#5a9e66' }}>
              {successMsg.includes('Error') ? '⚠ ' : '✓ '}{successMsg}
            </div>
          )}

          <div style={{ fontSize: 9, color: '#7a7268', fontFamily: "'DM Mono', monospace", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
            Connect your platforms
          </div>

          {PLATFORMS.map(platform => {
            const isConnected = connected.includes(platform.id);
            return (
              <div key={platform.id} style={{ background: '#242018', border: '1px solid ' + (isConnected ? '#5a9e66' : '#3a342c'), borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span dangerouslySetInnerHTML={{ __html: platform.logo }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#f0e8dc', fontFamily: "'Fraunces', serif" }}>{platform.name}</span>
                        {isConnected && (
                          <span style={{ background: '#5a9e6620', border: '1px solid #5a9e66', borderRadius: 20, padding: '2px 8px', fontSize: 9, color: '#5a9e66', fontFamily: "'DM Mono', monospace" }}>CONNECTED</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {platform.metrics.map((m: string, i: number) => (
                      <span key={i} style={{ background: '#1a1612', border: '1px solid #3a342c', borderRadius: 20, padding: '3px 9px', fontSize: 10, color: '#7a7268', fontFamily: "'DM Mono', monospace" }}>{m}</span>
                    ))}
                  </div>
                  <button onClick={() => handleConnect(platform)} disabled={isConnected}
                    style={{ width: '100%', background: isConnected ? '#5a9e6620' : platform.gradient, border: isConnected ? '1px solid #5a9e66' : 'none', borderRadius: 12, padding: '13px', color: isConnected ? '#5a9e66' : '#ffffff', fontSize: 14, fontWeight: 600, cursor: isConnected ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {isConnected ? '✓ Connected' : 'Sign in with ' + platform.name}
                  </button>
                  <div style={{ fontSize: 10, color: '#5a5248', marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
                    Read-only · No posting · Syncs every 5 min · Revoke anytime
                  </div>
                </div>
              </div>
            );
          })}

          {connected.length > 0 && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <a href="/" style={{ background: config.colorDeep, borderRadius: 14, padding: '14px 28px', color: '#ffffff', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block', fontFamily: "'DM Sans', sans-serif" }}>
                View Dashboard →
              </a>
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#5a5248', lineHeight: 1.6 }}>
              Maison Adari · Agency Analytics<br />
              <a href="/privacy" style={{ color: '#5a5248', textDecoration: 'none' }}>Privacy</a> · <a href="/terms" style={{ color: '#5a5248', textDecoration: 'none' }}>Terms</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ConnectInvitePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#1a1612', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7268', fontFamily: 'monospace', fontSize: 12 }}>
        Loading...
      </div>
    }>
      <ConnectInviteContent />
    </Suspense>
  );
}
