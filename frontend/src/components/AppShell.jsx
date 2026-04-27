import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { api } from '../api/client';

const NAV_SECTIONS = [
  {
    label: 'INTELLIGENCE',
    items: [
      { to: '/dashboard',  label: 'Dashboard',       icon: '▣' },
      { to: '/alerts',     label: 'Live Shocks',     icon: '◎' },
      { to: '/map',        label: 'Global Map',      icon: '⊕' },
      { to: '/india',      label: 'India In-Depth',  icon: '◧' },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { to: '/graph',      label: 'Propagation Graph', icon: '⋯' },
      { to: '/simulate',   label: 'Shock Simulator',   icon: '◈' },
      { to: '/query',      label: 'Ask ShockMap',       icon: '◉' },
      { to: '/drugs',      label: 'Input Registry',     icon: '≡' },
      { to: '/backtest',   label: 'COVID Backtest',     icon: '◁' },
    ],
  },
];

const SEV_DOT = {
  critical: 'var(--accent)',
  high:     'var(--amber)',
  medium:   'var(--primary)',
};

export default function AppShell({ children, selectedSectors }) {
  const [health, setHealth] = useState(null);
  const location = useLocation();

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  const isLive = health?.shock_feed_mode === 'live' || !health?.shock_feed_mode;
  const isHybrid = health?.shock_feed_mode === 'hybrid_demo_live';
  const isDemoOnly = health?.shock_feed_mode === 'demo';

  const feedColor = isLive ? 'var(--green)' : isHybrid ? 'var(--amber)' : 'var(--muted)';
  const feedText  = isHybrid ? `Hybrid · ${health?.live_shocks || 0} live`
                  : isDemoOnly ? 'Curated scenarios'
                  : 'GDELT · 15 min';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--primary), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
              fontFamily: 'var(--mono)',
            }}>SM</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>ShockMap</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Intelligence Platform</div>
            </div>
          </div>

          {/* Sectors */}
          {selectedSectors?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {selectedSectors.map(s => (
                <span key={s} style={{
                  fontSize: '0.58rem', fontWeight: 700, padding: '2px 6px',
                  borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'rgba(59,130,246,0.1)', color: 'var(--primary)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>
                  {s === 'rare_earth' ? 'RARE EARTH' : s.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: '0.58rem', fontWeight: 700, color: 'var(--muted)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '4px 8px 8px',
              }}>{section.label}</div>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '7px 10px', borderRadius: 6, marginBottom: 1,
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.12s',
                })}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', opacity: 0.7, minWidth: 14 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Feed status footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <span className="live-dot" style={{ background: feedColor }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{feedText}</span>
          </div>
          {health?.engines_online != null && (
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>
              Engines: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{health.engines_online}/3 online</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children || <Outlet />}
      </main>
    </div>
  );
}
