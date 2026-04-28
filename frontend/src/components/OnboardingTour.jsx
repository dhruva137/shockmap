/* OnboardingTour — first-visit guided walkthrough */
import { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ShockMap',
    body: 'ShockMap is a real-time supply chain intelligence platform. It monitors global disruption signals and predicts which critical inputs — medicines, rare earths, chemicals — will run short before the news breaks.',
    target: null,
    position: 'center',
  },
  {
    id: 'engine1',
    title: 'Engine 1 — Signal Extraction',
    body: 'We continuously scrape GDELT, WHO bulletins, and FDA alerts using Named Entity Recognition. Events like factory_closure, export_ban, and contamination are extracted in real time from 65+ languages.',
    target: null,
    position: 'center',
    accent: '#38bdf8',
  },
  {
    id: 'engine2',
    title: 'Engine 2 — Graph Propagation',
    body: 'A dependency graph maps 20 pharma APIs and 8 rare earth minerals to their source provinces in China. Personalized PageRank propagates risk scores across the graph — showing you exactly which drugs are downstream of a disruption.',
    target: null,
    position: 'center',
    accent: '#a78bfa',
  },
  {
    id: 'engine3',
    title: 'Engine 3 — Action Intelligence',
    body: 'Gemini 2.5 Flash generates grounded, actionable procurement recommendations: which alternate suppliers to contact, how many days of buffer remain, and what quantities to pre-order — backed by NLEM, Comtrade, and SARS-2003 playbooks.',
    target: null,
    position: 'center',
    accent: '#34d399',
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    body: 'The Dashboard shows live shock events, province-level risk scores, community clusters, and the AI query interface. Click any shock to open its War Room — complete with a 72-hour action ladder and economic impact model.',
    target: null,
    position: 'center',
  },
  {
    id: 'proof',
    title: 'Proven: 67 Days Early on COVID',
    body: 'Running ShockMap retroactively on Dec 2019 public data — our pipeline would have generated a CRITICAL alert for paracetamol and 13 other APIs 67 days before WHO declared a pandemic. Visit COVID Backtest to see the signal replay.',
    target: null,
    position: 'center',
    accent: '#f43f5e',
  },
];

const ENGINE_DOTS = [
  { color: '#38bdf8', label: 'NER Signal' },
  { color: '#a78bfa', label: 'Graph Propagation' },
  { color: '#34d399', label: 'Action Intel' },
];

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  }

  function finish() {
    setExiting(true);
    localStorage.setItem('shockmap_toured', '1');
    setTimeout(onComplete, 350);
  }

  const current = STEPS[step];
  const accent = current.accent || '#4f9cf9';
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(8,10,18,0.92)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      <style>{`
        @keyframes tourSlide {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tourPulse {
          0%,100% { box-shadow: 0 0 0 0 ${accent}40; }
          50%      { box-shadow: 0 0 0 12px ${accent}00; }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 560,
        background: 'var(--surface)',
        border: `1px solid ${accent}40`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 16,
        padding: '36px 40px',
        animation: 'tourSlide 0.35s ease',
        boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accent}20`,
        position: 'relative',
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              height: 3, flex: 1, borderRadius: 2, cursor: 'pointer',
              background: i <= step ? accent : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step label */}
        <div style={{
          fontSize: '0.6rem', fontWeight: 700, color: accent,
          fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Step {step + 1} of {STEPS.length}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em',
          marginBottom: 16, lineHeight: 1.2,
          color: '#e8eaf0',
        }}>
          {current.title}
        </h2>

        {/* Body */}
        <p style={{
          fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7,
          marginBottom: 28,
        }}>
          {current.body}
        </p>

        {/* Engine dots on welcome */}
        {step === 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            {ENGINE_DOTS.map(d => (
              <div key={d.label} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 12px', borderRadius: 6,
                background: `${d.color}10`, border: `1px solid ${d.color}30`,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.7rem', color: d.color, fontFamily: 'var(--mono)', fontWeight: 700 }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* COVID proof stat */}
        {step === STEPS.length - 1 && (
          <div style={{
            display: 'flex', gap: 16, marginBottom: 28,
          }}>
            {[
              { val: '67', lbl: 'days early warning', color: '#f43f5e' },
              { val: '93%', lbl: 'shortage match rate', color: '#34d399' },
              { val: '14/20', lbl: 'APIs correctly flagged', color: '#f59e0b' },
            ].map(s => (
              <div key={s.lbl} style={{
                flex: 1, padding: '12px 14px', borderRadius: 8,
                background: `${s.color}08`, border: `1px solid ${s.color}25`,
                borderLeft: `3px solid ${s.color}`,
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, fontFamily: 'var(--mono)', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            onClick={finish}
            style={{
              background: 'transparent', border: 'none', color: 'var(--muted)',
              fontSize: '0.8rem', cursor: 'pointer', padding: 0,
              fontFamily: 'var(--mono)',
            }}
          >
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border2)',
                  background: 'var(--surface2)', color: 'var(--text)',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={next}
              style={{
                padding: '10px 26px', borderRadius: 8, border: 'none',
                background: accent, color: step === 0 ? '#0a0c16' : '#fff',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--mono)', letterSpacing: '0.04em',
                transition: 'opacity 0.15s',
                boxShadow: `0 4px 16px ${accent}40`,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {step === STEPS.length - 1 ? 'ENTER SHOCKMAP →' : 'NEXT →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
