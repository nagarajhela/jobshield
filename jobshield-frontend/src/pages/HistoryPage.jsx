import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import JobDetailModal from '../components/JobDetailModal';

/**
 * HistoryPage Component
 * Displays user's scan history and enables drilldown into individual job reports.
 */
export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    setError(null);
    jobApi.getHistory()
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve scan history.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan History</h1>
          <p className="page-subtitle">
            Review all previously evaluated job postings and detailed AI scam assessments.
          </p>
        </div>

        <Link to="/analyze" className="btn btn-primary">
          <span>+</span>
          <span>New Analysis</span>
        </Link>
      </div>

      {loading && <LoadingSpinner message="Loading your scan history..." />}

      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={fetchHistory} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Scans Yet</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', fontSize: '0.925rem' }}>
            You haven't scanned any job descriptions or offer letters yet. Start by analyzing a job offer to detect scam risks.
          </p>
          <Link to="/analyze" className="btn btn-primary">
            Analyze First Job
          </Link>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title & Company</th>
                  <th>Risk Level</th>
                  <th>Threat Score</th>
                  <th>Scanned Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.analysisId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.jobTitle}</div>
                      <div style={{ fontSize: '0.825rem', color: '#64748b' }}>🏢 {item.companyName}</div>
                    </td>
                    <td>
                      <RiskBadge level={item.riskLevel} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                        {item.riskScore}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/100</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedAnalysisId(item.analysisId)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="history-cards-mobile">
            {history.map((item) => (
              <div key={item.analysisId} className="history-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.jobTitle}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                      🏢 {item.companyName}
                    </div>
                  </div>
                  <RiskBadge level={item.riskLevel} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>
                    Score: <strong>{item.riskScore}/100</strong>
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedAnalysisId(item.analysisId)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedAnalysisId && (
        <JobDetailModal
          analysisId={selectedAnalysisId}
          onClose={() => setSelectedAnalysisId(null)}
        />
      )}
    </div>
  );
}
