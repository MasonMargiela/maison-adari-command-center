'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SelectContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    const raw = searchParams.get('accounts');
    if (raw) {
      try { setAccounts(JSON.parse(decodeURIComponent(raw))); } catch {}
    }
  }, [searchParams]);

  const handleConnect = async (acc: any) => {
    setConnecting(acc.ig_id);
    try {
      const res = await fetch('/api/connect/instagram/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ig_id: acc.ig_id, username: acc.username }),
      });
      if (res.ok) setConnected(prev => [...prev, acc.ig_id]);
    } catch {}
    setConnecting(null);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#1a1612', color: '#f0e8dc', fontFamily: "'DM Sans', sans-serif", padding: '40px 20px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a7268', fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>Maison Adari · Connect</div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Fraunces', serif", marginBottom: 8 }}>Select Accounts</div>
        <div style={{ fontSize: 13, color: '#7a7268', marginBottom: 28, lineHeight: 1.6 }}>
          Found {accounts.length} Instagram account{accounts.length !== 1 ? 's' : ''} connected to your Facebook. Select which to add.
        </div>
        {accounts.map((acc) => {
          const isConnected = connected.includes(acc.ig_id);
          const isConnecting = connecting === acc.ig_id;
          return (
            <div key={acc.ig_id} style={{ background: '#242018', border: `1px solid ${isConnected ? '#5a9e66' : '#3a342c'}`, borderRadius: 16, padding: '16px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              {acc.picture
                ? <img src={acc.picture} alt={acc.username} style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                : <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3a342c', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📸</div>
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0e8dc' }}>@{acc.username}</div>
                <div style={{ fontSize: 11, color: '#7a7268', marginTop: 2 }}>{Number(acc.followers).toLocaleString()} followers · {acc.page_name}</div>
              </div>
              <button onClick={() => handleConnect(acc)} disabled={isConnected || isConnecting}
                style={{ background: isConnected ? '#5a9e6620' : 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', border: isConnected ? '1px solid #5a9e66' : 'none', borderRadius: 12, padding: '10px 18px', color: isConnected ? '#5a9e66' : '#ffffff', fontSize: 13, fontWeight: 600, cursor: isConnected ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                {isConnected ? '✓ Added' : isConnecting ? 'Adding...' : 'Add to Dashboard'}
              </button>
            </div>
          );
        })}
        {connected.length > 0 && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a href="/" style={{ background: '#5a9e66', borderRadius: 14, padding: '14px 28px', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Go to Dashboard →</a>
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="/connect" style={{ color: '#5a5248', fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: 'none' }}>← Back</a>
        </div>
      </div>
    </>
  );
}

export default function SelectAccountPage() {
  return <Suspense fallback={<div style={{ background: '#1a1612', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7268', fontFamily: 'monospace' }}>Loading accounts...</div>}><SelectContent /></Suspense>;
}
