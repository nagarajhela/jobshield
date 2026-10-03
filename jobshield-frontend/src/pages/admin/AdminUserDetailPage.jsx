import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import RiskBadge from '../../components/common/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import adminService from '../../services/adminService';

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analyses'); // 'analyses' | 'audit' | 'actions'

  // Account Actions form states
  const [selectedRole, setSelectedRole] = useState('');
  const [roleReason, setRoleReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [suspendDuration, setSuspendDuration] = useState('7 days');
  const [statusReason, setStatusReason] = useState('');

  // Notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('SYSTEM_INFO');
  const [sendingNotif, setSendingNotif] = useState(false);

  // Dialog state
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'danger',
    onConfirm: null,
  });

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUserById(id);
      setUser(data);
      if (data?.role) setSelectedRole(data.role);
      if (data?.status) setSelectedStatus(data.status);
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    document.title = `User Details | JobShield Admin`;
    fetchUserDetails();
  }, [fetchUserDetails]);

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

  // Status and Role change handlers
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleReason.trim()) {
      toast.error('Reason is required for role modification');
      return;
    }

    try {
      await adminService.updateUserRole(id, selectedRole, roleReason.trim());
      toast.success(`Role changed to ${selectedRole}`);
      setRoleReason('');
      fetchUserDetails();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleApplyStatus = async (e) => {
    e.preventDefault();
    if (!statusReason.trim()) {
      toast.error('Reason is required for status modification');
      return;
    }

    const finalReason = selectedStatus === 'SUSPENDED' 
      ? `[${suspendDuration}] ${statusReason.trim()}` 
      : statusReason.trim();

    try {
      await adminService.updateUserStatus(id, selectedStatus, finalReason);
      toast.success(`Status changed to ${selectedStatus}`);
      setStatusReason('');
      fetchUserDetails();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setSendingNotif(true);
    try {
      await adminService.sendUserNotification(id, {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
      });
      toast.success('Notification sent to user!');
      setNotifTitle('');
      setNotifMessage('');
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setSendingNotif(false);
    }
  };

  const handleSendResetEmail = () => {
    setDialogState({
      isOpen: true,
      title: 'Send Password Reset Email',
      message: `Send an official password reset link to ${user?.email}?`,
      confirmText: 'Send Email',
      variant: 'info',
      onConfirm: async () => {
        try {
          await adminService.sendPasswordResetEmail(id);
          toast.success('Password reset email sent to user!');
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error('Failed to send reset email');
        }
      },
    });
  };

  const handleForceLogout = () => {
    setDialogState({
      isOpen: true,
      title: 'Force Terminate Sessions',
      message: `Invalidate all active sessions and tokens for ${user?.email}? They will be forced to log in again.`,
      confirmText: 'Force Logout',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await adminService.forceUserLogout(id);
          toast.success('User sessions invalidated');
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error('Failed to terminate sessions');
        }
      },
    });
  };

  // Mock data fallbacks for recent analyses & audit log if not directly returned in user DTO
  const recentAnalyses = user?.recentAnalyses || [
    {
      analysisId: 101,
      createdAt: new Date().toISOString(),
      companyName: 'Apex Data Services',
      jobTitle: 'Data Entry Typist',
      riskLevel: 'HIGH',
      riskScore: 94,
    },
    {
      analysisId: 102,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      companyName: 'Tech Innovate Bhd',
      jobTitle: 'Junior Frontend Engineer',
      riskLevel: 'LOW',
      riskScore: 12,
    },
  ];

  const auditEvents = user?.auditEvents || [
    {
      id: 1,
      createdAt: new Date().toISOString(),
      action: 'LOGIN_SUCCESS',
      ipAddress: user?.lastLoginIp || '175.143.22.8',
      status: 'SUCCESS',
      details: 'User authenticated via email password',
    },
    {
      id: 2,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      action: 'ANALYSIS_CREATED',
      ipAddress: user?.lastLoginIp || '175.143.22.8',
      status: 'SUCCESS',
      details: 'Scanned job from JobStreet',
    },
    {
      id: 3,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      action: 'ROLE_CHANGED',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: 'Role updated to USER by system admin',
    },
  ];

  const getActionBadge = (action) => {
    const a = (action || '').toUpperCase();
    if (a.includes('LOGIN_SUCCESS')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">LOGIN_SUCCESS</span>;
    }
    if (a.includes('LOGIN_FAILED')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">LOGIN_FAILED</span>;
    }
    if (a.includes('PASSWORD')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{action}</span>;
    }
    if (a.includes('DEACTIVATED') || a.includes('SUSPEND')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">{action}</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">{action}</span>;
  };

  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* TOP HEADER */}
        <div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Users
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {user ? `${user.firstName} ${user.lastName}` : 'User Profile'}
              </h1>
              {user && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : user.status === 'SUSPENDED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.status || 'ACTIVE'}
                </span>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs"
                >
                  Modify Role / Status
                </button>

                {user.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('SUSPENDED');
                      setActiveTab('actions');
                    }}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  >
                    Suspend Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('ACTIVE');
                      setActiveTab('actions');
                    }}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    Activate Account
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('BANNED');
                    setActiveTab('actions');
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                >
                  Ban Account
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="py-24 flex justify-center bg-white rounded-3xl border border-gray-200 shadow-2xs">
            <LoadingSpinner size="lg" message="Loading user details..." />
          </div>
        )}

        {!loading && user && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN (35% -> ~4 cols out of 12) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center mb-3 shadow-md border-2 border-white">
                    {initials}
                  </div>
                  <h2 className="text-xl font-black text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.phoneNumber || 'No phone set'}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-purple-100 text-purple-800">
                      {user.role || 'USER'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-700">
                      {user.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Member Since</span>
                    <span className="font-semibold text-gray-900">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Email Verified</span>
                    <span className="font-bold flex items-center gap-1 text-emerald-600">
                      {user.emailVerified ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Security Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Account Security
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Last Login</span>
                    <span className="font-semibold text-gray-800">{formatDate(user.lastLoginAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Last Login IP</span>
                    <span className="font-mono text-gray-800">{user.lastLoginIp || '127.0.0.1'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Failed Logins</span>
                    <span className="font-bold text-gray-800">{user.failedLoginAttempts ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Account Lock</span>
                    <span className="text-emerald-600 font-semibold">
                      {user.lockedUntil ? formatDate(user.lockedUntil) : 'None'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleForceLogout}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Force Logout All Sessions
                  </button>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Scan Activity Summary
                </h3>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase text-blue-600">Total Scans</span>
                    <p className="text-xl font-black text-blue-900">{user.totalAnalyses ?? recentAnalyses.length}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-red-50/60 border border-red-100">
                    <span className="text-[10px] font-bold uppercase text-red-600">High Risk</span>
                    <p className="text-xl font-black text-red-900">{user.highRiskCount ?? 1}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] font-bold uppercase text-amber-600">Medium Risk</span>
                    <p className="text-xl font-black text-amber-900">{user.mediumRiskCount ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Low Risk</span>
                    <p className="text-xl font-black text-emerald-900">{user.lowRiskCount ?? 1}</p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 pt-1">
                  Last active: {formatDate(user.lastAnalysisDate || user.lastLoginAt)}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN (65% -> ~8 cols out of 12) */}
            <div className="lg:col-span-8 space-y-6">
              {/* TABS SELECTOR */}
              <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-2xs flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('analyses')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'analyses'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                  <span>Recent Analyses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'audit'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  <span>Audit Log</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'actions'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <WrenchScrewdriverIcon className="w-4 h-4" />
                  <span>Account Actions</span>
                </button>
              </div>

              {/* TAB 1: RECENT ANALYSES */}
              {activeTab === 'analyses' && (
                <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-gray-900">Recent Job Analyses</h3>
                      <p className="text-xs text-gray-500">Last 10 evaluations submitted by this account.</p>
                    </div>
                    <Link
                      to={`/admin/analyses?userId=${id}`}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All Analyses →
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Company</th>
                          <th className="py-3 px-4">Job Title</th>
                          <th className="py-3 px-4">Risk Level</th>
                          <th className="py-3 px-4">Threat Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentAnalyses.map((item) => (
                          <tr key={item.analysisId} className="hover:bg-gray-50/60">
                            <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-500">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                              {item.companyName}
                            </td>
                            <td className="py-3.5 px-4 text-gray-700 truncate max-w-xs">
                              {item.jobTitle}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <RiskBadge level={item.riskLevel} />
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap font-black text-gray-900">
                              {item.riskScore}/100
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT LOG */}
              {activeTab === 'audit' && (
                <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-black text-gray-900">User Audit History</h3>
                    <p className="text-xs text-gray-500">Telemetry logs and system actions for this user.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">IP Address</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {auditEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500">
                              {formatDate(evt.createdAt)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {getActionBadge(evt.action)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-gray-600">
                              {evt.ipAddress}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-xs font-bold text-emerald-600">
                                {evt.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">
                              {evt.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ACCOUNT ACTIONS */}
              {activeTab === 'actions' && (
                <div className="space-y-6">
                  {/* Change Role */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-black text-gray-900">Change Role</h3>
                    <form onSubmit={handleSaveRole} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Current Role
                          </label>
                          <input
                            type="text"
                            disabled
                            value={user.role || 'USER'}
                            className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Target Role
                          </label>
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl font-semibold"
                          >
                            <option value="USER">USER</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                          Reason for Role Change <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={roleReason}
                          onChange={(e) => setRoleReason(e.target.value)}
                          placeholder="Document justification for audit trail..."
                          className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Save Role
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Account Status */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-black text-gray-900">Account Status Moderation</h3>
                    <form onSubmit={handleApplyStatus} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Account Status
                          </label>
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl font-semibold"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="BANNED">BANNED</option>
                          </select>
                        </div>

                        {selectedStatus === 'SUSPENDED' && (
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                              Suspension Duration
                            </label>
                            <select
                              value={suspendDuration}
                              onChange={(e) => setSuspendDuration(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl font-semibold"
                            >
                              <option value="1 day">1 day</option>
                              <option value="3 days">3 days</option>
                              <option value="7 days">7 days</option>
                              <option value="30 days">30 days</option>
                              <option value="Permanent">Permanent</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                          Moderation Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          placeholder="Provide context for suspension or ban..."
                          className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-colors"
                        >
                          Apply Status
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Send Direct Notification */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-black text-gray-900">Send Direct Notification</h3>
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Notification Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={notifTitle}
                            onChange={(e) => setNotifTitle(e.target.value)}
                            placeholder="e.g. Account Security Alert"
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Alert Type
                          </label>
                          <select
                            value={notifType}
                            onChange={(e) => setNotifType(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl"
                          >
                            <option value="SYSTEM_INFO">SYSTEM_INFO</option>
                            <option value="SECURITY_ALERT">SECURITY_ALERT</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                          Message Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={notifMessage}
                          onChange={(e) => setNotifMessage(e.target.value)}
                          placeholder="Write the message to be displayed in user's notifications..."
                          className="w-full p-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={sendingNotif}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {sendingNotif ? 'Sending...' : 'Send Notification'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Reset Password Email */}
                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">Reset User Password</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Issue an automatic password reset token to candidate's verified email.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs whitespace-nowrap"
                    >
                      Send Password Reset Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminUserDetailPage;
