import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/layout/Navbar';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import reportService from '../services/reportService';
import adminService from '../services/adminService';

const CommunityReportsPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [sortBy, setSortBy] = useState('LATEST'); // LATEST, MOST_VOTES

  // Expanded descriptions
  const [expandedIds, setExpandedIds] = useState(new Set());

  // User vote tracking in session
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    document.title = 'Community Reports | JobShield';
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (platformFilter) params.platform = platformFilter;
      if (sortBy) params.sort = sortBy;

      const data = await reportService.getReports(params);
      if (data && Array.isArray(data.content)) {
        setReports(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setReports(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setReports([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      toast.error('Failed to load community reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, platformFilter, sortBy]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`Are you sure you want to completely delete report #${reportId}? This will permanently remove it from the database.`)) {
      return;
    }
    try {
      await adminService.deleteReport(reportId);
      toast.success(`Report #${reportId} permanently deleted.`);
      setReports((prev) => prev.filter((r) => r.reportId !== reportId));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await adminService.updateReportStatus(reportId, newStatus);
      toast.success(`Report status updated to ${newStatus}`);
      fetchReports();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Fallback demo reports if backend reports empty
  const displayReports = useMemo(() => {
    if (reports.length > 0) return reports;
    return [
      {
        reportId: 1,
        companyName: 'Apex Data Transcription',
        jobTitle: 'Remote Word Document Typist',
        platform: 'Telegram',
        description:
          'Recruiter requested RM 250 as a refundable test deposit to receive the first assignment. When asked for business registration, they immediately blocked my number and deleted the group chat.',
        status: 'VERIFIED',
        reportedBy: 'Anonymous',
        createdAt: '2026-09-21T14:30:00Z',
        upvotes: 42,
        downvotes: 1,
      },
      {
        reportId: 2,
        companyName: 'Global Hospitality Group',
        jobTitle: 'VIP Concierge Associate',
        platform: 'LinkedIn',
        description:
          'Applicant was sent a Google Form requesting scanned copies of MyKad front and back, current bank statements, and utility bills before setting up a video interview.',
        status: 'PENDING',
        reportedBy: 'hafiz_99',
        createdAt: '2026-09-22T09:15:00Z',
        upvotes: 18,
        downvotes: 0,
      },
      {
        reportId: 3,
        companyName: 'Instant Wealth Partners',
        jobTitle: 'E-Commerce Product Reviewer',
        platform: 'WhatsApp',
        description:
          'Promise of RM 300 daily for clicking like buttons on overseas merchant products. After 2 days, they asked for a RM 500 deposit into a personal bank account to unlock earned wages.',
        status: 'VERIFIED',
        reportedBy: 'Anonymous',
        createdAt: '2026-09-20T18:00:00Z',
        upvotes: 79,
        downvotes: 2,
      },
    ];
  }, [reports]);

  const stats = useMemo(() => {
    const total = totalElements || displayReports.length;
    const verified = displayReports.filter((r) => r.status === 'VERIFIED').length;
    const pending = displayReports.filter((r) => r.status === 'PENDING').length;
    return { total, verified, pending };
  }, [totalElements, displayReports]);

  const handleVote = async (reportId, type) => {
    if (!isAuthenticated) {
      toast('Please log in to vote on reports', { icon: '🔒' });
      return;
    }

    try {
      if (type === 'up') {
        await reportService.upvoteReport(reportId);
        setReports((prev) =>
          prev.map((r) =>
            r.reportId === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r
          )
        );
        toast.success('Upvoted report');
      } else {
        await reportService.downvoteReport(reportId);
        setReports((prev) =>
          prev.map((r) =>
            r.reportId === reportId ? { ...r, downvotes: (r.downvotes || 0) + 1 } : r
          )
        );
        toast.success('Downvoted report');
      }
    } catch (err) {
      toast.error('Unable to register vote');
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return format(d, 'MMM d, yyyy');
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Community Scam Reports
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Crowdsourced incident reports and warnings submitted by job seekers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                navigate('/report-scam');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors self-start sm:self-center"
          >
            <PlusIcon className="w-4 h-4" />
            Submit a Report
          </button>
        </div>

        {/* STATS BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Submissions</span>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.total} total reports</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Verified Evidence</span>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{stats.verified} verified</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Under Review</span>
            <p className="text-2xl font-black text-amber-900 mt-0.5">{stats.pending} pending review</p>
          </div>
        </div>

        {/* FILTER ROW */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name or job title"
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                <option value="">All Platforms</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Telegram">Telegram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                <option value="LATEST">Sort by: Latest</option>
                <option value="MOST_VOTES">Sort by: Most Votes</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Loading community reports..." />
          </div>
        )}

        {/* REPORTS LIST */}
        {!loading && displayReports.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
            No scam reports found matching your criteria.
          </div>
        )}

        {!loading && displayReports.length > 0 && (
          <div className="space-y-4">
            {displayReports.map((item) => {
              const isExpanded = expandedIds.has(item.reportId);
              return (
                <div
                  key={item.reportId}
                  className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        {item.companyName}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-0.5">
                        {item.jobTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        📱 {item.platform}
                      </span>

                      {item.status === 'VERIFIED' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Verified
                        </span>
                      ) : item.status === 'REJECTED' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                          ✗ Rejected
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⏳ Under Review
                        </span>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-2">
                          {item.status !== 'VERIFIED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.reportId, 'VERIFIED')}
                              className="px-2 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                            >
                              Verify
                            </button>
                          )}
                          {item.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.reportId, 'REJECTED')}
                              className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(item.reportId)}
                            className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                            title="Completely Delete Report"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p
                      className={`text-xs sm:text-sm text-gray-700 leading-relaxed ${
                        !isExpanded ? 'line-clamp-3' : ''
                      }`}
                    >
                      {item.description}
                    </p>
                    {item.description && item.description.length > 180 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.reportId)}
                        className="mt-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                    <div>
                      Reported by <strong className="text-gray-800">{item.reportedBy || 'Anonymous'}</strong> on{' '}
                      {formatDate(item.createdAt)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVote(item.reportId, 'up')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition-colors"
                      >
                        <HandThumbUpIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>👍 {item.upvotes ?? 0}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVote(item.reportId, 'down')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition-colors"
                      >
                        <HandThumbDownIcon className="w-3.5 h-3.5 text-gray-500" />
                        <span>👎 {item.downvotes ?? 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalElements={totalElements || displayReports.length}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityReportsPage;
