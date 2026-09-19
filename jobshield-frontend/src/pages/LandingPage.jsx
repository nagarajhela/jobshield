import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { isAuthenticated } from '../services/api';

/**
 * LandingPage Component
 * Public introduction to JobShield's AI scam detection capabilities.
 */
export default function LandingPage() {
  const loggedIn = isAuthenticated();
  const ctaLink = loggedIn ? '/dashboard' : '/register';
  const analyzeLink = loggedIn ? '/analyze' : '/login';

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>⚡</span>
          <span>Next-Gen Cybersecurity for Job Seekers</span>
        </div>

        <h1 className="hero-title">
          Protect Yourself From Job Scams
        </h1>

        <p className="hero-subtitle">
          Leverage Google Gemini AI, PDF offer letter scanning, pattern matching, and 
          cross-company campaign clustering to uncover fraudulent job offers before you apply or pay.
        </p>

        <div className="hero-actions">
          <Link to={ctaLink} className="btn btn-primary btn-lg">
            <span>🛡️ Get Started Free</span>
          </Link>
          <Link to={analyzeLink} className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
            <span>🔍 Analyze a Job</span>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Comprehensive Scam Defense Engine</h2>
          <p className="section-desc">
            JobShield analyzes text, documents, and network patterns to give you instant clarity on whether an opportunity is authentic or a dangerous trap.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">🤖</div>
            <h3>AI Scam Detection</h3>
            <p>
              Deep semantic evaluation powered by Google Gemini AI to analyze job descriptions, pinpoint suspicious wording, unrealistic salaries, and recruiter red flags.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">📄</div>
            <h3>PDF Offer Letter Scanner</h3>
            <p>
              Upload suspicious appointment letters or PDFs. The backend automatically extracts text and inspects stamps, fees, and contact details for scam signals.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">⚡</div>
            <h3>Scam Pattern Matching</h3>
            <p>
              Detects high-risk tactics including upfront registration fees, Telegram/WhatsApp interview redirects, false urgency, and impersonated recruiters.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">🕸️</div>
            <h3>Scam Campaign Tracking</h3>
            <p>
              Clusters related fraudulent postings using similarity algorithms to reveal coordinated scam rings operating under multiple alias company names.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">
            Three simple steps to verify any job posting or offer letter before taking action.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Submit Job Details or PDF</h3>
            <p>
              Paste the job posting description, company name, and salary, or directly upload an offer letter PDF.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">2</div>
            <h3>AI & Pattern Analysis</h3>
            <p>
              The Spring Boot backend runs Gemini AI analysis and checks scam similarity against known fraud databases.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">3</div>
            <h3>View Risk Score & Signals</h3>
            <p>
              Get an instant Risk Score (0–100), risk tier (LOW/MEDIUM/HIGH), detailed reason, and syndicate alert.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link to={ctaLink} className="btn btn-primary btn-lg">
            Start Scanning Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-content">
          <div className="brand-logo" style={{ fontSize: '1.15rem' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>🛡️</div>
            <div>Job<span>Shield</span></div>
          </div>
          <p>© {new Date().getFullYear()} JobShield — AI-Powered Job Scam Detection & Threat Intelligence.</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Empowering job seekers worldwide against fraudulent recruiters, deceptive offers, and fee extortion.
          </p>
        </div>
      </footer>
    </div>
  );
}
