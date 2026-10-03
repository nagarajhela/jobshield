import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  BookmarkIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/layout/Navbar';
import RiskBadge from '../components/common/RiskBadge';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AnalysisDetailModal from '../components/history/AnalysisDetailModal';
import analysisService from '../services/analysisService';

const scamPatternMap = {
  ADVANCE_FEE: { icon: '💰', label: 'Advance Fee' },
  PHISHING: { icon: '🎣', label: 'Phishing' },
  FAKE_RECRUITER: { icon: '🎭', label: 'Fake Recruiter' },
  MLM_PYRAMID: { icon: '🔺', label: 'MLM / Pyramid' },
  DATA_HARVESTING: { icon: '📋', label: 'Data Harvesting' },
  UNPAID_TRIAL: { icon: '⏰', label: 'Unpaid Trial' },
  IDENTITY_THEFT: { icon: '🪪', label: 'Identity Theft' },
  NONE: { icon: '✅', label: 'No Pattern' },
};

const HistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse page from query param (?page=1 means backend page 0)
  const queryPage = parseInt(searchParams.get('page') || '1', 10);
  const initialPage = isNaN(queryPage) || queryPage < 1 ? 0 : queryPage - 1;

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filter states
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    riskLevel: '',
    search: '',
    startDate: '',
    endDate: '',
    sortDir: 'desc',
  });

  // Modal and deletion states
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Set document title
  useEffect(() => {
    document.title = 'Analysis History | JobShield';
  }, []);

  // Debounce search input by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        return { ...prev, search: searchInput };
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync with URL search params if changed from outside (e.g. browser forward/back)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    const backendPage = Math.max(0, pageFromUrl - 1);
    if (backendPage !== currentPage) {
      setCurrentPage(backendPage);
    }
  }, [searchParams]);

  // Fetch history data from analysisService
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: filters.sortDir || 'desc',
      };

      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await analysisService.getHistory(params);

      // PagedResponseDTO format: { content, page, size, totalElements, totalPages, last }
      if (data && Array.isArray(data.content)) {
        setAnalyses(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setAnalyses(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setAnalyses([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      toast.error('Failed to retrieve analysis history');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, pageSize]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Fetch saved job IDs for bookmark indicators
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const savedList = await analysisService.getSavedJobs();
        if (Array.isArray(savedList)) {
          const ids = new Set(savedList.map((item) => item.analysisId));
          setSavedJobIds(ids);
        }
      } catch (e) {
        // Silently fail bookmark highlights
      }
    };
    fetchSaved();
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage + 1));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter change handlers that reset page to 0
  const handleFilterChange = (key, value) => {
    setCurrentPage(0);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    });
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setCurrentPage(0);
    setSearchParams({ page: '1' });
    setFilters({
      riskLevel: '',
      search: '',
      startDate: '',
      endDate: '',
      sortDir: 'desc',
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.riskLevel ||
      filters.search ||
      filters.startDate ||
      filters.endDate ||
      filters.sortDir !== 'desc'
    );
  }, [filters]);

  // Export CSV handler
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await analysisService.exportCSV();
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'jobshield-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('History exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Bookmark toggle
  const handleToggleSave = async (e, analysisId) => {
    e.stopPropagation();
    const isCurrentlySaved = savedJobIds.has(analysisId);
    try {
      if (isCurrentlySaved) {
        await analysisService.unsaveJob(analysisId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(analysisId);
          return next;
        });
        toast.success('Job removed from saved jobs');
      } else {
        await analysisService.saveJob(analysisId);
        setSavedJobIds((prev) => new Set(prev).add(analysisId));
        toast.success('Job bookmarked');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  // Delete analysis handler
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await analysisService.deleteAnalysis(itemToDelete.analysisId);
      toast.success('Job analysis deleted');
      setItemToDelete(null);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to delete analysis');
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return format(d, 'MMM d, yyyy');
    } catch (e) {
      return String(dateStr);
    }
  };

  // Color coding risk score:
  // 0-30: green, 31-60: yellow, 61-80: orange, 81-100: red bold
  const getRiskScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s <= 30) return 'text-emerald-600 font-semibold';
    if (s <= 60) return 'text-amber-600 font-semibold';
    if (s <= 80) return 'text-orange-600 font-bold';
    return 'text-red-600 font-black';
  };

  // Row background color coding
  const getRowBgClass = (riskLevel) => {
    const norm = (riskLevel || '').toUpperCase();
    if (norm.includes('HIGH')) {
      return 'bg-red-50/40 hover:bg-red-50/80 transition-colors';
    }
    if (norm.includes('MED')) {
      return 'bg-amber-50/40 hover:bg-amber-50/80 transition-colors';
    }
    return 'bg-emerald-50/30 hover:bg-emerald-50/70 transition-colors';
  };

  const fromElement = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const toElement = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Analysis History
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View all your past job analyses and scam risk evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting || totalElements === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition-all"
            >
              <ArrowDownTrayIcon className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>

            <Link
              to="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Analyze Job
            </Link>
          </div>
        </div>

        {/* FILTERS ROW */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by company or job title"
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Risk Level Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
              >
                <option value="">All Risk Levels</option>
                <option value="HIGH">HIGH Risk</option>
                <option value="MEDIUM">MEDIUM Risk</option>
                <option value="LOW">LOW Risk</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="lg:col-span-2 relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition-all"
                title="Start Date"
              />
            </div>

            {/* End Date */}
            <div className="lg:col-span-2 relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition-all"
                title="End Date"
              />
            </div>

            {/* Sort Toggle */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleFilterChange('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
                }
                className="w-full py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
                {filters.sortDir === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-2.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap"
                  title="Clear all filters"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE FILTER TAGS */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-medium">Active filters:</span>
              {filters.riskLevel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                  Risk: {filters.riskLevel}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('riskLevel', '')}
                    className="hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                  Search: "{filters.search}"
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      handleFilterChange('search', '');
                    }}
                    className="hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                  From: {filters.startDate}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('startDate', '')}
                    className="hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                  To: {filters.endDate}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('endDate', '')}
                    className="hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* RESULTS COUNT */}
        {!loading && (
          <div className="text-xs sm:text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{fromElement}</span>-
            <span className="font-bold text-gray-900">{toElement}</span> of{' '}
            <span className="font-bold text-gray-900">{totalElements}</span> results
          </div>
        )}

        {/* LOADING SKELETON STATE */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded w-12" />
                <div className="h-8 bg-gray-200 rounded-lg w-20" />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && analyses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {hasActiveFilters ? (
              <EmptyState
                icon={FunnelIcon}
                title="No results found"
                message="We could not find any past analyses matching your specific filter criteria."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            ) : (
              <EmptyState
                icon={MagnifyingGlassIcon}
                title="No analyses yet"
                message="Start by analyzing a job description or pasting a job posting URL to protect your career."
                actionLabel="Analyze your first job"
                onAction={() => navigate('/analyze')}
              />
            )}
          </div>
        )}

        {/* DESKTOP TABLE & MOBILE CARDS */}
        {!loading && analyses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th
                      className="py-3.5 px-4 cursor-pointer select-none hover:text-gray-800"
                      onClick={() =>
                        handleFilterChange('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Company Name</th>
                    <th className="py-3.5 px-4">Job Title</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Risk Score</th>
                    <th className="py-3.5 px-4">Scam Pattern</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {analyses.map((item) => {
                    const pattern = scamPatternMap[item.scamPattern] || {
                      icon: '⚠️',
                      label: item.scamPattern || 'None',
                    };
                    const isSaved = savedJobIds.has(item.analysisId);

                    return (
                      <tr
                        key={item.analysisId}
                        onClick={() => setSelectedAnalysisId(item.analysisId)}
                        className={`cursor-pointer group ${getRowBgClass(item.riskLevel)}`}
                      >
                        {/* Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Company */}
                        <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                          {item.companyName || '—'}
                        </td>

                        {/* Title */}
                        <td className="py-4 px-4 text-gray-700 max-w-xs truncate">
                          {item.jobTitle || '—'}
                        </td>

                        {/* Risk Level */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <RiskBadge level={item.riskLevel} />
                        </td>

                        {/* Risk Score */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`text-base ${getRiskScoreColor(item.riskScore)}`}>
                            {item.riskScore}
                          </span>
                          <span className="text-xs text-gray-400 font-normal">/100</span>
                        </td>

                        {/* Scam Pattern */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700 bg-white/80 border border-gray-200 px-2.5 py-1 rounded-lg">
                            <span>{pattern.icon}</span>
                            <span className="truncate">{pattern.label}</span>
                          </span>
                        </td>

                        {/* Row Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* View Detail Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAnalysisId(item.analysisId);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100/70 transition-colors"
                              title="View Analysis Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>

                            {/* Bookmark Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleSave(e, item.analysisId)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSaved
                                  ? 'text-amber-500 hover:bg-amber-100/70'
                                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200/70'
                              }`}
                              title={isSaved ? 'Remove Bookmark' : 'Save Job'}
                            >
                              {isSaved ? (
                                <BookmarkSolidIcon className="w-4 h-4" />
                              ) : (
                                <BookmarkIcon className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(item);
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-100/70 transition-colors"
                              title="Delete Analysis"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px) */}
            <div className="block md:hidden divide-y divide-gray-100">
              {analyses.map((item) => {
                const pattern = scamPatternMap[item.scamPattern] || {
                  icon: '⚠️',
                  label: item.scamPattern || 'None',
                };
                const isSaved = savedJobIds.has(item.analysisId);

                return (
                  <div
                    key={item.analysisId}
                    onClick={() => setSelectedAnalysisId(item.analysisId)}
                    className={`p-4 space-y-3 cursor-pointer ${getRowBgClass(item.riskLevel)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-gray-900 leading-snug">
                          {item.jobTitle || 'Untitled Job'}
                        </h4>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                          🏢 {item.companyName || 'Unknown Company'}
                        </p>
                      </div>
                      <RiskBadge level={item.riskLevel} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span>Risk Score:</span>
                        <span className={`text-sm ${getRiskScoreColor(item.riskScore)}`}>
                          {item.riskScore}/100
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                        <span>{pattern.icon}</span>
                        <span>{pattern.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                      <span className="text-gray-400">{formatDate(item.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSave(e, item.analysisId)}
                          className="p-1 rounded-lg text-gray-500 hover:text-amber-600"
                        >
                          {isSaved ? (
                            <BookmarkSolidIcon className="w-4 h-4 text-amber-500" />
                          ) : (
                            <BookmarkIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item);
                          }}
                          className="p-1 rounded-lg text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAnalysisId(item.analysisId)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalElements={totalElements}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>

      {/* Analysis Details Modal */}
      <AnalysisDetailModal
        analysisId={selectedAnalysisId}
        isOpen={!!selectedAnalysisId}
        onClose={() => setSelectedAnalysisId(null)}
        onDelete={(deletedId) => {
          fetchHistory();
          setSelectedAnalysisId(null);
        }}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Scan Record"
        message={`Are you sure you want to permanently delete the analysis for "${itemToDelete?.companyName || 'this job'}"? This cannot be undone.`}
        confirmText="Delete Record"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default HistoryPage;
