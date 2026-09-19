import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi, getSavedUser } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * DashboardPage Component
 * Displays high-level scam detection metrics and risk distribution.
 */
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = getSavedUser();

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    jobApi.getDashboard()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard metrics.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const total = stats?.totalAnalyses || 0;
  const high = stats?.highRisk || 0;
  const medium = stats?.mediumRisk || 0;
  const low = stats?.lowRisk || 0;

  // Calculate percentage shares for CSS breakdown bar
  const highPct = total > 0 ? ((high / total) * 100).toFixed(1) : 0;
  const mediumPct = total > 0 ? ((medium / total) * 100).toFixed(1) : 0;
  const lowPct = total > 0 ? ((low / total) * 100).toFixed(1) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.firstName || 'Analyst'}!
          </h1>
          <p className="page-subtitle">
            Here is an overview of your job postings scans and threat exposure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/analyze" className="btn btn-primary">
            <span>+</span>
            <span>Analyze New Job</span>
          </Link>
          <Link to="/scan-pdf" className="btn btn-secondary">
            <span>📄</span>
            <span>Scan PDF Offer</span>
          </Link>
        </div>
      </div>

      {loading && <LoadingSpinner message="Retrieving threat metrics from JobShield..." />}

      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={fetchDashboard} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stat Cards Grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card-total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Total Jobs Scanned</h4>
                <div className="stat-value">{total}</div>
              </div>
            </div>

            <div className="stat-card stat-card-high">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <h4>High Risk Scams</h4>
                <div className="stat-value" style={{ color: 'var(--risk-high)' }}>{high}</div>
              </div>
            </div>

            <div className="stat-card stat-card-medium">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h4>Medium Risk Alerts</h4>
                <div className="stat-value" style={{ color: 'var(--risk-medium)' }}>{medium}</div>
              </div>
            </div>

            <div className="stat-card stat-card-low">
              <div className="stat-icon">🛡️</div>
              <div className="stat-content">
                <h4>Verified / Low Risk</h4>
                <div className="stat-value" style={{ color: 'var(--risk-low)' }}>{low}</div>
              </div>
            </div>
          </div>

          {/* Risk Breakdown Progress Visualization */}
          <div className="risk-breakdown-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Risk Distribution Breakdown
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Ratio of scam likelihood detected across all evaluated job postings.
            </p>

            {total === 0 ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>
                No jobs analyzed yet. Scan your first job description or offer letter to see your distribution breakdown!
              </div>
            ) : (
              <>
                <div className="breakdown-bar">
                  <div
                    className="bar-segment bar-high"
                    style={{ width: `${highPct}%` }}
                    title={`High Risk: ${high} (${highPct}%)`}
                  />
                  <div
                    className="bar-segment bar-medium"
                    style={{ width: `${mediumPct}%` }}
                    title={`Medium Risk: ${medium} (${mediumPct}%)`}
                  />
                  <div
                    className="bar-segment bar-low"
                    style={{ width: `${lowPct}%` }}
                    title={`Low Risk: ${low} (${lowPct}%)`}
                  />
                </div>

                <div className="breakdown-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'var(--risk-high)' }} />
                    <span>High Risk: <strong>{high}</strong> ({highPct}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'var(--risk-medium)' }} />
                    <span>Medium Risk: <strong>{medium}</strong> ({mediumPct}%)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'var(--risk-low)' }} />
                    <span>Low Risk: <strong>{low}</strong> ({lowPct}%)</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions & Education */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                🚀 Quick Analysis Actions
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Quickly inspect a suspicious opportunity before submitting personal information or money.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/analyze" className="btn btn-primary btn-sm">
                  Scan Job Description
                </Link>
                <Link to="/scan-pdf" className="btn btn-secondary btn-sm">
                  Upload PDF Letter
                </Link>
                <Link to="/history" className="btn btn-outline btn-sm">
                  View Full History
                </Link>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                💡 Scam Prevention Advice
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <li>Legitimate employers never ask for "security deposits" or "training fees".</li>
                <li>Be cautious if interviews occur solely via Telegram or WhatsApp chats.</li>
                <li>Offers made without an interview or technical evaluation are high risk.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
