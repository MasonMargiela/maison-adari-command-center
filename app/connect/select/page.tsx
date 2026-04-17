'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SelectContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [addingAll, setAddingAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = searchParams.get('accounts');
    if (raw) {
      try { setAccounts(JSON.parse(decodeURIComponent(raw))); } catch {}
    }
  }, [searchParams]);

  const saveAccount = async (acc: any) => {
    const res = await fetch('/api/connect/instagram/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ig_id: acc.ig_id, username: acc.username }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Save failed');
    }
    return true;
  };

  const handleConnect = async (acc: any) => {
    setConnecting(acc.ig_id);
    setError('');
    try {
      await saveAccount(acc);
      setConnected(prev => [...prev, acc.ig_id]);
    } catch (e: any) {
      setError(e.message);
    }
    setConnecting(null);
  };

  const handleAddAll = async () => {
    setAddingAll(true);
    setError('');
    for (const acc of accounts) {
      if (!connected.includes(acc.ig_id)) {
        try {
          await saveAccount(acc);
          setConnected(prev => [...prev, acc.ig_id]);
        } catch {}
      }
    }
    setAddingAll(false);
  };

  const allConnected = accounts.length > 0 && accounts.every(a => connected.includes(a.ig_id));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0c09; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .acc-card { transition: border-color 0.3s ease, background 0.3s ease; animation: fadeIn 0.3s ease forwards; }
        .add-btn {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative; overflow: hidden;
        }
        .add-btn:not(:disabled):hover { transform: scale(1.04); }
        .add-btn:not(:disabled):active { transform: scale(0.95); }
        .add-btn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0e0c09', color: '#f0e8dc', fontFamily: "'DM Sans', sans-serif", padding: '44px 22px', paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
          Maison Adari · The AFE
        </div>
        <div style={{ fontSize: 30, fontWeight: 300, fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8, color: '#f0e8dc' }}>
          Select<br /><em style={{ fontWeight: 700, fontStyle: 'italic' }}>Accounts</em>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 28, lineHeight: 1.6, fontWeight: 300 }}>
          {accounts.length} Instagram account{accounts.length !== 1 ? 's' : ''} found · select which to sync
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(196,132,154,0.1)', border: '1px solid rgba(196,132,154,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#c4849a', fontFamily: "'DM Mono', monospace" }}>
            ⚠ {error}
          </div>
        )}

        {/* Account cards */}
        {accounts.map((acc, idx) => {
          const isConnected = connected.includes(acc.ig_id);
          const isConnecting = connecting === acc.ig_id;

          return (
            <div key={acc.ig_id} className="acc-card" style={{
              background: isConnected ? 'rgba(90,158,102,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isConnected ? 'rgba(90,158,102,0.4)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 18,
              padding: '16px 18px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              animationDelay: `${idx * 0.06}s`,
              opacity: 0,
            }}>
              {acc.picture
                ? <img src={acc.picture} alt={acc.username} style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: `2px solid ${isConnected ? 'rgba(90,158,102,0.5)' : 'rgba(255,255,255,0.08)'}` }} />
                : <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📸</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isConnected ? '#5a9e66' : '#f0e8dc', fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}>
                  @{acc.username}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                  {Number(acc.followers).toLocaleString()} followers · {acc.page_name}
                </div>
                {isConnected && (
                  <div style={{ fontSize: 9, color: '#5a9e66', fontFamily: "'DM Mono', monospace", marginTop: 5, letterSpacing: '0.1em' }}>
                    SYNCING · LIVE ●
                  </div>
                )}
              </div>

              {/* Add button */}
              <button
                className="add-btn"
                onClick={() => handleConnect(acc)}
                disabled={isConnected || !!isConnecting}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: isConnected
                    ? 'rgba(90,158,102,0.15)'
                    : isConnecting
                    ? 'rgba(255,255,255,0.04)'
                    : '#1e1a16',
                  border: `1px solid ${isConnected ? 'rgba(90,158,102,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: isConnected ? '#5a9e66' : 'rgba(255,255,255,0.9)',
                  fontSize: isConnected ? 16 : isConnecting ? 12 : 20,
                  cursor: isConnected || isConnecting ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isConnected || isConnecting ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                {isConnected ? '✓' : isConnecting ? '···' : '+'}
              </button>
            </div>
          );
        })}

        {/* Add All — below accounts, subtle */}
        {accounts.length > 1 && !allConnected && (
          <button
            onClick={handleAddAll}
            disabled={addingAll}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '13px',
              color: addingAll ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 500,
              cursor: addingAll ? 'default' : 'pointer',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 6,
              marginBottom: 20,
              transition: 'all 0.2s ease',
            }}>
            {addingAll ? 'Adding all...' : `+ Sync all ${accounts.length} accounts at once`}
          </button>
        )}

        {/* Go to dashboard */}
        {connected.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <a href="/" style={{
              display: 'inline-block',
              background: '#1e1a16',
              border: '1px solid rgba(90,158,102,0.4)',
              borderRadius: 14,
              padding: '14px 32px',
              color: '#5a9e66',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.01em',
            }}>
              {allConnected ? 'Open Dashboard →' : `Continue with ${connected.length} →`}
            </a>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="/connect" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: "'DM Mono', monospace", textDecoration: 'none', letterSpacing: '0.05em' }}>← back</a>
        </div>
      </div>
    </>
  );
}

export default function SelectAccountPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0e0c09', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: 11 }}>
        loading...
      </div>
    }>
      <SelectContent />
    </Suspense>
  );
}
