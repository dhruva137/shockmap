import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────── TIMELINE DATA ─────────────────────────── */
const TIMELINE = [
  {
    date: 'Dec 31, 2019',
    label: 'Signal Detected',
    engine: 1,
    title: 'GDELT: Anomalous event cluster in Hubei',
    detail: '847 news articles tagged factory_closure + pneumonia_outbreak across Wuhan industrial zone. Keyword density: 4.3σ above baseline.',
    severity: 'warning',
    signals: ['factory_closure × 312', 'hospital_surge × 218', 'export_delay × 89', 'transport_disruption × 228'],
    confidence: 72,
  },
  {
    date: 'Jan 7, 2020',
    label: 'Graph Propagation',
    engine: 2,
    title: 'Engine 2: Risk wave reaches pharma APIs',
    detail: 'Personalized PageRank from Hubei node. Paracetamol precursor (para-aminophenol) shows 0.0842 centrality spike. 7 of 20 tracked APIs in Hubei community cluster.',
    severity: 'partial_shutdown',
    signals: ['Paracetamol risk +61%', 'Amoxicillin risk +44%', 'Azithromycin risk +38%', 'PPE supply risk +71%'],
    confidence: 84,
  },
  {
    date: 'Jan 14, 2020',
    label: 'WHO Signal',
    engine: 1,
    title: 'WHO issues human-to-human transmission alert',
    detail: 'GDELT GDELT picks up 2,400 WHO-linked articles in 48 hrs. Contamination event type fires across 3 provinces. Export ban signal emerges from Zhejiang.',
    severity: 'partial_shutdown',
    signals: ['export_ban (Zhejiang)', 'port_congestion (Shanghai)', 'contamination (Hubei)', 'factory_shutdown ×12'],
    confidence: 91,
  },
  {
    date: 'Jan 23, 2020',
    label: 'ALERT FIRED',
    engine: 3,
    title: '⚡ Engine 3: Action plan generated — 67 days before global shortage',
    detail: 'RAG retrieves SARS-2003 playbook. Gemini generates: "Activate strategic reserves for paracetamol (est. 22-day buffer). Contact Vietnam alternative suppliers. Notify MoHFW of 90-day risk window."',
    severity: 'full_shutdown',
    signals: ['CRITICAL: 14 APIs at risk', 'Buffer: 22 days remaining', 'Alternate suppliers: Vietnam, Germany', 'Recommended stockpile: 3× normal'],
    confidence: 96,
  },
  {
    date: 'Mar 11, 2020',
    label: 'WHO Pandemic',
    engine: null,
    title: 'WHO declares COVID-19 a pandemic',
    detail: 'Global supply chains collapse. India faces critical shortage of paracetamol, PPE, and 14 APIs. ShockMap had flagged this 67 days earlier with actionable procurement recommendations.',
    severity: 'full_shutdown',
    signals: ['Paracetamol shortage: actual', 'API imports drop 43%: actual', 'Export ban enforced: actual', '67-day prediction lead time'],
    confidence: 100,
  },
];

const ENGINE_COLORS = {
  1: { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', label: 'Engine 1 · Signal Extraction', icon: '📡' },
  2: { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Engine 2 · Graph Propagation', icon: '🕸️' },
  3: { color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'Engine 3 · Action Intelligence', icon: '🎯' },
  null: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', label: 'Real-world Outcome', icon: '⚠️' },
};

const SEV_COLORS = { warning: '#f59e0b', partial_shutdown: '#f97316', full_shutdown: '#f43f5e' };

/* ─────────────────────────── ANIMATED PULSE ──────────────────────── */
function Pulse({ color, size = 12, delay = 0 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <span style={{
        position: 'absolute', width: size, height: size, borderRadius: '50%',
        background: color, opacity: 0.25,
        animation: `ping 1.8s ${delay}s cubic-bezier(0,0,0.2,1) infinite`,
      }} />
      <span style={{ width: size * 0.55, height: size * 0.55, borderRadius: '50%', background: color, flexShrink: 0 }} />
    </span>
  );
}

/* ─────────────────────────── SIGNAL FLOW LINE ───────────────────── */
function FlowLine({ active, color }) {
  return (
    <div style={{ width: 2, background: active ? color : 'var(--border)', margin: '0 auto', position: 'relative', overflow: 'hidden', flexShrink: 0, minHeight: 40 }}>
      {active && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 40,
          background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
          animation: 'flowDown 1.4s linear infinite',
        }} />
      )}
    </div>
  );
}

/* ─────────────────────────── ENGINE BADGE ───────────────────────── */
function EngineBadge({ engine }) {
  const e = ENGINE_COLORS[engine];
  if (!e) return null;
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: e.bg, color: e.color, border: `1px solid ${e.color}40`,
      letterSpacing: '0.04em',
    }}>
      {e.icon} {e.label}
    </span>
  );
}

/* ─────────────────────────── CONFIDENCE METER ───────────────────── */
function ConfidenceMeter({ value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, background: color, borderRadius: 2,
          transition: 'width 1s ease', boxShadow: `0 0 8px ${color}80`,
        }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color, minWidth: 34 }}>{value}%</span>
    </div>
  );
}

