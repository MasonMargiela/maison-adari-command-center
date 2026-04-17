#!/usr/bin/env python3

with open('app/page.tsx', 'r') as f:
    content = f.read()

old_graph = '''const FollowerGraph = ({ accountId, color, colorSoft }: { accountId?: string; color: string; colorSoft: string }) => {
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
  }, [accountId, range]);'''

new_graph = '''const FollowerGraph = ({ accountId, color, colorSoft }: { accountId?: string; color: string; colorSoft: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [hovered, setHovered] = useState<any>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(300);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setW(containerRef.current.offsetWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    fetch('/api/sync/instagram/history?days=' + range)
      .then(r => r.json())
      .then(d => { setData(d.history ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [accountId, range]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length < 2) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padL = 40, padR = 12;
    const innerW = w - padL - padR;
    const idx = Math.round(((mouseX - padL) / innerW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const px = padL + (clamped / (data.length - 1)) * innerW;
    setHoverX(px);
    setHovered(data[clamped]);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHovered(null);
  };'''

if old_graph in content:
    content = content.replace(old_graph, new_graph)
    print("✓ Updated FollowerGraph state and mouse handlers")
else:
    print("⚠ Graph start not found")

# Replace the SVG section — add hover line, remove click dots, fix delta bars
old_svg = '''      {/* SVG graph */}
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
          );'''

new_svg = '''      {/* SVG graph */}
      <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} width={w} height={h}
        style={{ display: 'block', width: '100%', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
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

        {/* Hover vertical line */}
        {hoverX !== null && (
          <line x1={hoverX} y1={padT} x2={hoverX} y2={padT + innerH}
            stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity={0.6} />
        )}

        {/* Hover dot on line */}
        {hoverX !== null && hovered && (() => {
          const idx = data.findIndex((d: any) => d.date === hovered.date);
          const p = points[idx];
          return p ? <circle cx={p.x} cy={p.y} r={5} fill={color} stroke="#fff" strokeWidth="2" /> : null;
        })()}

        {/* Delta bars — green gains, red losses, taller for visibility */}
        {points.map((p, i) => {
          const delta = data[i].delta ?? 0;
          if (delta === 0) return null;
          const barH = Math.max(Math.abs(delta) * 3, 3);
          const barColor = delta > 0 ? '#5a9e66' : '#c4849a';
          return (
            <rect key={i} x={p.x - 2} y={padT + innerH + 4}
              width={4} height={barH}
              fill={barColor} opacity={0.85} rx={1}
            />
          );'''

if old_svg in content:
    content = content.replace(old_svg, new_svg)
    print("✓ Updated SVG with hover slider and delta bars")
else:
    print("⚠ SVG section not found")

# Close the new div after svg closing tag
old_svg_close = '''      </svg>

      {/* Summary stats */}'''
new_svg_close = '''      </svg>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div style={{ background: colorSoft, borderRadius: 10, padding: '8px 12px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>{formatDate(hovered.date)}</div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Fraunces', serif", color: '#1e1a16' }}>{hovered.followers.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>CHANGE</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces', serif",
              color: hovered.delta > 0 ? '#5a9e66' : hovered.delta < 0 ? '#c4849a' : '#8a8078' }}>
              {hovered.delta > 0 ? '+' : ''}{hovered.delta}
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}'''

if old_svg_close in content:
    content = content.replace(old_svg_close, new_svg_close)
    print("✓ Added hover tooltip")
else:
    print("⚠ SVG close not found")

# Remove the old selected day detail panel since we replaced with hover
old_selected = '''      {/* Selected day detail */}
      {selected && (
        <div style={{ background: colorSoft, borderRadius: 10, padding: '10px 13px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>{formatDate(selected.date)}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces', serif", color: '#1e1a16' }}>{selected.followers.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#8a8078', fontFamily: "'DM Mono', monospace" }}>CHANGE</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: selected.delta > 0 ? '#5a9e66' : selected.delta < 0 ? '#c4849a' : '#8a8078', fontFamily: "'Fraunces', serif" }}>
              {selected.delta > 0 ? '+' : ''}{selected.delta}
            </div>
          </div>
        </div>
      )}

      {/* SVG graph */}'''

new_selected = '''      {/* SVG graph */}'''

if old_selected in content:
    content = content.replace(old_selected, new_selected)
    print("✓ Removed old click-to-select panel")
else:
    print("⚠ Old selected panel not found")

# Fix period switcher — calculate real gains from snapshot data
# Find applyTimePeriod function and update to use real history data
old_apply = '''function applyTimePeriod(weeklyVal: number, period: string): { value: number; label: string } {
  if (period === 'week') return { value: weeklyVal, label: 'this week' };
  if (period === 'month') return { value: Math.round(weeklyVal * 4.3), label: 'this month' };
  if (period === 'year') return { value: Math.round(weeklyVal * 52), label: 'this year' };
  return { value: Math.round(weeklyVal / 7), label: 'today' };
}'''

new_apply = '''function applyTimePeriod(weeklyVal: number, period: string): { value: number; label: string } {
  if (period === 'week') return { value: weeklyVal, label: 'this week' };
  if (period === 'month') return { value: Math.round(weeklyVal * 4.3), label: 'this month' };
  if (period === 'year') return { value: Math.round(weeklyVal * 52), label: 'this year' };
  return { value: Math.round(weeklyVal / 7), label: 'today' };
}

function calcGainFromHistory(history: any[], days: number): number {
  if (!history || history.length < 2) return 0;
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const filtered = history.filter((d: any) => new Date(d.date) >= cutoff);
  if (filtered.length < 2) return 0;
  return (filtered[filtered.length - 1].followers ?? 0) - (filtered[0].followers ?? 0);
}'''

if old_apply in content:
    content = content.replace(old_apply, new_apply)
    print("✓ Added calcGainFromHistory helper")
else:
    print("⚠ applyTimePeriod not found")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\nDone — run: npm run build && npx vercel --prod")
