import React, { useState } from 'react';
import { jobApi } from '../services/api';
import AnalysisResultCard from '../components/AnalysisResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * AnalyzeJobPage Component
 * Submits structured job details to POST /api/jobs/analyze for AI evaluation.
 */
export default function AnalyzeJobPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    salary: '',
    jobDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation matching backend AnalyzeJobRequest
    if (!formData.companyName.trim()) {
      setError('Company Name is required.');
      return;
    }

    if (!formData.jobTitle.trim()) {
      setError('Job Title is required.');
      return;
    }

    if (!formData.jobDescription.trim()) {
      setError('Job Description is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        salary: formData.salary.trim() || null,
        jobDescription: formData.jobDescription.trim(),
      };

      const response = await jobApi.analyzeJob(payload);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to analyze job posting.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFormData({
      companyName: '',
      jobTitle: '',
      salary: '',
      jobDescription: '',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyze Job Posting</h1>
          <p className="page-subtitle">
            Submit suspicious job offers or descriptions to detect scam indicators and fraud syndicates.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      {/* When analysis has finished, show results */}
      {result && (
        <AnalysisResultCard
          result={result}
          onReset={handleReset}
          jobTitle={formData.jobTitle}
          companyName={formData.companyName}
        />
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <LoadingSpinner message="Evaluating posting with Google Gemini AI and cross-referencing scam patterns..." />
        </div>
      )}

      {/* Job Entry Form */}
      {!result && !loading && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="auth-row">
              <div className="form-group">
                <label className="form-label" htmlFor="companyName">
                  Company / Organization Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  className="form-input"
                  placeholder="e.g. Apex Global Solutions"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="jobTitle">
                  Job Role / Title *
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  name="jobTitle"
                  className="form-input"
                  placeholder="e.g. Remote Data Entry Specialist"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="salary">
                Offered Salary / Compensation (Optional)
              </label>
              <input
                id="salary"
                type="text"
                name="salary"
                className="form-input"
                placeholder="e.g. $45/hr or ₹50,000/month"
                value={formData.salary}
                onChange={handleChange}
              />
              <span className="form-hint">Unusually high salaries for entry-level work are a strong scam indicator.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jobDescription">
                Full Job Description or Email Message *
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                className="form-textarea"
                rows={9}
                placeholder="Paste the complete job posting text, communication received via email/WhatsApp, requirements, and payment instructions..."
                value={formData.jobDescription}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Include interview instructions, payment terms, or contact links if mentioned.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-lg">
                <span>🛡️ Run AI Scam Analysis</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
