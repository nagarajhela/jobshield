import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import RiskBadge from '../../components/common/RiskBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AnalysisDetailModal from '../../components/history/AnalysisDetailModal';
import adminService from '../../services/adminService';

const AdminAnalysesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const initialPage = isNaN(urlPage) || urlPage < 1 ? 0 : urlPage - 1;

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('riskLevel') || '');
  const [userEmail, setUserEmail] = useState(searchParams.get('userId') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'NEWEST');

  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  useEffect(() => {
    document.title = 'All Job Analyses | JobShield Admin';
  }, []);

  const syncUrlParams = (p, s, r, u, sd, ed, so) => {
    const params = new URLSearchParams();
    if (p > 0) params.set('page', String(p + 1));
    if (s) params.set('search', s);
    if (r) params.set('riskLevel', r);
    if (u) params.set('userId', u);
    if (sd) params.set('startDate', sd);
    if (ed) params.set('endDate', ed);
    if (so && so !== 'NEWEST') params.set('sort', so);
    setSearchParams(params);
  };

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (riskLevel) params.riskLevel = riskLevel;
      if (userEmail) params.userId = userEmail;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (sort) params.sort = sort;

      const data = await adminService.getAllAnalyses(params);
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
      toast.error('Failed to load system analyses');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, riskLevel, userEmail, startDate, endDate, sort]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleDeleteAnalysis = async (id) => {
    if (!window.confirm(`Are you sure you want to completely delete analysis #${id}? This will permanently remove it from the database.`)) {
      return;
    }
    try {
      await adminService.deleteAnalysis(id);
      toast.success(`Analysis #${id} permanently deleted.`);
      setAnalyses((prev) => prev.filter((item) => item.analysisId !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to delete analysis');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    syncUrlParams(newPage, search, riskLevel, userEmail, startDate, endDate, sort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearch('');
    setRiskLevel('');
    setUserEmail('');
    setStartDate('');
    setEndDate('');
    setSort('NEWEST');
    setCurrentPage(0);
    setSearchParams({});
  };

  const handleExportCSV = () => {
    if (analyses.length === 0) return;
    const headers = ['Analysis ID', 'Created At', 'User', 'Company', 'Job Title', 'Risk Level', 'Risk Score', 'Source'];
    const rows = analyses.map((a) => [
      a.analysisId,
      a.createdAt || '',
      a.userEmail || a.userId || 'Anonymous',
      a.companyName || '',
      a.jobTitle || '',
      a.riskLevel || '',
      a.riskScore ?? 0,
      a.sourceType || 'MANUAL',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'jobshield-all-analyses.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Analyses exported to CSV');
  };

  const stats = useMemo(() => {
    const total = totalElements || analyses.length;
    const high = analyses.filter((a) => (a.riskLevel || '').toUpperCase().includes('HIGH')).length;
    const med = analyses.filter((a) => (a.riskLevel || '').toUpperCase().includes('MED')).length;
    const low = analyses.filter((a) => (a.riskLevel || '').toUpperCase().includes('LOW')).length;
    const sample = analyses.length || 1;
    return {
      total,
      highCount: high,
      highPct: Math.round((high / sample) * 100),
      medCount: med,
      medPct: Math.round((med / sample) * 100),
      lowCount: low,
      lowPct: Math.round((low / sample) * 100),
    };
  }, [totalElements, analyses]);

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

  const getSourceBadge = (source) => {
    const s = (source || 'MANUAL').toUpperCase();
    if (s.includes('URL')) {
      return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800">URL Scan</span>;
    }
    if (s.includes('PDF')) {
      return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800">PDF</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700">Manual</span>;
  };

  const getRiskScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s <= 30) return 'text-emerald-600 font-semibold';
    if (s <= 60) return 'text-amber-600 font-semibold';
    if (s <= 80) return 'text-orange-600 font-bold';
    return 'text-red-600 font-black';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-2"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Back to Overview
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                All Job Analyses
              </h1>
              <span className="px-3 py-1 text-xs font-black rounded-full bg-purple-100 text-purple-800 shadow-2xs">
                {totalElements.toLocaleString()} analyses
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Global threat intelligence records submitted across all accounts and portal links.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Threat Scan
            </Link>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={analyses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
              Export All CSV
            </button>
          </div>
        </div>

        {/* SUMMARY STATS ROW */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200/90 text-xs font-bold text-gray-800 shadow-2xs">
            Total: <span className="text-blue-600">{stats.total.toLocaleString()}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 shadow-2xs">
            High Risk: {stats.highCount} ({stats.highPct}%)
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 shadow-2xs">
            Medium Risk: {stats.medCount} ({stats.medPct}%)
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
            Low Risk: {stats.lowCount} ({stats.lowPct}%)
          </div>
        </div>

        {/* FILTERS ROW */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-3 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or job title"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Risk Level */}
            <div className="lg:col-span-2">
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">All Risk Levels</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            {/* User Filter */}
            <div className="lg:col-span-3 relative">
              <input
                type="text"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Filter by user email or ID"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="HIGHEST_RISK">Highest Risk</option>
                <option value="LOWEST_RISK">Lowest Risk</option>
              </select>
            </div>

            {/* Clear button */}
            <div className="lg:col-span-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="py-20 flex justify-center bg-white rounded-3xl border border-gray-200 shadow-2xs">
            <LoadingSpinner size="lg" message="Loading analyses list..." />
          </div>
        )}

        {/* ANALYSES TABLE */}
        {!loading && analyses.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
            No analyses found matching your selected criteria.
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Date / Time</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Job Title</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Pattern</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analyses.map((row) => (
                    <tr
                      key={row.analysisId}
                      onClick={() => setSelectedAnalysisId(row.analysisId)}
                      className="hover:bg-gray-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {formatDate(row.createdAt)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600 max-w-[140px] truncate">
                        {row.userEmail || row.userId ? (
                          <Link
                            to={`/admin/users/${row.userId || 1}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {row.userEmail || `User #${row.userId}`}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {row.companyName}
                      </td>

                      <td className="py-4 px-4 text-gray-700 truncate max-w-xs">
                        {row.jobTitle}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <RiskBadge level={row.riskLevel} />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`text-base ${getRiskScoreColor(row.riskScore)}`}>
                          {row.riskScore}/100
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600">
                        {row.scamPattern || 'NONE'}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {getSourceBadge(row.sourceType)}
                      </td>

                      <td
                        className="py-4 px-6 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAnalysisId(row.analysisId)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnalysis(row.analysisId)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Completely Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Analysis Detail Drilldown */}
      <AnalysisDetailModal
        analysisId={selectedAnalysisId}
        isOpen={!!selectedAnalysisId}
        onClose={() => setSelectedAnalysisId(null)}
        onDelete={() => {
          setSelectedAnalysisId(null);
          fetchAnalyses();
        }}
      />
    </div>
  );
};

export default AdminAnalysesPage;
