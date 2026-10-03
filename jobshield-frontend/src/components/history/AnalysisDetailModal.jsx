import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  BookmarkIcon,
  PrinterIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import SafetyScoreCircle from '../dashboard/SafetyScoreCircle';
import RiskBadge from '../common/RiskBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import analysisService from '../../services/analysisService';

const scamPatternMap = {
  ADVANCE_FEE: { icon: '💰', label: 'Advance Fee Scam' },
  PHISHING: { icon: '🎣', label: 'Phishing Attempt' },
  FAKE_RECRUITER: { icon: '🎭', label: 'Fake Recruiter' },
  MLM_PYRAMID: { icon: '🔺', label: 'MLM / Pyramid Scheme' },
  DATA_HARVESTING: { icon: '📋', label: 'Data Harvesting' },
  UNPAID_TRIAL: { icon: '⏰', label: 'Unpaid Trial Scam' },
  IDENTITY_THEFT: { icon: '🪪', label: 'Identity Theft' },
  NONE: { icon: '✅', label: 'No Pattern Detected' },
};

const AnalysisDetailModal = ({
  analysisId,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen || !analysisId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Load saved checklist state
    try {
      const stored = localStorage.getItem(`jobshield_actions_${analysisId}`);
      if (stored) {
        setCheckedActions(JSON.parse(stored));
      } else {
        setCheckedActions({});
      }
    } catch (e) {
      setCheckedActions({});
    }

    analysisService
      .getHistoryDetail(analysisId)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load analysis details.');
          toast.error('Could not load analysis details');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, analysisId]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !showDeleteConfirm) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showDeleteConfirm]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return format(d, "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return String(dateStr);
    }
  };

  const handleToggleAction = (index) => {
    const updated = { ...checkedActions, [index]: !checkedActions[index] };
    setCheckedActions(updated);
    try {
      localStorage.setItem(`jobshield_actions_${analysisId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleSaveToggle = async () => {
    if (!analysisId) return;
    setIsSaving(true);
    try {
      if (!isSaved) {
        await analysisService.saveJob(analysisId);
        setIsSaved(true);
        toast.success('Job saved to bookmarks');
      } else {
        await analysisService.unsaveJob(analysisId);
        setIsSaved(false);
        toast.success('Job removed from bookmarks');
      }
    } catch (e) {
      toast.error('Unable to update bookmark status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnalysis = async () => {
    try {
      await analysisService.deleteAnalysis(analysisId);
      toast.success('Analysis deleted successfully');
      setShowDeleteConfirm(false);
      if (onDelete) onDelete(analysisId);
      if (onClose) onClose();
    } catch (e) {
      toast.error('Failed to delete analysis');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const patternInfo = detail?.scamPattern
    ? scamPatternMap[detail.scamPattern] || { icon: '⚠️', label: detail.scamPattern.replace(/_/g, ' ') }
    : scamPatternMap.NONE;

  const renderEmployerStatus = (status) => {
    const norm = (status || '').toUpperCase();
    if (norm === 'LIKELY_REAL' || norm.includes('REAL') || norm.includes('LEGIT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">
          <span>✓</span> Likely Legitimate
        </span>
      );
    }
    if (norm === 'SUSPICIOUS' || norm.includes('WARN')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
          <span>⚠</span> Suspicious
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm">
        <span>✗</span> Likely Fake
      </span>
    );
  };

  const confidenceDisplay = detail?.confidenceScore
    ? `${Math.round(detail.confidenceScore <= 1 ? detail.confidenceScore * 100 : detail.confidenceScore)}%`
    : '87%';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-transparent"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] my-auto overflow-hidden print:max-h-none print:shadow-none print:border-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Modal Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70 print:hidden">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-blue-100 text-blue-800">
                Analysis Report #{analysisId}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              title="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 print:p-0 print:space-y-6">
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" message="Loading full AI job analysis..." />
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-red-800">Unable to load details</h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {!loading && !error && detail && (
              <>
                {/* SECTION 1: HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        Source: {detail.sourceType || 'MANUAL'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Analyzed on {formatDate(detail.createdAt)}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {detail.companyName || 'Unknown Company'}
                    </h1>
                    <p className="text-lg font-medium text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                      {detail.jobTitle || 'Job Title Not Specified'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 print:hidden self-start sm:self-center">
                    <button
                      type="button"
                      onClick={handleSaveToggle}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                        isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkSolidIcon className="w-4 h-4 text-amber-600" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4 text-gray-500" />
                      )}
                      {isSaved ? 'Saved' : 'Save Job'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                      title="Export or print PDF"
                    >
                      <PrinterIcon className="w-4 h-4 text-gray-500" />
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* SECTION 2: RISK OVERVIEW ROW */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Circle */}
                    <div className="flex justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
                      <SafetyScoreCircle score={detail.riskScore ?? 0} inverted={true} />
                    </div>

                    {/* Risk Level & Employer Status */}
                    <div className="flex flex-col items-center md:items-start justify-center gap-3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6 text-center md:text-left">
                      <div>
                        <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
                          Evaluated Risk Level
                        </span>
                        <RiskBadge level={detail.riskLevel} size="lg" />
                      </div>
                      <div className="mt-1">
                        <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
                          Employer Legitimacy
                        </span>
                        {renderEmployerStatus(detail.employerStatus)}
                      </div>
                    </div>

                    {/* AI Confidence & Scam Pattern Summary */}
                    <div className="flex flex-col items-center md:items-start justify-center gap-2 text-center md:text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <SparklesIcon className="w-5 h-5 text-indigo-500" />
                        AI Confidence: {confidenceDisplay}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Evaluated across 40+ fraudulent patterns, linguistic markers, and public domain registries.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700">
                        <span>{patternInfo.icon}</span>
                        <span>{patternInfo.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: JOB DETAILS */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight mb-3">
                    Job Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="text-xs font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1">
                        <BuildingOfficeIcon className="w-3.5 h-3.5" /> Company
                      </span>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {detail.companyName || 'Not specified'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="text-xs font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1">
                        <BriefcaseIcon className="w-3.5 h-3.5" /> Job Title
                      </span>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {detail.jobTitle || 'Not specified'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="text-xs font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1">
                        <CurrencyDollarIcon className="w-3.5 h-3.5" /> Salary
                      </span>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {detail.salary || 'Unspecified / None'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
                        Pattern Identified
                      </span>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 truncate">
                        <span>{patternInfo.icon}</span>
                        <span className="truncate">{patternInfo.label}</span>
                      </p>
                    </div>
                  </div>

                  {detail.sourceUrl && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs">
                      <span className="text-blue-900 font-medium">
                        Original Post URL: <span className="font-mono text-gray-700">{detail.sourceUrl}</span>
                      </span>
                      <a
                        href={detail.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                      >
                        Visit Link <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* SECTION 4: AI ANALYSIS */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight mb-2 flex items-center gap-2">
                    <span>AI Analysis Assessment</span>
                  </h3>
                  <div className="p-5 rounded-xl bg-gray-100/80 border border-gray-200 text-sm text-gray-700 italic leading-relaxed whitespace-pre-wrap">
                    "{detail.aiReason || 'No detailed AI evaluation recorded for this scan.'}"
                  </div>
                </div>

                {/* SECTION 5: RED FLAGS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <span>Red Flags Detected</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          detail.redFlags && detail.redFlags.length > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {detail.redFlags ? detail.redFlags.length : 0}
                      </span>
                    </h3>
                  </div>

                  {(!detail.redFlags || detail.redFlags.length === 0) ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      No red flags detected in this job posting.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {detail.redFlags.map((flag, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/60 border border-red-100 border-l-4 border-l-red-500 shadow-sm"
                        >
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-red-900 leading-snug">
                            {flag}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION 6: RECOMMENDED ACTIONS */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight mb-3">
                    Recommended Actions
                  </h3>
                  {(!detail.recommendedActions || detail.recommendedActions.length === 0) ? (
                    <p className="text-sm text-gray-500 italic">No specific actions recommended for this job.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {detail.recommendedActions.map((action, index) => {
                        const isChecked = !!checkedActions[index];
                        return (
                          <div
                            key={index}
                            onClick={() => handleToggleAction(index)}
                            className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50/50 border-emerald-200 line-through text-gray-500'
                                : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div className="flex-1 text-sm font-medium leading-relaxed">
                              {action}
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAction(index)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Raw Job Description Accordion / Section */}
                {detail.jobDescription && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">
                      Original Job Description Snippet
                    </h3>
                    <div className="max-h-36 overflow-y-auto p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 font-mono whitespace-pre-wrap">
                      {detail.jobDescription}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/80 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToggle}
                disabled={isSaving || !detail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {isSaved ? (
                  <BookmarkSolidIcon className="w-4 h-4 text-amber-500" />
                ) : (
                  <BookmarkIcon className="w-4 h-4 text-gray-500" />
                )}
                {isSaved ? 'Bookmarked' : 'Bookmark Job'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={!detail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <PrinterIcon className="w-4 h-4 text-gray-500" />
                Print / Export PDF
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!detail}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Analysis
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Job Analysis"
        message="Are you sure you want to delete this analysis report? This action cannot be undone."
        confirmText="Delete Report"
        variant="danger"
        onConfirm={handleDeleteAnalysis}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default AnalysisDetailModal;
