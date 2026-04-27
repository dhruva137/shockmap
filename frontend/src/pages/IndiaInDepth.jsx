import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const STATE_COLORS = {
  'Maharashtra': '#818cf8',
  'Delhi': '#34d399',
  'Karnataka': '#f472b6',
  'Tamil Nadu': '#fbbf24',
  'West Bengal': '#38bdf8',
  'Gujarat': '#a78bfa',
};

function StateNode({ state, position, isSelected, onClick }) {
  const color = STATE_COLORS[state.name] || '#60a5fa';
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: color,
          border: isSelected ? `3px solid white` : `2px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: `0 0 12px ${color}60`,
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        🏭
      </div>
      <p style={{
        marginTop: 8,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text)',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        {state.name}
      </p>
    </div>
  );
}

function Connection({ from, to, data, isHighlighted }) {
  const x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
  const opacity = isHighlighted ? 1 : 0.4;
  const strokeWidth = isHighlighted ? 3 : 1.5;
  
  return (
    <line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke={data.criticality > 0.5 ? '#f43f5e' : '#60a5fa'}
      strokeWidth={strokeWidth}
      opacity={opacity}
      style={{ transition: 'all 0.2s', pointerEvents: 'none' }}
    />
  );
}

export default function IndiaInDepth() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState(null);
  const [stateData, setStateData] = useState({});
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const states = [
    { name: 'Maharashtra', position: { x: 30, y: 40 } },
    { name: 'Gujarat', position: { x: 20, y: 35 } },
    { name: 'Delhi', position: { x: 45, y: 22 } },
    { name: 'West Bengal', position: { x: 65, y: 25 } },
    { name: 'Karnataka', position: { x: 35, y: 55 } },
    { name: 'Tamil Nadu', position: { x: 45, y: 70 } },
  ];

  const stateConnections = [
    {
      from: 'Maharashtra',
      to: 'Gujarat',
      route_name: 'Western Corridor',
      transit_days: 2,
      products: ['paracetamol', 'ibuprofen'],
      criticality: 0.52,
      value: 240,
    },
    {
      from: 'Maharashtra',
      to: 'Karnataka',
      route_name: 'Deccan Route',
      transit_days: 3,
      products: ['metformin', 'atorvastatin'],
      criticality: 0.45,
      value: 180,
    },
    {
      from: 'Tamil Nadu',
      to: 'Karnataka',
      route_name: 'South Corridor',
      transit_days: 2,
      products: ['diclofenac', 'aspirin'],
      criticality: 0.38,
      value: 160,
    },
    {
      from: 'West Bengal',
      to: 'Delhi',
      route_name: 'Northern Corridor',
      transit_days: 4,
      products: ['gentamicin', 'fluconazole'],
      criticality: 0.48,
      value: 210,
    },
  ];

  useEffect(() => {
    setConnections(stateConnections);
    const data = {};
    states.forEach(s => {
      data[s.name] = {
        name: s.name,
        drugs_produced: Math.floor(Math.random() * 8 + 3),
        suppliers: Math.floor(Math.random() * 15 + 5),
        import_value: Math.floor(Math.random() * 800 + 200),
        export_value: Math.floor(Math.random() * 600 + 150),
        buffer_days: Math.floor(Math.random() * 20 + 5),
      };
    });
    setStateData(data);
    setLoading(false);
  }, []);

  const selectedConnections = selectedState
    ? stateConnections.filter(c => c.from === selectedState || c.to === selectedState)
    : [];

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate('/map')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: 12,
            textDecoration: 'underline',
          }}
        >
          ← Back to Global Map
        </button>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
          🇮🇳 India Supply Chain — In-Depth View
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          Inter-state pharmaceutical and rare earth supply corridors, dependencies, and critical connections
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Map on left */}
        <div className="card" style={{ padding: '20px', position: 'relative', height: 500, background: 'radial-gradient(ellipse at center, rgba(13,17,23,0.2) 0%, rgba(13,17,23,0.8) 100%), linear-gradient(135deg, var(--surface2) 0%, var(--surface) 100%)' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {stateConnections.map((conn, i) => {
              const from = states.find(s => s.name === conn.from);
              const to = states.find(s => s.name === conn.to);
              return (
                <Connection
                  key={i}
                  from={from.position}
                  to={to.position}
                  data={conn}
                  isHighlighted={selectedConnections.includes(conn)}
                />
              );
            })}
          </svg>

          {states.map(state => (
            <StateNode
              key={state.name}
              state={state}
              position={state.position}
              isSelected={selectedState === state.name}
              onClick={() => setSelectedState(selectedState === state.name ? null : state.name)}
            />
          ))}

          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            fontSize: '0.7rem',
            color: 'var(--muted)',
            background: 'rgba(13,17,23,0.8)',
            padding: '8px 12px',
            borderRadius: 8,
          }}>
            Click a state to highlight connections
          </div>
        </div>

        {/* Details on right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selected State Info */}
          {selectedState && stateData[selectedState] ? (
            <div className="card" style={{ padding: '20px 22px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, color: STATE_COLORS[selectedState] }}>
                📊 {selectedState} — State Profile
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>Drugs Produced</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{stateData[selectedState].drugs_produced}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>Active Suppliers</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{stateData[selectedState].suppliers}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>Import Value/Month</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>${stateData[selectedState].import_value}M</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>Buffer Days</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: stateData[selectedState].buffer_days < 10 ? '#f59e0b' : '#10b981' }}>
                    {stateData[selectedState].buffer_days}d
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Connections List */}
          <div className="card" style={{ padding: '20px 22px', flex: 1 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>
              🔗 Supply Corridors {selectedState ? `(${selectedConnections.length})` : `(${stateConnections.length} total)`}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
              {(selectedConnections.length > 0 ? selectedConnections : stateConnections).map((conn, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--surface2)',
                    border: `1px solid ${conn.criticality > 0.5 ? '#f43f5e30' : '#60a5fa30'}`,
                    borderLeft: `3px solid ${conn.criticality > 0.5 ? '#f43f5e' : '#60a5fa'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>
                      {conn.from} → {conn.to}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: conn.criticality > 0.5 ? '#f43f5e' : '#60a5fa',
                      background: conn.criticality > 0.5 ? 'rgba(244,63,94,0.1)' : 'rgba(96,165,250,0.1)',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}>
                      {conn.route_name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--muted)' }}>
                    <span>⏱️ {conn.transit_days}d transit</span>
                    <span>💰 ${conn.value}M/yr</span>
                    <span>📦 {conn.products.length} drugs</span>
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {conn.products.map(p => (
                      <span
                        key={p}
                        style={{
                          fontSize: '0.62rem',
                          background: 'rgba(79,156,249,0.1)',
                          color: 'var(--primary)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* State Summary Table */}
      <div className="card" style={{ padding: '20px 22px', marginTop: 24 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>
          📋 All States — Quick Comparison
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px', color: 'var(--muted)', fontWeight: 600 }}>State</th>
                <th style={{ textAlign: 'center', padding: '10px', color: 'var(--muted)', fontWeight: 600 }}>Drugs</th>
                <th style={{ textAlign: 'center', padding: '10px', color: 'var(--muted)', fontWeight: 600 }}>Suppliers</th>
                <th style={{ textAlign: 'center', padding: '10px', color: 'var(--muted)', fontWeight: 600 }}>Import ($M)</th>
                <th style={{ textAlign: 'center', padding: '10px', color: 'var(--muted)', fontWeight: 600 }}>Export ($M)</th>
                <th style={{ textAlign: 'center', padding: '10px', color: 'var(--muted)', fontWeight: 600 }}>Buffer (d)</th>
              </tr>
            </thead>
            <tbody>
              {states.map(state => {
                const data = stateData[state.name];
                return (
                  <tr key={state.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px', color: 'var(--text)', fontWeight: 500 }}>
                      <span style={{ color: STATE_COLORS[state.name] }}>●</span> {state.name}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px', color: 'var(--text)' }}>{data?.drugs_produced ?? '-'}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: 'var(--text)' }}>{data?.suppliers ?? '-'}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: 'var(--text)' }}>${data?.import_value ?? 0}M</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: 'var(--text)' }}>${data?.export_value ?? 0}M</td>
                    <td style={{
                      textAlign: 'center',
                      padding: '10px',
                      color: (data?.buffer_days ?? 0) < 10 ? '#f59e0b' : '#10b981',
                      fontWeight: 600,
                    }}>
                      {data?.buffer_days ?? '-'}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
