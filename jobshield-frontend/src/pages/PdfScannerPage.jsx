import React, { useState } from 'react';
import { jobApi } from '../services/api';
import AnalysisResultCard from '../components/AnalysisResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * PdfScannerPage Component
 * Uploads an offer letter or job document PDF to POST /api/jobs/analyze-pdf.
 */
export default function PdfScannerPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (file) => {
    setError(null);
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files (.pdf) are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file size must be under 10MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a PDF document to scan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await jobApi.analyzePdf(selectedFile);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to extract or analyze PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan PDF Offer Letter</h1>
          <p className="page-subtitle">
            Upload candidate appointment letters, contracts, or offer PDFs to verify legitimacy.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      {/* Analysis Result Card */}
      {result && (
        <AnalysisResultCard
          result={result}
          onReset={handleReset}
          jobTitle="Uploaded Document"
          companyName={selectedFile?.name}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <LoadingSpinner message="Extracting text with Apache PDFBox and scanning with Gemini AI..." />
        </div>
      )}

      {/* Upload Zone */}
      {!result && !loading && (
        <div className="card">
          <div
            className={`pdf-dropzone ${isDragOver ? 'drag-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-file-input').click()}
          >
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="dropzone-icon">📄</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
              Drag & Drop your PDF Offer Letter here
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              or <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>browse files</span> from your computer
            </p>
            <span className="form-hint" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              Supports .pdf documents up to 10MB
            </span>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="file-preview-card">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedFile(null)}
              >
                Remove
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!selectedFile}
              onClick={handleUploadAndAnalyze}
            >
              <span>🔍 Scan Document</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
