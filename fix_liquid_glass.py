#!/usr/bin/env python3
"""
Replaces connect page buttons with liquid glass effect.
Canvas-based liquid simulation inside each button.
Run: python3 fix_liquid_glass.py
"""

LIQUID_GLASS_CSS = """        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1612; }

        .connect-btn {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          isolation: isolate;
        }
        .connect-btn:hover { transform: translateY(-1px) scale(1.005); }
        .connect-btn:active { transform: scale(0.97); transition-duration: 0.08s; }
        .connect-btn canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .connect-btn:hover canvas { opacity: 1; }
        .connect-btn .btn-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          pointer-events: none;
        }

        /* Glass frost layer */
        .connect-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.05) 40%,
            rgba(255,255,255,0) 60%,
            rgba(0,0,0,0.08) 100%
          );
          pointer-events: none;
          z-index: 1;
          border-radius: inherit;
        }

        /* Top edge highlight */
        .connect-btn::after {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          z-index: 3;
          pointer-events: none;
        }

        .platform-card { transition: border-color 0.25s ease; }"""

LIQUID_GLASS_SCRIPT = """
  useEffect(() => {
    const btns = document.querySelectorAll('.connect-btn');
    btns.forEach((btn: any) => {
      const canvas = btn.querySelector('canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const color = btn.dataset.liquidColor || 'rgba(180,160,220,0.25)';
      const color2 = btn.dataset.liquidColor2 || 'rgba(120,100,200,0.15)';

      let W = 0, H = 0, blobs: any[] = [], raf = 0, running = false;

      const resize = () => {
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;
      };

      const initBlobs = () => {
        blobs = Array.from({ length: 5 }, (_, i) => ({
          x: W * (0.2 + Math.random() * 0.6),
          y: H * (0.2 + Math.random() * 0.6),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          r: 28 + Math.random() * 22,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.006,
        }));
      };

      const draw = (t: number) => {
        ctx.clearRect(0, 0, W, H);
        blobs.forEach(b => {
          b.x += b.vx;
          b.y += b.vy;
          b.phase += b.speed;
          const pulse = Math.sin(b.phase) * 6;
          if (b.x < 0 || b.x > W) b.vx *= -1;
          if (b.y < 0 || b.y > H) b.vy *= -1;
          const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r + pulse);
          g.addColorStop(0, color);
          g.addColorStop(0.6, color2);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + pulse, 0, Math.PI * 2);
          ctx.fill();
        });
        if (running) raf = requestAnimationFrame(draw);
      };

      const start = () => {
        if (running) return;
        running = true;
        resize();
        initBlobs();
        raf = requestAnimationFrame(draw);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, W, H);
      };

      btn.addEventListener('mouseenter', start);
      btn.addEventListener('mouseleave', stop);
      btn.addEventListener('touchstart', start, { passive: true });
      btn.addEventListener('touchend', stop);
    });
  }, []);
"""

with open('app/connect/page.tsx', 'r') as f:
    content = f.read()

# Replace CSS
old_css_start = "      <style>{\`"
old_css_end = "      \`}</style>"
css_start = content.find(old_css_start)
css_end = content.find(old_css_end, css_start) + len(old_css_end)
if css_start != -1:
    content = content[:css_start] + f"      <style>{{\`\n{LIQUID_GLASS_CSS}\n      \`}}</style>" + content[css_end:]
    print("✓ Replaced CSS")
else:
    print("⚠ CSS block not found")

# Add liquid animation useEffect after existing useEffect
old_effect = "  useEffect(() => {\n    const params = new URLSearchParams(window.location.search);"
new_effect = LIQUID_GLASS_SCRIPT + "\n\n  useEffect(() => {\n    const params = new URLSearchParams(window.location.search);"
if old_effect in content:
    content = content.replace(old_effect, new_effect)
    print("✓ Added liquid animation useEffect")
else:
    print("⚠ useEffect not found")

# Update Instagram platform config with liquid colors
old_ig_gradient = "gradient: 'linear-gradient(160deg, #e8a0b8 0%, #c4769a 25%, #9860b0 65%, #7040a0 100%)',"
new_ig = """gradient: 'linear-gradient(160deg, #2a1428 0%, #3d1a3a 30%, #2a1240 60%, #1a0a2e 100%)',
      liquidColor: 'rgba(220,140,180,0.3)',
      liquidColor2: 'rgba(160,100,220,0.18)',"""
