import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  LinkIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  UsersIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CpuChipIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import Navbar from '../components/layout/Navbar';
import RiskBadge from '../components/common/RiskBadge';

const LandingPage = () => {
  useEffect(() => {
    document.title = 'JobShield - AI Job Scam Detector';
  }, []);

  // Section 5 Live Counter Animation on Intersection
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({
    jobs: 0,
    scams: 0,
    satisfaction: 0,
    campaigns: 0,
  });

  // Hero Mock score countup
  const [heroScore, setHeroScore] = useState(0);
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 3;
      if (current >= 95) {
        setHeroScore(95);
        clearInterval(interval);
      } else {
        setHeroScore(current);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;

    const duration = 2000;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        jobs: Math.round(10247 * progress),
        scams: Math.round(542 * progress),
        satisfaction: Math.round(98 * progress),
        campaigns: Math.round(24 * progress),
      });

      if (step >= steps) {
        setCounts({
          jobs: 10247,
          scams: 542,
          satisfaction: 98,
          campaigns: 24,
        });
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [statsVisible]);

  // Flip cards state for Scam Types
  const [flippedCards, setFlippedCards] = useState({});
  const toggleFlip = (index) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scamTypes = [
    {
      icon: '💰',
      name: 'Advance Fee Scams',
      front: 'They ask you to pay money upfront to secure the job.',
      back: 'Warning Signs: Upfront registration fees, uniform deposits, equipment purchases, or paid accreditation checks required before any work begins.',
    },
    {
      icon: '🎣',
      name: 'Phishing Scams',
      front: 'They steal your personal information or login credentials.',
      back: 'Warning Signs: Requests for MyKad/IC, passport scans, bank account details, or PIN numbers before any formal interviews occur.',
    },
    {
      icon: '🎭',
      name: 'Fake Recruiters',
      front: 'They impersonate reputable employers and global brands.',
      back: 'Warning Signs: Non-company email domains (e.g. @gmail or @consultant-careers), communications restricted to WhatsApp, lack of verifiable LinkedIn profiles.',
    },
    {
      icon: '🔺',
      name: 'MLM / Pyramid Schemes',
      front: 'Disguised as lucrative marketing and management roles.',
      back: 'Warning Signs: Earnings tied strictly to recruiting downlines, mandatory inventory purchases, and ambiguous job specifications.',
    },
    {
      icon: '📋',
      name: 'Data Harvesting',
      front: 'They collect candidate data at scale for identity brokers.',
      back: 'Warning Signs: Excessive personal information requested on generic forms, zero online corporate presence, unlisted office addresses.',
    },
    {
      icon: '⏰',
      name: 'Unpaid Trial Scams',
      front: 'They make candidates perform commercial labor for free.',
      back: 'Warning Signs: Indefinite "test assignments", commercial code/design produced during probation without compensation, evasive pay terms.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      {/* SECTION 1 - HERO */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Content (60% -> 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span>🛡️</span>
              <span>AI-Powered Job Scam Detection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Protect Yourself From <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                Job Scams Instantly
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              JobShield analyzes job postings and offer letters using advanced AI to detect predatory fees, identity theft, and fake recruiters before you become a victim.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-blue-400">10,000+</p>
                <p className="text-xs text-slate-400 mt-0.5">Jobs Analyzed</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-teal-400">95%</p>
                <p className="text-xs text-slate-400 mt-0.5">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-rose-400">500+</p>
                <p className="text-xs text-slate-400 mt-0.5">Scams Detected</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-lg shadow-blue-500/30 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Analyze a Job Free</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/campaigns"
                className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-base transition-all text-center"
              >
                View Scam Campaigns
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Instant results
              </span>
            </div>
          </div>

          {/* Right Mock Result Card (40% -> 5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-float">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-slate-400 font-mono">JobShield AI Scanner</span>
              </div>

              {/* Mock Evaluated Job */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Scanned Posting</span>
                <h3 className="text-lg font-bold text-white">Remote Word Processor Typist</h3>
                <p className="text-xs text-slate-400">Apex Transcription Sdn Bhd • RM 6,000/mo</p>
              </div>

              {/* Threat Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 to-rose-900/60 border border-red-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-red-300">Threat Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-red-400">{heroScore}</span>
                    <span className="text-xs text-red-300">/100</span>
                  </div>
                </div>
                <RiskBadge level="HIGH" size="md" />
              </div>

              {/* Sample Red Flags */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  3 Critical Red Flags Detected
                </span>
                <div className="p-2.5 rounded-xl bg-red-950/40 border-l-4 border-l-red-500 border border-red-900/30 text-xs text-red-200">
                  ⚠️ Requested RM 250 equipment registration fee before work
                </div>
                <div className="p-2.5 rounded-xl bg-red-950/40 border-l-4 border-l-red-500 border border-red-900/30 text-xs text-red-200">
                  ⚠️ Unrealistic compensation (RM 80/hr) for unskilled typist
                </div>
                <div className="p-2.5 rounded-xl bg-red-950/40 border-l-4 border-l-red-500 border border-red-900/30 text-xs text-red-200">
                  ⚠️ Direct Telegram handle used instead of corporate email
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs font-semibold text-emerald-400">
                  ✓ Protected candidate from losing RM 250
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - HOW IT WORKS */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How JobShield Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Three simple steps to protect your applications and personal documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Paste Job Details</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Copy the job description, paste a portal URL from JobStreet or LinkedIn, or drag & drop a PDF offer letter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Analyzes It</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our AI scans for 50+ scam indicators including fake salaries, suspicious payment terms, and deceptive recruiter identities.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Get Instant Results</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive a detailed risk report with specific red flags, threat scores, and recommended actions within seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - FEATURES (2x3 GRID) */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything You Need to Stay Safe
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Engineered with advanced cybersecurity safeguards for active job seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl inline-block shadow-sm">
                <CpuChipIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI-Powered Detection</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Advanced AI evaluates job postings for 50+ known scam patterns and deceptive linguistics.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl inline-block shadow-sm">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">URL Scanner</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Paste any job URL and we automatically extract, parse, and verify the live listing content.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl inline-block shadow-sm">
                <DocumentArrowUpIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">PDF Analyzer</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Upload job offer letters, employment contracts, and documents for instant text extraction.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl inline-block shadow-sm">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Risk Scoring</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive an objective 0–100 risk score breakdown with granular safety recommendations.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl inline-block shadow-sm">
                <UsersIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Community Reports</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Crowdsourced incident reports from thousands of job seekers across Southeast Asia.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl inline-block shadow-sm">
                <BellAlertIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-time Alerts</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Get notified when new scam campaigns targeting your specific job category emerge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - SCAM TYPES (3x2 GRID WITH INTERACTIVE FLIP / TOGGLE) */}
      <section className="py-20 bg-blue-50/50 border-y border-blue-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Common Job Scams We Detect
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              JobShield protects candidates from all predominant fraud syndicates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scamTypes.map((scam, idx) => {
              const isFlipped = !!flippedCards[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleFlip(idx)}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs cursor-pointer hover:shadow-md transition-all space-y-3 min-h-[170px] flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl mb-2">{scam.icon}</div>
                    <h3 className="text-base font-bold text-slate-900">{scam.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isFlipped ? scam.back : scam.front}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {isFlipped ? 'Click to close' : 'Click to see warning signs →'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 - LIVE STATS COUNTER */}
      <section
        ref={statsRef}
        className="py-20 bg-slate-950 text-white px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              JobShield By The Numbers
            </h2>
            <p className="text-slate-400 text-sm">
              Real-time threat statistics aggregated across verified user scans.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <p className="text-4xl sm:text-5xl font-black text-blue-400">
                {counts.jobs.toLocaleString()}
              </p>
              <p className="text-xs uppercase font-bold text-slate-400 mt-2">Jobs Analyzed</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <p className="text-4xl sm:text-5xl font-black text-rose-400">
                {counts.scams.toLocaleString()}
              </p>
              <p className="text-xs uppercase font-bold text-slate-400 mt-2">Scams Detected</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <p className="text-4xl sm:text-5xl font-black text-emerald-400">
                {counts.satisfaction}%
              </p>
              <p className="text-xs uppercase font-bold text-slate-400 mt-2">User Satisfaction</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <p className="text-4xl sm:text-5xl font-black text-amber-400">
                {counts.campaigns}
              </p>
              <p className="text-xs uppercase font-bold text-slate-400 mt-2">Active Campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 - TESTIMONIALS */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What Users Say
            </h2>
            <p className="text-slate-600 text-sm">
              Real feedback from job seekers saved from malicious employment traps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "JobShield saved me from an advance fee scam. The AI detected it instantly when I pasted the job description."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60">
                <h4 className="text-sm font-bold text-slate-900">Ahmad R.</h4>
                <p className="text-xs text-slate-500">Fresh Graduate, KL</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "I almost fell for a fake recruiter scam. JobShield flagged it as HIGH risk and listed exactly why. Incredible tool."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60">
                <h4 className="text-sm font-bold text-slate-900">Sarah L.</h4>
                <p className="text-xs text-slate-500">Job Seeker, Penang</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "As an HR professional, I recommend JobShield to all fresh graduates. Job scams are everywhere right now."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60">
                <h4 className="text-sm font-bold text-slate-900">Raj K.</h4>
                <p className="text-xs text-slate-500">HR Manager, Johor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 - CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Start Protecting Yourself Today
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto">
            Free to use. No credit card required. Instant results.
          </p>

          <div className="space-y-2">
            <Link
              to="/register"
              className="inline-block px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-black text-base shadow-xl transition-all"
            >
              Get Started Free
            </Link>
            <div className="pt-1">
              <Link to="/login" className="text-xs text-blue-100 hover:text-white underline">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 - FOOTER (4 COLUMNS) */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-slate-800 pb-12">
          {/* Column 1 - Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-lg">
              <span className="p-1.5 bg-blue-600 rounded-lg text-white">🛡️</span>
              <span>JobShield</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Protecting job seekers from scams, fake recruiters, and advance-fee operations with cutting-edge AI.
            </p>
          </div>

          {/* Column 2 - Product */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/analyze" className="hover:text-white">Analyze a Job</Link></li>
              <li><Link to="/campaigns" className="hover:text-white">View Campaigns</Link></li>
              <li><Link to="/community-reports" className="hover:text-white">Community Reports</Link></li>
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4 - Resources */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/campaigns" className="hover:text-white">Scam Types Guide</Link></li>
              <li><Link to="/campaigns" className="hover:text-white">Safety Tips</Link></li>
              <li><Link to="/report-scam" className="hover:text-white">Report a Scam</Link></li>
              <li><a href="#" className="hover:text-white">API Documentation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 JobShield. All rights reserved.</p>
          <p>Made with ❤️ to protect job seekers</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
