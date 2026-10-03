import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  LinkIcon,
  DocumentArrowUpIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BookmarkIcon,
  ShareIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ClockIcon,
  FlagIcon,
  ArrowTopRightOnSquareIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/layout/Navbar';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import analysisService from '../services/analysisService';

const scamPatternMap = {
  ADVANCE_FEE: {
    icon: '💰',
    label: 'Advance Fee Scam',
    title: 'About Advance Fee Scams',
    text: 'These scams ask you to pay money upfront to secure a job or training. Legitimate employers never ask for payment from job seekers.',
  },
  PHISHING: {
    icon: '🎣',
    label: 'Phishing Attempt',
    title: 'About Phishing Job Scams',
    text: 'These postings aim to steal your personal information or credentials. Never submit sensitive documents to unverified employers.',
  },
  FAKE_RECRUITER: {
    icon: '🎭',
    label: 'Fake Recruiter',
    title: 'About Fake Recruiters',
    text: 'Scammers pose as recruiters from legitimate companies. Always verify recruiter identity through official company channels.',
  },
  MLM_PYRAMID: {
    icon: '🔺',
    label: 'MLM / Pyramid Scheme',
    title: 'About MLM / Pyramid Schemes',
    text: 'These schemes require you to recruit others to earn income. They are not traditional employment and often result in financial loss.',
  },
  DATA_HARVESTING: {
    icon: '📋',
    label: 'Data Harvesting',
    title: 'About Data Harvesting Scams',
    text: 'They collect your personal information to sell it or compromise your identity. Legitimate companies have established privacy terms.',
  },
  UNPAID_TRIAL: {
    icon: '⏰',
    label: 'Unpaid Trial Scam',
    title: 'About Unpaid Trial Scams',
    text: 'They make you do unpaid work or indefinite tests disguised as assessments. Professional hiring includes bounded, fair evaluations.',
  },
  IDENTITY_THEFT: {
    icon: '🪪',
    label: 'Identity Theft',
    title: 'About Identity Theft Scams',
    text: 'Scammers harvest copies of passports, driver licenses, or bank cards to establish fraudulent credit accounts.',
  },
  NONE: {
    icon: '✅',
    label: 'No Pattern Detected',
    title: 'Legitimate Employment Indicators',
    text: 'This posting does not match typical patterns seen in known scam syndicates or advance-fee operations.',
  },
};

