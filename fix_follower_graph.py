#!/usr/bin/env python3
"""
Adds a real follower growth graph to the Instagram account view.
Pulls daily data from Supabase snapshots.
Shows gains, losses, and net change per day.
Run: python3 fix_follower_graph.py
"""

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Add a new API route call inside UnifiedAccountView to fetch historical data
# Insert the FollowerGraph component before UnifiedAccountView

FOLLOWER_GRAPH_COMPONENT = '''
// ── FOLLOWER GROWTH GRAPH ─────────────────────────────────────────────────
const FollowerGraph = ({ accountId, color, colorSoft }: { accountId?: string; color: string; colorSoft: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [selected, setSelected] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(300);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setW(Math.min(window.innerWidth - 60, 600));
    }
  }, []);

  useEffect(() => {
    if (!accountId) {
      // Use Mason's known account ID from Supabase
      fetch('/api/sync/instagram/history?days=' + range)
        .then(r => r.json())
        .then(d => { setData(d.history ?? []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [accountId, range]);

  if (loading) return (
    <div style={{ background: colorSoft, borderRadius: 12, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>Loading graph...</div>
    </div>
  );

  if (data.length < 2) return (
    <div style={{ background: colorSoft, borderRadius: 12, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#1e1a16', marginBottom: 4 }}>Graph building...</div>
      <div style={{ fontSize: 11, color: '#8a8078', lineHeight: 1.6 }}>
        Data accumulates over time. Check back tomorrow to see your first growth curve.
      </div>
    </div>
  );

  const h = 140;
  const padL = 40, padR = 12, padT = 12, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const values = data.map((d: any) => d.followers);
  const deltas = data.map((d: any) => d.delta ?? 0);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range2 = maxVal - minVal || 1;

  const points = data.map((d: any, i: number) => {
    const x = padL + (i / (data.length - 1)) * innerW;
    const y = padT + (1 - (d.followers - minVal) / range2) * innerH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length-1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Range switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: '#b8b0a4', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Follower Growth
        </div>
        <div style={{ display: 'flex', background: '#f6f3ee', border: '1px solid #e8e0d4', borderRadius: 20, padding: 2, gap: 1 }}>
          {[['7', '7d'], ['14', '14d'], ['30', '30d'], ['90', '90d']].map(([val, label]) => (
            <button key={val} onClick={() => { setRange(val); setSelected(null); }}
              style={{ background: range === val ? '#1e1a16' : 'none', color: range === val ? '#ffffff' : '#8a8078', border: 'none', borderRadius: 16, padding: '3px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div style={{ background: colorSoft, borderRadius: 10, padding: '10px 13px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>{formatDate(selected.date)}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces', serif", color: '#1e1a16' }}>{selected.followers.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#8a8078', fontFamily: "'DM Mono', monospace' }}>CHANGE</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: selected.delta > 0 ? '#5a9e66' : selected.delta < 0 ? '#c4849a' : '#8a8078', fontFamily: "'Fraunces', serif" }}>
              {selected.delta > 0 ? '+' : ''}{selected.delta}
            </div>
          </div>
        </div>
      )}

      {/* SVG graph */}
      <svg ref={svgRef} width={w} height={h} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
        {/* Area fill */}
        <path d={areaD} fill={color} opacity={0.12} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Y axis labels */}
        {[0, 0.5, 1].map((t, i) => {
          const val = Math.round(minVal + t * range2);
          const y = padT + (1 - t) * innerH;
          return (
            <g key={i}>
              <line x1={padL - 4} y1={y} x2={w - padR} y2={y} stroke="#f0ebe3" strokeWidth="1" />
              <text x={padL - 7} y={y + 4} textAnchor="end" fontSize="9" fill="#b8b0a4" fontFamily="'DM Mono', monospace">
                {val >= 1000 ? (val/1000).toFixed(1)+'K' : val}
              </text>
            </g>
          );
        })}

        {/* X axis labels — show first, middle, last */}
        {[0, Math.floor(points.length/2), points.length - 1].map((i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <text key={i} x={p.x} y={h - 4} textAnchor="middle" fontSize="9" fill="#b8b0a4" fontFamily="'DM Mono', monospace">
              {formatDate(data[i].date)}
            </text>
          );
        })}

        {/* Interactive dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={selected?.date === data[i].date ? 5 : 3}
            fill={selected?.date === data[i].date ? color : '#ffffff'}
            stroke={color} strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelected(selected?.date === data[i].date ? null : data[i])}
          />
        ))}

        {/* Delta bars below x axis — green for gains, red for losses */}
        {points.map((p, i) => {
          const delta = data[i].delta ?? 0;
          if (delta === 0) return null;
          const barH = Math.min(Math.abs(delta) * 2, 8);
          const barColor = delta > 0 ? '#5a9e66' : '#c4849a';
          return (
            <rect key={i} x={p.x - 2} y={padT + innerH + 4}
              width={4} height={barH}
              fill={barColor} opacity={0.7} rx={1}
            />
          );
        })}
      </svg>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, marginTop: 10 }}>
        {[
          { label: 'Net Change', value: (data[data.length-1]?.followers ?? 0) - (data[0]?.followers ?? 0), prefix: true },
          { label: 'Total Follows', value: data.filter((d: any) => (d.delta ?? 0) > 0).reduce((s: number, d: any) => s + (d.delta ?? 0), 0), prefix: true },
          { label: 'Total Unfollows', value: Math.abs(data.filter((d: any) => (d.delta ?? 0) < 0).reduce((s: number, d: any) => s + (d.delta ?? 0), 0)), prefix: false },
        ].map((s, i) => (
          <div key={i} style={{ background: colorSoft, borderRadius: 9, padding: '9px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#b8b0a4', fontFamily: "'DM Mono', monospace", marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces', serif", color: s.prefix && s.value > 0 ? '#5a9e66' : s.prefix && s.value < 0 ? '#c4849a' : '#1e1a16' }}>
              {s.prefix && s.value > 0 ? '+' : ''}{s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

'''

# Insert before UnifiedAccountView
insert_before = '// ── UNIFIED ACCOUNT VIEW'
if insert_before not in content:
    insert_before = 'const UnifiedAccountView = ('

if insert_before in content:
    content = content.replace(insert_before, FOLLOWER_GRAPH_COMPONENT + insert_before)
    print("✓ Added FollowerGraph component")
else:
    print("⚠ Could not find insertion point")

# Now add FollowerGraph inside UnifiedAccountView after the followers card
old_engagement_section = '''      {/* Engagement + Reach with sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 8 }}>'''

new_engagement_section = '''      {/* Follower growth graph — only for live accounts */}
      {isLive && (
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 15px', marginBottom: 8, borderTop: `2.5px solid ${acc.color}` }}>
          <FollowerGraph color={acc.colorDeep} colorSoft={acc.colorSoft} />
        </div>
      )}

      {/* Engagement + Reach with sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 8 }}>'''

if old_engagement_section in content:
    content = content.replace(old_engagement_section, new_engagement_section)
    print("✓ Added FollowerGraph to UnifiedAccountView")
else:
    print("⚠ Could not find engagement section")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\nDone — now create the history API route, then build")
