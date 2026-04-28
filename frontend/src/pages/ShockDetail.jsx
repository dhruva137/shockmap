import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

const SEVERITY = {
  CRITICAL: { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', label: 'CRITICAL' },
  HIGH: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'HIGH' },
  MEDIUM: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', label: 'MEDIUM' },
  LOW: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', label: 'LOW' },
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{
      padding: '18px 20px',
      borderLeft: `3px solid ${color || 'var(--border2)'}`,
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 24px ${color || '#fff'}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <p style={{ fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.04em', color: color || 'var(--text)', marginBottom: 3, fontFamily: 'var(--mono)' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{sub}</p>
    </div>
  );
}

function EvidencePanel({ evidence }) {
  const [expanded, setExpanded] = useState(null);
  if (!evidence?.length) return null;

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: '0.72rem', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>SOURCE EVIDENCE</span>
        <span style={{ fontSize: '0.62rem', background: 'rgba(79,156,249,0.12)', color: 'var(--primary)', border: '1px solid rgba(79,156,249,0.25)', borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)' }}>
          operator context
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {evidence.map((item, index) => {
          const isOpen = expanded === index;
          return (
            <div
              key={`${item.source}-${index}`}
              onClick={() => setExpanded(isOpen ? null : index)}
              style={{
                padding: '12px 14px', background: 'var(--surface2)',
                border: `1px solid ${isOpen ? 'rgba(79,156,249,0.35)' : 'var(--border2)'}`,
                borderLeft: `3px solid ${isOpen ? 'var(--primary)' : 'var(--border2)'}`,
                borderRadius: 8, cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderLeftColor = 'var(--primary)'; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderLeftColor = 'var(--border2)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isOpen ? 'var(--primary)' : 'var(--text)' }}>{item.source}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: '0.65rem', color: 'var(--primary)', textDecoration: 'none', fontFamily: 'var(--mono)', border: '1px solid rgba(79,156,249,0.3)', borderRadius: 3, padding: '2px 6px' }}
                    >
                      OPEN ↗
                    </a>
                  )}
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>
              {isOpen && (
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border2)' }}>
                  {item.snippet}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PropagationPanel({ propagation }) {
  if (!propagation?.affected_nodes) return null;
  const nodes = Object.entries(propagation.affected_nodes).slice(0, 6);

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: '0.72rem', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>PROPAGATION MODEL</span>
        <span style={{ fontSize: '0.62rem', background: 'rgba(244,114,182,0.12)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.25)', borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)' }}>
          personalized pagerank
        </span>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 12, fontFamily: 'var(--mono)' }}>
        {propagation.formula}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {nodes.map(([id, data]) => (
          <div
            key={id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 12px',
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.79rem', fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{data.name}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                PR {Number(data.components?.pagerank || 0).toFixed(4)} | buffer {data.components?.buffer_days || '-'}d | sub {Math.round((data.components?.substitutability || 0) * 100)}%
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: data.risk_score >= 70 ? '#f43f5e' : data.risk_score >= 45 ? '#f59e0b' : '#60a5fa' }}>
                {Number(data.risk_score || 0).toFixed(0)}
              </p>
              <p style={{ fontSize: '0.66rem', color: 'var(--muted)' }}>risk</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityPanel({ community }) {
  if (!community) return null;

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Shared Cluster</span>
        <span
          style={{
            fontSize: '0.62rem',
            background: 'rgba(129,140,248,0.12)',
            color: '#818cf8',
            border: '1px solid rgba(129,140,248,0.25)',
            borderRadius: 999,
            padding: '2px 7px',
          }}
        >
          community
        </span>
      </div>
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--surface2)',
          border: '1px solid rgba(129,140,248,0.2)',
          borderLeft: '3px solid #818cf8',
          borderRadius: 8,
        }}
      >
        <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{community.label}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
          {community.size} interconnected nodes sit in this cluster, so one disruption can move several inputs together.
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(community.provinces || []).map((item) => (
            <span
              key={item}
              style={{
                fontSize: '0.68rem',
                color: '#818cf8',
                background: 'rgba(129,140,248,0.12)',
                border: '1px solid rgba(129,140,248,0.25)',
                borderRadius: 999,
                padding: '2px 8px',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopAffectedPanel({ rows, simulation }) {
  if (!rows?.length) return null;
  const adjusted = new Map((simulation?.top_affected || []).map((item) => [item.id, item]));

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: '0.72rem', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>TOP EXPOSED INPUTS</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{rows.length} modeled nodes</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row) => {
          const after = adjusted.get(row.id);
          const riskColor = row.risk_before >= 70 ? '#f43f5e' : row.risk_before >= 45 ? '#f59e0b' : '#60a5fa';
          return (
            <div
              key={row.id}
              style={{
                padding: '12px 14px', borderRadius: 8,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                transition: 'border-color 0.15s, background 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = riskColor + '40'; e.currentTarget.style.background = riskColor + '06'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{row.name}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                    {(row.reasons || []).join(' | ') || 'modeled dependency pressure'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 1 }}>Buffer</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{row.buffer_days}d</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 1 }}>Sub.</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{row.substitutability_pct}%</p>
                  </div>
                </div>
              </div>
              {/* Inline risk bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, row.risk_before)}%`, background: riskColor, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: riskColor, fontFamily: 'var(--mono)', minWidth: 28, textAlign: 'right' }}>
                  {Math.round(row.risk_before)}
                  {after && <span style={{ color: '#10b981' }}>{` →${Math.round(after.risk_after)}`}</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function ActionLadder({ actions, activeActionId, onSimulate, loadingAction }) {
  if (!actions?.length) return null;

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: '0.72rem', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>72-HOUR ACTION LADDER</span>
        <span style={{ fontSize: '0.62rem', background: 'rgba(79,156,249,0.12)', color: 'var(--primary)', border: '1px solid rgba(79,156,249,0.25)', borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)' }}>
          live simulation
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
        {actions.map((action, i) => {
          const active = activeActionId === action.id;
          const accentColors = ['#f43f5e', '#f59e0b', '#10b981'];
          const accent = accentColors[i % accentColors.length];
          return (
            <div
              key={action.id}
              onClick={() => !loadingAction && onSimulate(action.id)}
              style={{
                padding: '16px', borderRadius: 10, cursor: 'pointer',
                background: active ? `${accent}10` : 'var(--surface2)',
                border: active ? `1px solid ${accent}50` : '1px solid var(--border2)',
                borderLeft: `3px solid ${active ? accent : 'var(--border2)'}`,
                display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'all 0.18s ease',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? `0 4px 20px ${accent}20` : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderLeftColor = accent; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderLeftColor = 'var(--border2)'; e.currentTarget.style.transform = 'none'; }}}
            >
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: active ? accent : 'var(--text)', marginBottom: 4, fontFamily: 'var(--mono)', letterSpacing: '0.02em' }}>{action.label}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.6 }}>{action.summary}</p>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.62rem', color: active ? accent : 'var(--muted)', background: active ? `${accent}12` : 'var(--surface)', border: `1px solid ${active ? accent + '40' : 'var(--border)'}`, borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)' }}>
                  ${action.estimated_cost_usd_millions}M
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)' }}>
                  {action.lead_time_hours}h
                </span>
                <span style={{ fontSize: '0.62rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--mono)' }}>
                  +{action.stockout_days_delta}d cover
                </span>
              </div>

              <div style={{
                padding: '8px 12px', borderRadius: 6, textAlign: 'center',
                background: active ? accent : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? accent : 'var(--border)'}`,
                fontSize: '0.72rem', fontWeight: 700, color: active ? '#fff' : 'var(--muted)',
                fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                transition: 'all 0.15s',
                opacity: loadingAction && !active ? 0.5 : 1,
              }}>
                {loadingAction && active ? 'RUNNING...' : active ? 'IMPACT SHOWN' : 'RUN IMPACT'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeltaPanel({ simulation, fallbackMetrics }) {
  const before = simulation?.before || fallbackMetrics;
  const after = simulation?.after || null;

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Action Delta</span>
        <span
          style={{
            fontSize: '0.62rem',
            background: simulation ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
            color: simulation ? 'var(--green)' : 'var(--muted)',
            border: `1px solid ${simulation ? 'rgba(16,185,129,0.25)' : 'rgba(107,114,128,0.25)'}`,
            borderRadius: 999,
            padding: '2px 7px',
          }}
        >
          {simulation ? 'simulated' : 'baseline'}
        </span>
      </div>

      {simulation ? (
        <>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>{simulation.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <StatCard
              label="Aggregate Risk"
              value={`${Math.round(before.aggregate_risk)} -> ${Math.round(after.aggregate_risk)}`}
              sub={`${simulation.delta.aggregate_risk.toFixed(1)} points`}
              color={simulation.delta.aggregate_risk < 0 ? 'var(--green)' : 'var(--accent)'}
            />
            <StatCard
              label="Days to Stockout"
              value={`${before.days_to_stockout} -> ${after.days_to_stockout}`}
              sub={`${simulation.delta.days_to_stockout > 0 ? '+' : ''}${simulation.delta.days_to_stockout} days`}
              color="var(--primary)"
            />
            <StatCard
              label="Exposure"
              value={`$${before.estimated_exposure_usd_millions}M -> $${after.estimated_exposure_usd_millions}M`}
              sub={`${simulation.delta.estimated_exposure_usd_millions.toFixed(1)}M`}
              color={simulation.delta.estimated_exposure_usd_millions < 0 ? 'var(--green)' : undefined}
            />
          </div>
        </>
      ) : (
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          Select an action to see the risk delta, stockout extension, and exposure change before committing the response.
        </p>
      )}
    </div>
  );
}

export default function ShockDetail() {
  const { id } = useParams();
  const [shock, setShock] = useState(null);
  const [warRoom, setWarRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSimulation(null);
    setActiveActionId(null);
    Promise.all([
      api.getShock(id),
      api.getShockWarRoom(id).catch(() => null),
    ])
      .then(([shockData, warRoomData]) => {
        setShock(shockData);
        setWarRoom(warRoomData);
      })
      .catch(() => {
        setShock(null);
        setWarRoom(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function runAction(actionId) {
    setActiveActionId(actionId);
    setLoadingAction(true);
    try {
      const result = await api.simulateShockAction(id, actionId);
      setSimulation(result);
    } catch {
      setSimulation(null);
    } finally {
      setLoadingAction(false);
    }
  }

  const severity = useMemo(() => SEVERITY[shock?.severity] || SEVERITY.LOW, [shock]);

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div className="skeleton" style={{ height: 30, width: 240, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 110, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  if (!shock) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', color: 'var(--muted)' }}>Shock event not found.</p>
        <Link to="/" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const metrics = warRoom?.headline_metrics || {
    aggregate_risk: 0,
    days_to_stockout: 0,
    at_risk_nodes: 0,
    estimated_exposure_usd_millions: 0,
    affected_drugs_count: shock.affected_drugs?.length || 0,
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fade-in 0.35s ease' }}>
      <Link
        to="/"
        style={{
          fontSize: '0.8rem',
          color: 'var(--muted)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
        }}
      >
        Back to Dashboard
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: severity.color,
                background: severity.bg,
                border: `1px solid ${severity.color}30`,
                borderRadius: 999,
                padding: '3px 12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {severity.label}
            </span>
            {shock.province && (
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 10px' }}>
                {shock.province}, China
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 10px' }}>
              {shock.sector === 'rare_earth' ? 'Rare Earths' : 'Pharma'}
            </span>
            {shock.data_mode === 'demo' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(79,156,249,0.12)', border: '1px solid rgba(79,156,249,0.25)', borderRadius: 999, padding: '3px 10px' }}>
                Demo scenario
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.34rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 8 }}>
            {shock.title}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.55, maxWidth: 820 }}>
            {warRoom?.war_room_summary || shock.summary || shock.title}
          </p>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'right', minWidth: 180 }}>
          <p>Detected {new Date(shock.detected_at).toLocaleString('en-IN')}</p>
          <p style={{ marginTop: 4 }}>{shock.source}</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Aggregate Risk" value={Math.round(metrics.aggregate_risk)} sub="operator priority" color={metrics.aggregate_risk >= 75 ? '#f43f5e' : metrics.aggregate_risk >= 50 ? '#f59e0b' : '#60a5fa'} />
        <StatCard label="Days to Stockout" value={metrics.days_to_stockout} sub="projected without action" color={metrics.days_to_stockout <= 10 ? '#f43f5e' : metrics.days_to_stockout <= 18 ? '#f59e0b' : '#60a5fa'} />
        <StatCard label="At-Risk Inputs" value={metrics.at_risk_nodes} sub={`${metrics.affected_drugs_count} downstream products`} />
        <StatCard label="Exposure" value={`$${metrics.estimated_exposure_usd_millions}M`} sub="modeled 2-week window" />
      </div>

      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>War Room Summary</span>
          <span style={{ fontSize: '0.62rem', background: 'rgba(79,156,249,0.12)', color: 'var(--primary)', border: '1px solid rgba(79,156,249,0.25)', borderRadius: 999, padding: '2px 7px' }}>
            detect {'->'} decide {'->'} act
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 10 }}>
          {shock.summary || shock.title}
        </p>
        <p style={{ fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.55 }}>
          {warRoom?.patient_impact || 'No patient impact note available.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 20 }}>
        <ActionLadder
          actions={warRoom?.action_options || []}
          activeActionId={activeActionId}
          onSimulate={runAction}
          loadingAction={loadingAction}
        />
        <DeltaPanel simulation={simulation} fallbackMetrics={metrics} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, marginBottom: 20 }}>
        <TopAffectedPanel rows={warRoom?.top_affected || []} simulation={simulation} />
        <EvidencePanel evidence={warRoom?.evidence || []} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <PropagationPanel propagation={shock.propagation} />
        <CommunityPanel community={shock.community} />
      </div>
    </div>
  );
}