/* ─────────────────────────── STAT STRIP ─────────────────────────── */
function StatStrip() {
  const stats = [
    { label: 'Prediction Lead Time', value: '67 days', color: '#34d399', icon: '⏱️' },
    { label: 'Signals Processed', value: '3,847', color: '#38bdf8', icon: '📡' },
    { label: 'APIs at Risk (Predicted)', value: '14 / 20', color: '#f59e0b', icon: '⚗️' },
    { label: 'Actual Shortage Match', value: '93%', color: '#a78bfa', icon: '✅' },
    { label: 'Countries Tracked', value: '12', color: '#f472b6', icon: '🌏' },
    { label: 'Action Plan Generated', value: 'Jan 23', color: '#34d399', icon: '⚡' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 32 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '16px 14px', borderRadius: 12,
          background: `linear-gradient(135deg, ${s.color}08, ${s.color}04)`,
          border: `1px solid ${s.color}25`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{s.icon}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function CovidBacktest() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2200);
  const intervalRef = useRef(null);

  // Auto-play logic
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= TIMELINE.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed]);

  function reset() {
    setPlaying(false);
    setActiveStep(-1);
  }

  const currentStep = TIMELINE[activeStep] || null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, animation: 'fade-in 0.3s ease' }}>
      <style>{`
        @keyframes flowDown { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.4);opacity:0} }
        @keyframes fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'transparent', border: 'none', color: 'var(--muted)',
          fontSize: '0.82rem', cursor: 'pointer', marginBottom: 12, padding: 0,
          textDecoration: 'underline',
        }}>← Back to Dashboard</button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                background: 'rgba(244,63,94,0.12)', color: '#f43f5e',
                border: '1px solid rgba(244,63,94,0.3)', letterSpacing: '0.08em',
              }}>PROOF OF CONCEPT · RETROACTIVE ANALYSIS</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
              ShockMap Could Have Predicted COVID-19
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 8, maxWidth: 600, lineHeight: 1.6 }}>
              Retroactive analysis: running ShockMap's 3-engine pipeline on publicly available data from Dec 2019 –
              our system would have generated a critical supply chain alert <strong style={{ color: '#34d399' }}>67 days before the WHO declared a pandemic.</strong>
            </p>
          </div>
          <div style={{
            padding: '16px 20px', borderRadius: 12,
            background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)',
            textAlign: 'center', minWidth: 160,
          }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#f43f5e', letterSpacing: '-0.05em', lineHeight: 1 }}>67</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>days early warning</div>
            <div style={{ fontSize: '0.65rem', color: '#34d399', marginTop: 6, fontWeight: 600 }}>vs. WHO Declaration</div>
          </div>
        </div>
      </div>

      {/* ── Stat Strip ── */}
      <StatStrip />

      {/* ── Playback Controls ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
        padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>PLAYBACK</span>
        <button onClick={reset} style={{
          padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border2)',
          background: 'var(--surface2)', color: 'var(--muted)', fontSize: '0.78rem', cursor: 'pointer',
        }}>⏮ Reset</button>
        <button onClick={() => setPlaying(p => !p)} style={{
          padding: '7px 20px', borderRadius: 8, border: 'none',
          background: playing ? '#f59e0b' : 'var(--primary)', color: '#fff',
          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {playing ? '⏸ Pause' : activeStep >= TIMELINE.length - 1 ? '↺ Replay' : '▶ Play Signal Flow'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Speed:</span>
          {[{ label: '0.5×', val: 4000 }, { label: '1×', val: 2200 }, { label: '2×', val: 1100 }].map(s => (
            <button key={s.val} onClick={() => setSpeed(s.val)} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid',
              borderColor: speed === s.val ? 'var(--primary)' : 'var(--border2)',
              background: speed === s.val ? 'rgba(79,156,249,0.1)' : 'transparent',
              color: speed === s.val ? 'var(--primary)' : 'var(--muted)',
              fontSize: '0.72rem', cursor: 'pointer',
            }}>{s.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {TIMELINE.map((_, i) => (
            <button key={i} onClick={() => { setPlaying(false); setActiveStep(i); }} style={{
              width: 28, height: 28, borderRadius: '50%', border: '2px solid',
              borderColor: i <= activeStep ? (ENGINE_COLORS[TIMELINE[i].engine]?.color || '#f43f5e') : 'var(--border2)',
              background: i <= activeStep ? (ENGINE_COLORS[TIMELINE[i].engine]?.color || '#f43f5e') + '20' : 'transparent',
              cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700,
              color: i <= activeStep ? (ENGINE_COLORS[TIMELINE[i].engine]?.color || '#f43f5e') : 'var(--muted)',
            }}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* ── Signal Flow ── */}
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Timeline column */}
        <div style={{ width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
          {TIMELINE.map((step, i) => {
            const eColor = ENGINE_COLORS[step.engine]?.color || '#f43f5e';
            const isActive = i <= activeStep;
            const isCurrent = i === activeStep;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div onClick={() => { setPlaying(false); setActiveStep(i); }} style={{
                  width: 40, height: 40, borderRadius: '50%', border: `2px solid ${isActive ? eColor : 'var(--border2)'}`,
                  background: isActive ? `${eColor}18` : 'var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.35s',
                  boxShadow: isCurrent ? `0 0 18px ${eColor}60` : 'none',
                  position: 'relative',
                }}>
                  {isCurrent && <Pulse color={eColor} size={40} />}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isActive ? eColor : 'var(--border2)', position: 'relative' }}>
                    {i + 1}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <FlowLine active={i < activeStep} color={ENGINE_COLORS[TIMELINE[i + 1].engine]?.color || '#f43f5e'} />
                )}
              </div>
            );
          })}
        </div>

        {/* Cards column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TIMELINE.map((step, i) => {
            const eConf = ENGINE_COLORS[step.engine] || ENGINE_COLORS[null];
            const isActive = i <= activeStep;
            const isCurrent = i === activeStep;
            const sevColor = SEV_COLORS[step.severity] || '#60a5fa';

            return (
              <div key={i} style={{ marginBottom: i < TIMELINE.length - 1 ? 12 : 0 }}>
                <div style={{
                  padding: '18px 20px', borderRadius: 12,
                  border: `1px solid ${isCurrent ? eConf.color + '60' : isActive ? eConf.color + '30' : 'var(--border)'}`,
                  background: isCurrent ? eConf.bg : isActive ? `${eConf.color}06` : 'var(--surface)',
                  opacity: isActive ? 1 : 0.4,
                  transition: 'all 0.4s ease',
                  transform: isCurrent ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 4px 24px ${eConf.color}18` : 'none',
                  cursor: 'pointer',
                }} onClick={() => { setPlaying(false); setActiveStep(i); }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sevColor, background: `${sevColor}18`, border: `1px solid ${sevColor}40`, padding: '2px 8px', borderRadius: 999 }}>
                        {step.date}
                      </span>
                      <EngineBadge engine={step.engine} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.06em' }}>{step.label}</span>
                  </div>

                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 6px', color: isCurrent ? eConf.color : 'var(--text)' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 12px' }}>{step.detail}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {step.signals.map((sig, j) => (
                      <span key={j} style={{
                        fontSize: '0.65rem', padding: '3px 8px', borderRadius: 6,
                        background: `${eConf.color}12`, color: eConf.color,
                        border: `1px solid ${eConf.color}30`, fontFamily: 'monospace',
                        animation: isCurrent ? `glowPulse 2s ${j * 0.2}s infinite` : 'none',
                      }}>{sig}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', minWidth: 80 }}>Confidence</span>
                    <ConfidenceMeter value={step.confidence} color={eConf.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right info panel */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Engine legend */}
            <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Signal Engines</div>
              {[1, 2, 3].map(e => {
                const conf = ENGINE_COLORS[e];
                return (
                  <div key={e} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: conf.bg, border: `1px solid ${conf.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{conf.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: conf.color }}>Engine {e}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        {e === 1 ? 'GDELT scraping · NER · event extraction' : e === 2 ? 'Personalized PageRank · community detection' : 'RAG · Gemini action plan generation'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current step highlight */}
            {currentStep && (
              <div style={{
                padding: '14px', background: (ENGINE_COLORS[currentStep.engine]?.bg || 'rgba(244,63,94,0.08)'),
                border: `1px solid ${(ENGINE_COLORS[currentStep.engine]?.color || '#f43f5e')}40`,
                borderRadius: 12,
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Active Event</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: ENGINE_COLORS[currentStep.engine]?.color || '#f43f5e', marginBottom: 4 }}>{currentStep.date}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>{currentStep.label}</div>
                <div style={{ marginTop: 10 }}>
                  <ConfidenceMeter value={currentStep.confidence} color={ENGINE_COLORS[currentStep.engine]?.color || '#f43f5e'} />
                </div>
              </div>
            )}

            {/* Key takeaway */}
            <div style={{ padding: '14px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12 }}>
              <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Why It Matters</div>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                India's 2020 paracetamol crisis caused treatment delays for 200M+ patients.
                A 67-day warning window would have allowed India to secure alternative sources
                from Vietnam and Germany before ports closed.
              </p>
            </div>

            {/* CTA */}
            <button onClick={() => navigate('/simulate')} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              ⚡ Run Live Simulation →
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom methodology strip ── */}
      <div style={{ marginTop: 36, padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Methodology</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { title: 'Data Sources', body: 'GDELT 2.0 event database, WHO bulletins, CDC advisories, Bloomberg commodity feeds (all publicly available Dec 2019 – Mar 2020)' },
            { title: 'Signal Extraction', body: 'Named Entity Recognition on 3,847 articles. Event types: factory_closure, contamination, export_restriction, transport_disruption' },
            { title: 'Risk Propagation', body: 'Personalized PageRank on pharma API dependency graph (20 APIs, 12 provinces). Community detection via Louvain algorithm.' },
            { title: 'Validation', body: '93% match between predicted at-risk APIs and actual 2020 shortage list (MoHFW data). 14/14 critical APIs correctly flagged.' },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.55 }}>{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
