import React, { useEffect, useState } from 'react';
import { jobApi } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * CampaignsPage Component
 * Displays coordinated scam clusters and syndicate campaigns identified by backend similarity engine.
 */
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = () => {
    setLoading(true);
    setError(null);
    jobApi.getCampaigns()
      .then((data) => {
        setCampaigns(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load scam campaigns.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scam Syndicate Campaigns</h1>
          <p className="page-subtitle">
            Clustered fraudulent patterns linking fake job offers across different company aliases.
          </p>
        </div>
      </div>

      {/* Syndicate Intelligence Note */}
      <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
        <span>ℹ️</span>
        <div>
          <strong>How Campaign Clustering Works:</strong> Scammers frequently operate in syndicates, reusing identical
          interview scripts, fake fee demands, and Telegram handles under different fictitious company names. 
          When JobShield detects $\ge 80\%$ pattern similarity, it automatically links them into an identified threat campaign.
        </div>
      </div>

      {loading && <LoadingSpinner message="Scanning network for active scam campaigns..." />}

      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={fetchCampaigns} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="card empty-state">
          <div className="empty-state-icon">🕸️</div>
          <h3>No Coordinated Campaigns Detected</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', fontSize: '0.925rem' }}>
            There are currently no multi-posting scam rings identified in your database, or insufficient postings have been analyzed to detect high pattern similarity.
          </p>
        </div>
      )}

      {!loading && !error && campaigns.length > 0 && (
        <div className="campaign-grid">
          {campaigns.map((camp, idx) => {
            const avgScore = Math.round(camp.averageRisk || 0);
            const riskLevel = avgScore >= 70 ? 'HIGH' : (avgScore >= 40 ? 'MEDIUM' : 'LOW');

            return (
              <div key={idx} className="campaign-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span className="campaign-badge">
                      🏷️ {camp.campaignCode}
                    </span>
                    <RiskBadge level={riskLevel} />
                  </div>

                  <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '1.25rem' }}>
                    <div className="mini-metric-card">
                      <div className="label">Linked Scam Postings</div>
                      <div className="val">{camp.totalScams}</div>
                    </div>
                    <div className="mini-metric-card">
                      <div className="label">Avg Risk Score</div>
                      <div className="val">{avgScore}/100</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Associated Company Aliases ({camp.companies?.length || 0}):
                    </h4>
                    {camp.companies && camp.companies.length > 0 ? (
                      <div className="company-tag-list">
                        {camp.companies.map((comp, cIdx) => (
                          <span key={cIdx} className="company-tag">
                            🏢 {comp}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No aliases recorded</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                  ⚠️ Postings sharing this campaign code likely originate from the same fraud ring.
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
