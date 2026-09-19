import React from 'react';
import RiskBadge from './RiskBadge';

/**
 * AnalysisResultCard Component
 * Displays the comprehensive analysis result returned from backend:
 * - Risk Score (0–100)
 * - Risk Level (LOW, MEDIUM, HIGH)
 * - AI Reason & Explanation
 * - Pattern Matching Metrics (matched scams, similarity %, similar companies)
 */
export default function AnalysisResultCard({ result, onReset, jobTitle, companyName }) {
  if (!result) return null;

  const {
    riskScore = 0,
    riskLevel = 'LOW',
    reason = '',
    matchedScams = 0,
    highestSimilarity = 0,
    similarCompanies = []
  } = result;

  const safeLevel = (riskLevel || 'LOW').toUpperCase();

  return (
    <div className="analysis-result-card">
      <div className={`result-header risk-${safeLevel}`}>
        <div className="score-badge">
          <div className="score-circle">
            <span>{riskScore}</span>
          </div>
          <div>
            <div className="score-title">Scam Risk Assessment</div>
            <div style={{ marginTop: '0.25rem' }}>
              <RiskBadge level={safeLevel} />
            </div>
          </div>
        </div>

        {onReset && (
          <button className="btn btn-secondary" onClick={onReset}>
            <span>↻</span>
            <span>Analyze Another Job</span>
          </button>
        )}
      </div>

      <div className="result-body">
        {jobTitle && (
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TARGET POSTING:</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {jobTitle} {companyName ? `at ${companyName}` : ''}
            </h3>
          </div>
        )}

        {/* AI Explanation */}
        <div className="result-section">
          <h4>
            <span>🤖</span>
            <span>Gemini AI Scam Analysis</span>
          </h4>
          <div className="reason-box">
            {reason || 'No detailed explanation provided.'}
          </div>
        </div>

        {/* Pattern & Similarity Signals */}
        <div className="result-section">
          <h4>
            <span>🔍</span>
            <span>Pattern Match & Syndicate Signals</span>
          </h4>
          <div className="metrics-row">
            <div className="mini-metric-card">
              <div className="label">Matched Scam Signals</div>
              <div className="val">{matchedScams ?? 0}</div>
            </div>

            <div className="mini-metric-card">
              <div className="label">Highest Similarity</div>
              <div className="val">{highestSimilarity ? `${Math.round(highestSimilarity)}%` : '0%'}</div>
            </div>

            <div className="mini-metric-card">
              <div className="label">Syndicate Risk Status</div>
              <div className="val" style={{ fontSize: '1rem', color: safeLevel === 'HIGH' ? '#ef4444' : '#10b981' }}>
                {highestSimilarity >= 80 ? '⚠️ High Coordinated Match' : (highestSimilarity >= 60 ? '⚡ Partial Match' : '✓ Low Cluster Risk')}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Companies Flagged */}
        {similarCompanies && similarCompanies.length > 0 && (
          <div className="result-section">
            <h4>
              <span>🏢</span>
              <span>Reused Scam Patterns Detected in Other Postings:</span>
            </h4>
            <div className="company-tag-list">
              {similarCompanies.map((comp, idx) => (
                <span key={idx} className="company-tag">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