if old_ig_gradient in content:
    content = content.replace(old_ig_gradient, new_ig)
    print("✓ Updated Instagram liquid colors")
else:
    print("⚠ Instagram gradient not found")

# Update TikTok platform config with liquid colors
old_tt_gradient = "gradient: 'linear-gradient(160deg, #0d1117 0%, #0f1f35 40%, #0a1628 70%, #111827 100%)',"
new_tt = """gradient: 'linear-gradient(160deg, #040d12 0%, #061520 30%, #041020 60%, #060d18 100%)',
      liquidColor: 'rgba(105,201,208,0.25)',
      liquidColor2: 'rgba(60,160,180,0.12)',"""
if old_tt_gradient in content:
    content = content.replace(old_tt_gradient, new_tt)
    print("✓ Updated TikTok liquid colors")
else:
    print("⚠ TikTok gradient not found")

# Update button render to include canvas and data attributes
old_btn_render = """                      <button
                        className="connect-btn"
                        onClick={() => { window.location.href = platform.connectPath; }}
                        disabled={isConnected}
                        style={{
                          width: '100%',
                          background: isConnected ? '#5a9e6620' : platform.gradient,
                          border: isConnected ? '1px solid #5a9e66'
                          : platform.id === 'instagram' ? '1px solid rgba(220,140,180,0.3)'
                          : platform.id === 'tiktok' ? '1px solid rgba(105,201,208,0.2)'
                          : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 14,
                          padding: '15px',
                          color: isConnected ? '#5a9e66' : 'rgba(255,255,255,0.92)',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: isConnected ? 'default' : 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          letterSpacing: '0.02em',
                          textShadow: isConnected ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                          boxShadow: isConnected ? 'none' : platform.id === 'instagram'
                            ? 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(180,100,160,0.35), 0 2px 8px rgba(0,0,0,0.4)'
                            : platform.id === 'tiktok'
                            ? 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(105,201,208,0.2), 0 2px 8px rgba(0,0,0,0.5)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.3)',
                          transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: isConnected ? '' : platform.logo }} />
                        {isConnected ? '✓ Connected' : `Sign in with ${platform.name}`}
                      </button>"""

new_btn_render = """                      <button
                        className="connect-btn"
                        onClick={() => { if (!isConnected) window.location.href = platform.connectPath; }}
                        disabled={isConnected}
                        data-liquid-color={(platform as any).liquidColor}
                        data-liquid-color2={(platform as any).liquidColor2}
                        style={{
                          width: '100%',
                          background: isConnected ? '#5a9e6620' : platform.gradient,
                          border: isConnected ? '1px solid #5a9e66'
                          : platform.id === 'instagram' ? '1px solid rgba(200,120,160,0.4)'
                          : platform.id === 'tiktok' ? '1px solid rgba(105,201,208,0.25)'
                          : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 14,
                          padding: '15px',
                          color: isConnected ? '#5a9e66' : 'rgba(255,255,255,0.95)',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: isConnected ? 'default' : 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          letterSpacing: '0.02em',
                          textShadow: isConnected ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
                          boxShadow: isConnected ? 'none'
                            : platform.id === 'instagram'
                            ? '0 0 0 1px rgba(200,120,180,0.15), 0 8px 40px rgba(160,80,140,0.4), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
                            : platform.id === 'tiktok'
                            ? '0 0 0 1px rgba(105,201,208,0.1), 0 8px 40px rgba(60,160,180,0.3), 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(105,201,208,0.15)'
                            : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                        }}
                      >
                        <canvas style={{ borderRadius: 14 }} />
                        <div className="btn-content">
                          <span dangerouslySetInnerHTML={{ __html: isConnected ? '' : platform.logo }} />
                          {isConnected ? '✓ Connected' : `Sign in with ${platform.name}`}
                        </div>
                      </button>"""

if old_btn_render in content:
    content = content.replace(old_btn_render, new_btn_render)
    print("✓ Updated button with canvas liquid effect")
else:
    print("⚠ Button render not found exactly")

with open('app/connect/page.tsx', 'w') as f:
    f.write(content)

print("\nDone — run: npm run build && npx vercel --prod")