const AnalyzePage = () => {
  const navigate = useNavigate();
  const resultRef = useRef(null);

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'url' | 'pdf'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Tab 1 Form State
  const [manualForm, setManualForm] = useState({
    companyName: '',
    jobTitle: '',
    salary: '',
    jobDescription: '',
  });

  // Tab 2 Form State
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // Tab 3 Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Result Section State
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});

  useEffect(() => {
    document.title = 'Analyze Job | JobShield';
  }, []);

  // Auto-scroll to result on completion
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // Load checked actions if analysis result has an ID
  useEffect(() => {
    if (result && result.analysisId) {
      try {
        const stored = localStorage.getItem(`jobshield_actions_${result.analysisId}`);
        if (stored) {
          setCheckedActions(JSON.parse(stored));
        } else {
          setCheckedActions({});
        }
      } catch (e) {
        setCheckedActions({});
      }
    }
  }, [result]);

  const handleToggleAction = (index) => {
    if (!result?.analysisId) return;
    const updated = { ...checkedActions, [index]: !checkedActions[index] };
    setCheckedActions(updated);
    try {
      localStorage.setItem(`jobshield_actions_${result.analysisId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleBookmarkToggle = async () => {
    if (!result?.analysisId) {
      toast.error('Cannot bookmark this result');
      return;
    }
    setIsSaving(true);
    try {
      if (!isSaved) {
        await analysisService.saveJob(result.analysisId);
        setIsSaved(true);
        toast.success('Job saved to your bookmarks');
      } else {
        await analysisService.unsaveJob(result.analysisId);
        setIsSaved(false);
        toast.success('Job removed from bookmarks');
      }
    } catch (e) {
      toast.error('Failed to update bookmark');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareResult = () => {
    const shareUrl = window.location.origin + (result?.analysisId ? `/history/${result.analysisId}` : '/analyze');
    navigator.clipboard.writeText(shareUrl);
    toast.success('Analysis link copied to clipboard!');
  };

  // --- TAB 1: MANUAL SUBMIT ---
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!manualForm.companyName.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (!manualForm.jobTitle.trim()) {
      setError('Job Title is required.');
      return;
    }
    if (!manualForm.jobDescription.trim()) {
      setError('Job Description is required.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analysisService.analyzeJob({
        companyName: manualForm.companyName.trim(),
        jobTitle: manualForm.jobTitle.trim(),
        salary: manualForm.salary.trim() || null,
        jobDescription: manualForm.jobDescription.trim(),
      });
      setResult(data);
      setIsSaved(false);
      toast.success('Analysis completed successfully');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to analyze job posting.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- TAB 2: URL SUBMIT ---
  const validateUrl = (str) => {
    try {
      const parsed = new URL(str);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUrlError('');

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Please enter a job posting URL.');
      return;
    }
    if (!validateUrl(trimmed)) {
      setUrlError('Invalid URL format. Please include http:// or https://');
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analysisService.analyzeUrl(trimmed);
      setResult(data);
      setIsSaved(false);
      toast.success('URL scanned and analyzed successfully');
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      if (isTimeout) {
        setError('Request timed out. The job board server may be busy. Try again.');
      } else {
        setError(
          'Could not access that URL. The website might be protected or unreachable. Try copying the job description and use Manual Input instead.'
        );
      }
      toast.error('URL scan could not complete');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- TAB 3: PDF SUBMIT ---
  const handleFileChange = (file) => {
    setError(null);
    if (!file) return;

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      setError('Only PDF, DOC, DOCX, and TXT files are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds the 5MB size limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Please select or drop a file first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // If plain text file, read text directly
      if (selectedFile.name.endsWith('.txt')) {
        const text = await selectedFile.text();
        const data = await analysisService.analyzeJob({
          companyName: 'Uploaded Document',
          jobTitle: selectedFile.name.replace(/\.txt$/i, ''),
          jobDescription: text,
        });
        setResult(data);
      } else {
        const data = await analysisService.analyzePdf(selectedFile);
        setResult(data);
      }
      setIsSaved(false);
      toast.success('Document evaluated successfully');
    } catch (err) {
      setError('Could not read or parse file. Try copying the text into Manual Input instead.');
      toast.error('Document analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUrlError('');
    setSelectedFile(null);
    setManualForm({
      companyName: '',
      jobTitle: '',
      salary: '',
      jobDescription: '',
    });
    setUrlInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formatting helpers for result
  const patternInfo = result?.scamPattern
    ? scamPatternMap[result.scamPattern] || {
        icon: '⚠️',
        label: result.scamPattern.replace(/_/g, ' '),
        title: 'Fraud Alert',
        text: 'This posting exhibits indicators aligned with known fraudulent patterns.',
      }
    : scamPatternMap.NONE;

  const renderEmployerStatus = (status) => {
    const norm = (status || '').toUpperCase();
    if (norm === 'LIKELY_REAL' || norm.includes('REAL') || norm.includes('LEGIT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
          <span>✓</span> Likely Legitimate
        </span>
      );
    }
    if (norm === 'SUSPICIOUS' || norm.includes('WARN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span>⚠</span> Suspicious
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        <span>✗</span> Likely Fake
      </span>
    );
  };

  const getRiskBgGradient = (level) => {
    const norm = (level || '').toUpperCase();
    if (norm.includes('HIGH')) {
      return 'from-red-600 via-rose-600 to-red-700 text-white';
    }
    if (norm.includes('MED')) {
      return 'from-amber-500 via-amber-600 to-yellow-600 text-white';
    }
    return 'from-emerald-500 via-teal-600 to-green-600 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        {/* PAGE HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <SparklesIcon className="w-4 h-4 text-blue-600" />
            AI Scam Detection Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Analyze a Job Posting
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Paste job details, scan a job portal link, or upload an offer letter to detect scams instantly.
          </p>
        </div>

        {/* INPUT TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-3 flex items-center justify-between gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              setError(null);
            }}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📝</span>
            <span>Manual Input</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setError(null);
            }}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>🔗</span>
            <span>Analyze URL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pdf');
              setError(null);
            }}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pdf'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📄</span>
            <span>Upload PDF</span>
          </button>
        </div>

        {/* ERROR CARD */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-800">Scan Notice</h4>
              <p className="text-xs sm:text-sm text-red-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INPUT FORMS CONTAINER */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8">
          {/* TAB 1: MANUAL INPUT FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <BuildingOfficeIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={manualForm.companyName}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, companyName: e.target.value })
                      }
                      placeholder="e.g. ABC Technologies Sdn Bhd"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <BriefcaseIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={manualForm.jobTitle}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, jobTitle: e.target.value })
                      }
                      placeholder="e.g. Data Entry Specialist"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Offered Salary (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <CurrencyDollarIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={manualForm.salary}
                    onChange={(e) => setManualForm({ ...manualForm, salary: e.target.value })}
                    placeholder="e.g. RM 3000/month or Not Specified"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400 font-mono">
                    {manualForm.jobDescription.length.toLocaleString()} / 5,000
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  maxLength={5000}
                  value={manualForm.jobDescription}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, jobDescription: e.target.value })
                  }
                  placeholder="Paste the full job description here, including responsibilities, interview steps, requirements, and any contact instructions..."
                  style={{ minHeight: '200px' }}
                  className="w-full p-3.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Run Scam Analysis</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: URL ANALYZER */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Job Posting URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError('');
                    }}
                    placeholder="https://www.jobstreet.com/job/123456"
                    className={`w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      urlError
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {urlError && <p className="text-xs text-red-600 mt-1.5 font-medium">{urlError}</p>}
              </div>

              {/* Supported platforms row */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Works best with these platforms
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {['JobStreet', 'LinkedIn', 'Indeed', 'Glassdoor', 'MauKerja', 'Hiredly'].map(
                    (p) => (
                      <span
                        key={p}
                        className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs"
                      >
                        {p}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* How it works steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="font-bold text-blue-700 block mb-0.5">Step 1</span>
                  <p className="text-gray-600">Paste job URL above</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="font-bold text-blue-700 block mb-0.5">Step 2</span>
                  <p className="text-gray-600">We scan the page automatically</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="font-bold text-blue-700 block mb-0.5">Step 3</span>
                  <p className="text-gray-600">AI analyzes the content</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Scanning URL...</span>
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span>Analyze URL</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: PDF UPLOAD */}
          {activeTab === 'pdf' && (
            <form onSubmit={handlePdfSubmit} className="space-y-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
                  }`}
                >
                  <DocumentArrowUpIcon className="w-14 h-14 text-blue-500 mx-auto mb-3" />
                  <p className="text-base font-bold text-gray-800">
                    Drag & drop your PDF here
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    or <span className="text-blue-600 font-semibold underline">click to browse files</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Accepts PDF, DOC, DOCX, TXT (Max size: 5MB)
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-3 bg-white rounded-xl shadow-xs text-xl">📄</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing || !selectedFile}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md disabled:opacity-60 flex items-center justify-center gap-2.5 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Extracting text & evaluating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Analyze Document</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ANALYSIS RESULT SECTION */}
        {result && (
          <div
            ref={resultRef}
            className="space-y-6 pt-4 animate-slide-up transition-all"
          >
            {/* RESULT HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <CheckCircleIcon className="w-7 h-7 text-emerald-500" />
                  Analysis Complete
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  Analyzed on {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleShareResult}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
                >
                  <ShareIcon className="w-4 h-4 text-gray-500" />
                  Share Link
                </button>

                <button
                  type="button"
                  onClick={handleBookmarkToggle}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors shadow-2xs ${
                    isSaved
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isSaved ? (
                    <BookmarkSolidIcon className="w-4 h-4 text-amber-500" />
                  ) : (
                    <BookmarkIcon className="w-4 h-4 text-gray-500" />
                  )}
                  {isSaved ? 'Bookmarked' : 'Save to History'}
                </button>
              </div>
            </div>

            {/* RISK OVERVIEW CARD */}
            <div
              className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-r shadow-lg ${getRiskBgGradient(
                result.riskLevel
              )}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Left Side: Large Risk Score */}
                <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-white/20 pb-4 sm:pb-0 sm:pr-6">
                  <div className="flex items-baseline justify-center sm:justify-start gap-1">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight">
                      {result.riskScore ?? 0}
                    </span>
                    <span className="text-xl font-bold opacity-80">/100</span>
                  </div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-90 block mt-1">
                    Threat Risk Score
                  </span>
                </div>

                {/* Center: Risk Level Badge */}
                <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/20 pb-4 sm:pb-0 sm:pr-6">
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 mb-1.5">
                    Evaluated Threat
                  </span>
                  <RiskBadge level={result.riskLevel} size="lg" />
                </div>

                {/* Right Side: Status & Scam Pattern */}
                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <span className="text-xs font-bold opacity-80 block mb-1">
                      Employer Status
                    </span>
                    {renderEmployerStatus(result.employerStatus)}
                  </div>
                  <div className="text-xs font-semibold pt-1">
                    <span>AI Confidence: </span>
                    <span className="font-bold">
                      {result.confidenceScore
                        ? `${Math.round(result.confidenceScore <= 1 ? result.confidenceScore * 100 : result.confidenceScore)}%`
                        : '92%'}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/20 text-xs font-semibold">
                    <span>{patternInfo.icon}</span>
                    <span>{patternInfo.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI VERDICT CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-blue-600" />
                AI Verdict & Reasoning
              </h3>
              <div className="p-5 rounded-xl bg-gray-100/90 text-sm text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                "{result.reason || result.aiReason || 'Scam detection analysis complete.'}"
              </div>
            </div>

            {/* RED FLAGS CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>🚩 Red Flags Detected</span>
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    result.redFlags && result.redFlags.length > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {result.redFlags ? result.redFlags.length : 0} flags found
                </span>
              </div>

              {(!result.redFlags || result.redFlags.length === 0) ? (
                (result.riskLevel || '').toUpperCase().includes('HIGH') ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800">
                    No specific textual flags extracted, but overall statistical risk remains elevated.
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-medium flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ✓ No red flags detected! This job appears legitimate.
                  </div>
                )
              ) : (
                <div className="space-y-2.5">
                  {result.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/70 border border-red-100 border-l-4 border-l-red-500 shadow-xs"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-red-900 leading-snug">
                        {flag}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECOMMENDED ACTIONS CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                ✅ What You Should Do
              </h3>
              {(!result.recommendedActions || result.recommendedActions.length === 0) ? (
                <p className="text-sm text-gray-500 italic">No specific actions required.</p>
              ) : (
                <div className="space-y-2.5">
                  {result.recommendedActions.map((action, idx) => {
                    const isChecked = !!checkedActions[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleAction(idx)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 line-through'
                            : 'bg-gray-50/50 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 text-sm font-medium leading-relaxed">
                          {action}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAction(idx)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SIMILAR SCAM PATTERNS INFO CARD */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 rounded-2xl border border-blue-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <span>{patternInfo.icon}</span>
                  <span>{patternInfo.title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-blue-800/90 leading-relaxed max-w-2xl">
                  {patternInfo.text}
                </p>
              </div>

              <Link
                to={`/campaigns${result.scamPattern ? `?search=${result.scamPattern}` : ''}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap self-start sm:self-center"
              >
                <span>View Related Campaigns</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ACTION BUTTONS ROW */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Analyze Another Job
                </button>
                <Link
                  to="/history"
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
                >
                  View Full History
                </Link>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/report-scam', {
                    state: {
                      companyName: manualForm.companyName || result.companyName || '',
                      jobTitle: manualForm.jobTitle || result.jobTitle || '',
                      jobUrl: urlInput || '',
                      description: `Flagged via JobShield Analysis (${result.riskLevel} Risk, Score ${result.riskScore}/100): ${result.reason || ''}`,
                    },
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-2xs transition-colors"
              >
                <FlagIcon className="w-4 h-4 text-red-600" />
                Report This Job
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyzePage;
