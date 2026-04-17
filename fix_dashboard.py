#!/usr/bin/env python3

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Fix graph sizing bug — remove the resize listener that causes shape shifting
# The SVG should use 100% width via CSS only, not track JS width
old_graph_size = '''  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setW(containerRef.current.offsetWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);'''

new_graph_size = '''  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const newW = containerRef.current.getBoundingClientRect().width;
        if (newW > 0) setW(newW);
      }
    };
    // Delay initial measure to ensure DOM is ready
    const timer = setTimeout(update, 50);
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);'''

if old_graph_size in content:
    content = content.replace(old_graph_size, new_graph_size)
    print("✓ Fixed graph sizing — using ResizeObserver")
else:
    print("⚠ Graph size effect not found")

# 2. Fix unfollows — calculate from history (days where delta < 0)
old_summary = '''      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
        {[
          { label: 'Net Change', value: data.length >= 2 ? (data[data.length-1].followers - data[0].followers >= 0 ? '+' : '') + (data[data.length-1].followers - data[0].followers) : '—' },
          { label: 'Total Follows', value: data.length >= 2 ? '+' + data.reduce((s: number, d: any) => s + Math.max(0, d.delta ?? 0), 0) : '—' },
          { label: 'Total Unfollows', value: '0' },
        ].map((s, i) => ('''

new_summary = '''      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
        {[
          { label: 'Net Change', value: data.length >= 2 ? (data[data.length-1].followers - data[0].followers >= 0 ? '+' : '') + (data[data.length-1].followers - data[0].followers) : '—' },
          { label: 'Total Follows', value: data.length >= 2 ? '+' + data.reduce((s: number, d: any) => s + Math.max(0, d.delta ?? 0), 0) : '—' },
          { label: 'Total Unfollows', value: data.length >= 2 ? String(data.reduce((s: number, d: any) => s + Math.abs(Math.min(0, d.delta ?? 0)), 0)) : '0' },
        ].map((s, i) => ('''

if old_summary in content:
    content = content.replace(old_summary, new_summary)
    print("✓ Fixed total unfollows — calculated from negative deltas")
else:
    print("⚠ Summary stats not found — trying alternate")
    # Try to find and fix just the unfollows value
    content = content.replace(
        "{ label: 'Total Unfollows', value: '0' }",
        "{ label: 'Total Unfollows', value: data.length >= 2 ? String(data.reduce((s: number, d: any) => s + Math.abs(Math.min(0, d.delta ?? 0)), 0)) : '0' }"
    )
    print("✓ Fixed unfollows via targeted replace")

# 3. Remove the duplicate period switcher in Content Performance section
# Keep only one period switcher (the one in the followers card)
# Replace the Content Performance switcher with a static label
old_content_switcher = '''        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Content Performance</div>
          <div style={{ display: 'flex', background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 2, gap: 1 }}>
            {(['day', 'wk', 'mo', 'yr'] as const).map(p => (
              <button key={p} onClick={() => setTimePeriod(p === 'day' ? 'day' : p === 'wk' ? 'week' : p === 'mo' ? 'month' : 'year')}
                style={{ background: (timePeriod === 'day' && p === 'day') || (timePeriod === 'week' && p === 'wk') || (timePeriod === 'month' && p === 'mo') || (timePeriod === 'year' && p === 'yr') ? acc.colorDeep : 'none', color: (timePeriod === 'day' && p === 'day') || (timePeriod === 'week' && p === 'wk') || (timePeriod === 'month' && p === 'mo') || (timePeriod === 'year' && p === 'yr') ? P.white : P.inkSoft, border: 'none', borderRadius: 12, padding: '3px 8px', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: F.mono }}>
                {p}
              </button>
            ))}
          </div>
        </div>'''

new_content_switcher = '''        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F.mono }}>Content Performance</div>
          <div style={{ fontSize: 9, color: acc.colorDeep, fontFamily: F.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {timePeriod === 'day' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'this year'}
          </div>
        </div>'''

if old_content_switcher in content:
    content = content.replace(old_content_switcher, new_content_switcher)
    print("✓ Removed duplicate period switcher from Content Performance")
else:
    print("⚠ Content switcher not found")

# 4. Add likes/saves/shares to the content stats grid
old_content_grid = '''          {[
            { label: 'Posts', value: posts.length > 0 ? String(posts.length) : '—', sub: timePeriod === 'day' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'this year' },
            { label: 'Total Likes', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.like_count ?? p.likes ?? 0), 0)) : '—', sub: 'combined' },
            { label: 'Total Comments', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.comments_count ?? p.comments ?? 0), 0)) : '—', sub: 'combined' },
          ].map((s, i) => ('''

new_content_grid = '''          {[
            { label: 'Posts', value: posts.length > 0 ? String(posts.length) : '—', sub: timePeriod === 'day' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'this year' },
            { label: 'Likes', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.like_count ?? p.likes ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Comments', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.comments_count ?? p.comments ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Saves', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.saved ?? p.saves ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Shares', value: posts.length > 0 ? fmtNum(posts.reduce((s: number, p: any) => s + (p.shares_count ?? p.shares ?? 0), 0)) : '—', sub: 'total' },
            { label: 'Reach', value: isLive ? reachDisplay : '—', sub: 'impressions' },
          ].map((s, i) => ('''

if old_content_grid in content:
    content = content.replace(old_content_grid, new_content_grid)
    print("✓ Added Saves and Shares to content stats")
else:
    print("⚠ Content grid not found")

# 5. Fix content grid columns to accommodate 6 items
old_grid_cols = '''        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>'''
new_grid_cols = '''        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>'''

if old_grid_cols in content:
    content = content.replace(old_grid_cols, new_grid_cols)
    print("✓ Content grid columns adjusted for 6 items")

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("\nDone — run: npm run build && npx vercel --prod")
