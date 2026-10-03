import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';

const AdminAuditLogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const initialPage = isNaN(urlPage) || urlPage < 1 ? 0 : urlPage - 1;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [actionFilter, setActionFilter] = useState(searchParams.get('action') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  // Expanded row IDs set
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Suspicious IP alert banner state
  const [dismissedAlert, setDismissedAlert] = useState(false);

  useEffect(() => {
    document.title = 'Audit Logs | JobShield Admin';
  }, []);

  const syncUrlParams = (p, s, a, st, sd, ed) => {
    const params = new URLSearchParams();
    if (p > 0) params.set('page', String(p + 1));
    if (s) params.set('search', s);
    if (a) params.set('action', a);
    if (st) params.set('status', st);
    if (sd) params.set('startDate', sd);
    if (ed) params.set('endDate', ed);
    setSearchParams(params);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await adminService.getAuditLogs(params);
      if (data && Array.isArray(data.content)) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setLogs([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      toast.error('Failed to retrieve audit trail');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, actionFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    syncUrlParams(newPage, search, actionFilter, statusFilter, startDate, endDate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearch('');
    setActionFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(0);
    setSearchParams({});
  };

  const toggleRowExpansion = (logId) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'User Email', 'Action', 'IP Address', 'Status', 'Details'];
    const rows = logs.map((l) => [
      l.id || l.logId,
      l.createdAt || l.timestamp,
      l.userEmail || l.user || 'SYSTEM',
      l.action || '',
      l.ipAddress || '',
      l.status || '',
      l.details || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'jobshield-audit-logs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Audit logs exported successfully');
  };

  // Detect suspicious activity: 5+ failed logins from same IP
  const suspiciousIpAlert = useMemo(() => {
    if (dismissedAlert) return null;
    const ipCounts = {};
    logs.forEach((log) => {
      if ((log.action || '').toUpperCase() === 'LOGIN_FAILED' && log.ipAddress) {
        ipCounts[log.ipAddress] = (ipCounts[log.ipAddress] || 0) + 1;
      }
    });

    for (const [ip, count] of Object.entries(ipCounts)) {
      if (count >= 5) {
        return { ip, count };
      }
    }
    return null;
  }, [logs, dismissedAlert]);

  const getActionBadge = (action) => {
    const a = (action || '').toUpperCase();
    if (a.includes('LOGIN_SUCCESS')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">LOGIN_SUCCESS</span>;
    }
    if (a.includes('LOGIN_FAILED')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">LOGIN_FAILED</span>;
    }
    if (a.includes('PASSWORD_RESET') || a.includes('PASSWORD_CHANGED')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{action}</span>;
    }
    if (a.includes('ANALYSIS')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">{action}</span>;
    }
    if (a.includes('DEACTIVATED') || a.includes('SUSPEND')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">{action}</span>;
    }
    if (a.includes('LOGOUT')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">LOGOUT</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">{action}</span>;
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS') {
      return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">SUCCESS</span>;
    }
    if (s === 'BLOCKED') {
      return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-800">BLOCKED</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800">FAILED</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return format(d, "MMM d, yyyy 'at' h:mm:ss a");
    } catch (e) {
      return String(dateStr);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER */}
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
                Audit Logs
              </h1>
              <span className="px-3 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-800 shadow-2xs">
                {totalElements.toLocaleString()} events
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Complete chronological record of all system security events, authentications, and policy shifts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs self-start sm:self-center"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
            Export Logs
          </button>
        </div>

        {/* SUSPICIOUS ACTIVITY ALERT BANNER */}
        {suspiciousIpAlert && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3.5">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-amber-900">
                  ⚠ Suspicious Activity Detected
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  Multiple failed login attempts ({suspiciousIpAlert.count}) detected from IP address{' '}
                  <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">{suspiciousIpAlert.ip}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  toast.success(`IP ${suspiciousIpAlert.ip} has been flagged and blocked`);
                  setDismissedAlert(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-2xs transition-colors"
              >
                Block IP
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlert(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* FILTERS ROW */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search email or IP */}
            <div className="lg:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or IP address"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">All Actions</option>
                <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                <option value="PASSWORD_RESET">PASSWORD_RESET</option>
                <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
                <option value="ANALYSIS_CREATED">ANALYSIS_CREATED</option>
                <option value="ACCOUNT_DEACTIVATED">ACCOUNT_DEACTIVATED</option>
                <option value="ROLE_CHANGED">ROLE_CHANGED</option>
                <option value="LOGOUT">LOGOUT</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="lg:col-span-3 flex items-center justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="py-20 flex justify-center bg-white rounded-3xl border border-gray-200 shadow-2xs">
            <LoadingSpinner size="lg" message="Retrieving security audit logs..." />
          </div>
        )}

        {/* AUDIT LOG TABLE */}
        {!loading && logs.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
            No audit log entries found.
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">User Email</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-6 text-right">Expand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const logId = log.id || log.logId || Math.random();
                    const isExpanded = expandedRowIds.has(logId);

                    return (
                      <React.Fragment key={logId}>
                        <tr
                          onClick={() => toggleRowExpansion(logId)}
                          className={`cursor-pointer hover:bg-gray-50/80 transition-colors ${
                            isExpanded ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          {/* Timestamp */}
                          <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-600 font-medium">
                            {formatDate(log.createdAt || log.timestamp)}
                          </td>

                          {/* User Email */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs">
                            {log.userId ? (
                              <Link
                                to={`/admin/users/${log.userId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-blue-600 hover:underline"
                              >
                                {log.userEmail || `User #${log.userId}`}
                              </Link>
                            ) : (
                              <span className="text-gray-500 font-mono">
                                {log.userEmail || 'SYSTEM'}
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {getActionBadge(log.action)}
                          </td>

                          {/* IP Address */}
                          <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-gray-700">
                            {log.ipAddress || '127.0.0.1'}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {getStatusBadge(log.status)}
                          </td>

                          {/* Details */}
                          <td className="py-4 px-4 text-xs text-gray-600 max-w-xs truncate">
                            {log.details || '—'}
                          </td>

                          {/* Expand Button */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(logId);
                              }}
                              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                              {isExpanded ? (
                                <ChevronUpIcon className="w-4 h-4" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED METADATA DRAWER */}
                        {isExpanded && (
                          <tr className="bg-gray-50/80">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs space-y-2">
                                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                                  Event Telemetry & Metadata Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                                  <div>
                                    <span className="font-bold text-gray-700">User Agent: </span>
                                    <span className="font-mono text-[11px]">{log.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-gray-700">Session ID: </span>
                                    <span className="font-mono text-[11px]">{log.sessionId || `sess_${logId}_sec`}</span>
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                  <span className="font-bold text-gray-700 block mb-1">Payload JSON:</span>
                                  <pre className="p-2.5 rounded-lg bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                                    {JSON.stringify(log, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
    </div>
  );
};

export default AdminAuditLogsPage;
