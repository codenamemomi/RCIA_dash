import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  TrendingUp,
  Zap,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Percent,
  TrendingDown,
  Play,
  RefreshCw,
  Cpu,
  Wallet,
  Globe,
  Database,
  History,
  Eye,
  Code,
  Fingerprint,
  ExternalLink
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { fetchDashboardData, triggerEvaluation } from './services/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [data, setData] = useState({
    status: null,
    reputation: null,
    artifacts: [],
    tradeHistory: [],
    priceHistory: [],
    pnlHistory: []
  });

  const updateDashboard = async () => {
    try {
      const result = await fetchDashboardData();

      setData(prev => ({
        ...prev,
        status: result.status,
        reputation: result.reputation,
        artifacts: result.artifacts,
        tradeHistory: result.tradeHistory,
        priceHistory: [...prev.priceHistory, result.pricePoint].slice(-20),
        pnlHistory: [...prev.pnlHistory, result.pnlPoint].slice(-20)
      }));
      setLoading(false);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleManualEval = async () => {
    setEvaluating(true);
    await triggerEvaluation();
    await updateDashboard();
    setEvaluating(false);
  };

  useEffect(() => {
    const update = async () => {
      await updateDashboard();
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'RECENT' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading && !data.status) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#04050a' }}>
        <RefreshCw size={48} className="spin" style={{ marginBottom: '1.5rem', color: '#6366f1' }} />
        <span style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>Initializing Neural Core</span>
      </div>
    );
  }

  const { status, reputation, artifacts, tradeHistory, priceHistory, pnlHistory } = data;
  const metrics = status?.metrics || {};
  const risk = status?.risk || {};
  const agent = status?.agent || {};

  const modeColors = {
    GROWTH: '#10b981',
    DEFENSIVE: '#ef4444',
    YIELD: '#6366f1',
    HEDGE: '#f59e0b',
    INITIALIZING: '#94a3b8'
  };
  const currentModeColor = modeColors[status?.mode] || '#94a3b8';

  return (
    <div className="dashboard-container">
      {status?.mode === 'DEFENSIVE' && (
        <div className="defensive-banner">
          <AlertTriangle size={24} />
          <div>
            <strong>PROTOCOL DEFENSIVE MODE ENGAGED</strong>
            <span style={{ marginLeft: '1rem', opacity: 0.9, fontWeight: 500 }}>Auto-deleveraging capital to stable vaults. Reason: Drawdown {(metrics.drawdown * 100 || 0).toFixed(2)}%</span>
          </div>
        </div>
      )}

      <header>
        <div className="logo-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <Activity size={32} color={currentModeColor} />
            <h1>RCIA <span style={{ fontWeight: 400, opacity: 0.6 }}>AGENT OS</span></h1>
          </div>
          <p>Autonomous Financial Intelligence • Base Network</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button
            onClick={handleManualEval}
            disabled={evaluating}
            className="action-btn"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#fff',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '0.75rem 1.5rem',
              borderRadius: '1rem',
              fontWeight: 700,
              cursor: evaluating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {evaluating ? <RefreshCw size={18} className="spin" /> : <Zap size={18} fill={evaluating ? "none" : "#fff"} />}
            Evaluate Market
          </button>
          <div className="status-badge" style={{ borderColor: `${currentModeColor}33` }}>
            <div className="status-dot" style={{ backgroundColor: currentModeColor }}></div>
            {status?.mode || 'OFFLINE'}
          </div>
        </div>
      </header>

      <div className="grid">
        {/* AGENT IDENTITY - TOP LEFT */}
        <div className="card" style={{ gridColumn: 'span 2', background: `linear-gradient(135deg, rgba(13, 17, 30, 0.6) 0%, rgba(20, 26, 45, 0.4) 100%)`, borderLeft: `6px solid ${currentModeColor}` }}>
          <div className="card-title">
            <Fingerprint size={16} color={currentModeColor} /> Agent Identity Matrix
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Handle</label>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{agent.name || 'RCIA_UNNAMED'}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="id-tag"><Wallet size={14} /> {agent.owner?.slice(0, 10)}...</div>
                <div className="id-tag"><Globe size={14} /> Base Mainnet</div>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Agent Token</label>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>{agent.id || '#000'}</span>
              </div>
              <div>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Registry</label>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>{agent.identity_registry?.slice(0, 12)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* REPUTATION & PERFORMANCE - TOP RIGHT */}
        <div className="card">
          <div className="card-title">
            <Shield size={16} color="var(--success)" /> Trust Index
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            {reputation?.trust_score || 0} <span style={{ fontSize: '1rem', opacity: 0.4, fontWeight: 400 }}>PTS</span>
          </div>
          <div className="stat-sub" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={16} /> Verifiable Grade A
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <Zap size={16} color="var(--warning)" /> Risk-Adjusted Return
          </div>
          <div className="stat-value">{(risk.sharpe_ratio || 0).toFixed(2)}</div>
          <div className="stat-sub" style={{ color: 'var(--text-dim)' }}>
            Sharpe Ratio (30D)
          </div>
        </div>

        {/* PERFORMANCE ROW */}
        <div className="card">
          <div className="card-title">
            <Percent size={16} color="var(--success)" /> Realized Yield
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            +{(risk.cumulative_pnl * 100 || 0).toFixed(2)}%
          </div>
          <div className="stat-sub" style={{ opacity: 0.8, color: '#fff' }}>
            +${(risk.cumulative_pnl * 100000).toLocaleString()} <span style={{ opacity: 0.5 }}>USDC</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <TrendingUp size={16} color="var(--success)" /> Protocol Efficiency
          </div>
          <div className="stat-value">{(risk.win_rate * 100 || 0).toFixed(1)}%</div>
          <div className="stat-sub" style={{ color: 'var(--success)' }}>
            Predictive Accuracy
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <TrendingDown size={16} color="var(--danger)" /> Max Drawdown
          </div>
          <div className="stat-value" style={{ color: risk.drawdown > 0.05 ? 'var(--danger)' : 'var(--warning)' }}>
            -{(metrics.drawdown * 100 || 0).toFixed(2)}%
          </div>
          <div className="stat-sub" style={{ color: 'var(--text-dim)' }}>
            Constraint: 10%
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <Activity size={16} color="var(--primary)" /> Market Volatility
          </div>
          <div className="stat-value">{(metrics.volatility * 100 || 0).toFixed(2)}%</div>
          <div className="stat-sub" style={{ color: 'var(--text-dim)' }}>
            30-Day Realized
          </div>
        </div>

        {/* CHARTS */}
        <div className="card chart-container">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingDown size={16} color="var(--primary)" /> Market Trajectory
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>BTC / USDC</div>
          </div>
          <div style={{ width: '100%', height: 260, marginTop: '2rem' }}>
            <ResponsiveContainer>
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentModeColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={currentModeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }} cursor={{ stroke: currentModeColor, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="price" stroke={currentModeColor} strokeWidth={3} fill="url(#colorPrice)" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-container">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingUp size={16} color="var(--success)" /> Equity Accumulation
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8, color: 'var(--success)' }}>Cumulative PnL %</div>
          </div>
          <div style={{ width: '100%', height: 260, marginTop: '2rem' }}>
            <ResponsiveContainer>
              <LineChart data={pnlHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
                <Line type="monotone" dataKey="pnl" stroke="var(--success)" strokeWidth={3} dot={{ r: 4, fill: 'var(--success)', strokeWidth: 2, stroke: '#0d111e' }} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TRADE HISTORY & ARTIFACTS */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-title">
            <History size={16} color="var(--primary)" /> Protocol Actions
          </div>
          <div className="history-list" style={{ marginTop: '1rem' }}>
            {tradeHistory.map((trade, idx) => (
              <div key={idx} className="trade-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{trade.market}</span>
                  <span style={{
                    color: trade.result === 'WIN' ? 'var(--success)' : 'var(--danger)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: trade.result === 'WIN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.4rem'
                  }}>{trade.result}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>{trade.mode} • Vol: {trade.size}</span>
                  <a href={`https://basescan.org/tx/${trade.tx_hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <ExternalLink size={12} /> SCAN
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">
            <Lock size={16} color="var(--success)" /> Cryptographic Proof Log
          </div>
          <div className="artifact-list" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {artifacts.length > 0 ? artifacts.slice(0, 6).map((art, idx) => (
              <div key={idx} className="artifact-item" onClick={() => setSelectedArtifact(art)} style={{ cursor: 'pointer' }}>
                <div className="artifact-info">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {art.event === 'RISK_REJECTION' ? <AlertTriangle size={16} color="var(--danger)" /> : <Code size={16} color="var(--accent)" />}
                    {art.event}
                  </h4>
                  <p>{art.event === 'RISK_REJECTION' ? art.reason : (art.to_state || 'VALIDATED')} • {formatDate(art.timestamp)}</p>
                </div>
                <div className="artifact-hash"><Eye size={14} /> INSPECT</div>
              </div>
            )) : (
              <div style={{ gridColumn: 'span 2', color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'center', padding: '4rem' }}>
                <div style={{ opacity: 0.2, marginBottom: '1rem' }}><Database size={48} style={{ margin: '0 auto' }} /></div>
                Awaiting cryptographic sequence...
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <AlertTriangle size={16} color="var(--danger)" /> Risk Guardrails
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Daily Cumulative Loss</span>
                <span style={{ color: 'var(--danger)' }}>2.0% MAX</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '10%', height: '100%', background: 'var(--success)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-dim)' }}>Protcol Exposure</span>
              <span style={{ color: 'var(--success)' }}>{(risk.current_exposure * 100 || 0).toFixed(1)}%</span>
            </div>

            <div style={{
              marginTop: '0.5rem',
              padding: '1.25rem',
              background: 'rgba(16, 185, 129, 0.03)',
              borderRadius: '1.25rem',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              display: 'flex',
              gap: '1rem'
            }}>
              <Shield color="var(--success)" size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Safety Sequence Active</strong>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', lineHeight: 1.4 }}>Risk engine is actively monitoring on-chain liquidity depth.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedArtifact && (
        <div className="modal-overlay" onClick={() => setSelectedArtifact(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '0.75rem' }}>
                  <Code size={20} color="var(--accent)" />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>{selectedArtifact.event}</h3>
              </div>
              <button onClick={() => setSelectedArtifact(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.5 }}>×</button>
            </div>
            <div style={{ background: '#04050a', padding: '1.5rem', borderRadius: '1rem', marginTop: '2rem', border: '1px solid var(--border)' }}>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8', overflowX: 'auto' }}>
                {JSON.stringify(selectedArtifact, null, 2)}
              </pre>
            </div>
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>
              <Lock size={14} />
              <span style={{ opacity: 0.8 }}>EIP-712 Signature: </span>
              <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{selectedArtifact.signature?.slice(0, 32)}...</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .action-btn:hover {
            background: rgba(99, 102, 241, 0.2) !important;
            border-color: rgba(99, 102, 241, 0.5) !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2);
        }
        
        .id-tag {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            padding: 0.4rem 0.75rem;
            border-radius: 0.75rem;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .artifact-item {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(12px);
            display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
            background: #0d111e; border: 1px solid rgba(255,255,255,0.1);
            width: 90%; max-width: 650px; padding: 2.5rem; border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: modalFadeUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes modalFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
