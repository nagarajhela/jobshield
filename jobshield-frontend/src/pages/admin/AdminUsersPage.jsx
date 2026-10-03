import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import adminService from '../../services/adminService';

const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial values from URL params
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const initialPage = isNaN(urlPage) || urlPage < 1 ? 0 : urlPage - 1;
  const initialSearch = searchParams.get('search') || '';
  const initialRole = searchParams.get('role') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialSize = parseInt(searchParams.get('size') || '10', 10);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Actions menu and confirmation state
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'danger',
    onConfirm: null,
  });

  useEffect(() => {
    document.title = 'User Management | JobShield Admin';
  }, []);

  // Sync state to URL params
  const syncUrlParams = (page, search, role, status, size) => {
    const params = new URLSearchParams();
    if (page > 0) params.set('page', String(page + 1));
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (size !== 10) params.set('size', String(size));
    setSearchParams(params);
  };

  // Debounce search input by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
      syncUrlParams(0, searchInput, roleFilter, statusFilter, pageSize);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (searchInput) params.search = searchInput;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await adminService.getAllUsers(params);
      if (data && Array.isArray(data.content)) {
        setUsers(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setUsers([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      toast.error('Failed to load user management list');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchInput, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    syncUrlParams(newPage, searchInput, roleFilter, statusFilter, pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChangeFilter = (newRole) => {
    setRoleFilter(newRole);
    setCurrentPage(0);
    syncUrlParams(0, searchInput, newRole, statusFilter, pageSize);
  };

  const handleStatusChangeFilter = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(0);
    syncUrlParams(0, searchInput, roleFilter, newStatus, pageSize);
  };

  const handleSizeChange = (newSize) => {
    const parsed = parseInt(newSize, 10);
    setPageSize(parsed);
    setCurrentPage(0);
    syncUrlParams(0, searchInput, roleFilter, statusFilter, parsed);
  };

  // Export Users CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['User ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Verified', 'Created At'];
    const rows = users.map((u) => [
      u.userId,
      u.firstName || '',
      u.lastName || '',
      u.email,
      u.role || 'USER',
      u.status || 'ACTIVE',
      u.emailVerified ? 'Yes' : 'No',
      u.createdAt || '',
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'jobshield-users.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  // User Actions (Role update, Status update)
  const handleApplyStatus = (user, newStatus) => {
    setActionMenuOpenId(null);
    setDialogState({
      isOpen: true,
      title: `${newStatus === 'ACTIVE' ? 'Activate' : newStatus === 'SUSPENDED' ? 'Suspend' : 'Ban'} User Account`,
      message: `Are you sure you want to change status for ${user.email} to ${newStatus}?`,
      confirmText: `Confirm ${newStatus}`,
      variant: newStatus === 'ACTIVE' ? 'info' : 'danger',
      onConfirm: async () => {
        try {
          await adminService.updateUserStatus(user.userId, newStatus, `Admin action: ${newStatus}`);
          toast.success(`User updated to ${newStatus}`);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error('Failed to update user status');
        }
      },
    });
  };

  const handleApplyRole = (user, newRole) => {
    setActionMenuOpenId(null);
    setDialogState({
      isOpen: true,
      title: `Change User Role to ${newRole}`,
      message: `Are you sure you want to update permissions for ${user.email} to ${newRole}?`,
      confirmText: `Set Role to ${newRole}`,
      variant: newRole === 'ADMIN' ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          await adminService.updateUserRole(user.userId, newRole, `Admin role promotion: ${newRole}`);
          toast.success(`User role set to ${newRole}`);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          fetchUsers();
        } catch (err) {
          toast.error('Failed to update role');
        }
      },
    });
  };

  const handleDeleteUser = (user) => {
    setActionMenuOpenId(null);
    setDialogState({
      isOpen: true,
      title: 'Permanently Delete User',
      message: `Are you sure you want to completely delete user "${user.email}"? All their analyses and history will be permanently deleted from the database.`,
      confirmText: 'Delete User',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteUser(user.userId);
          toast.success(`User ${user.email} permanently deleted.`);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          setUsers((prev) => prev.filter((item) => item.userId !== user.userId));
          setTotalElements((prev) => Math.max(0, prev - 1));
        } catch (err) {
          toast.error('Failed to delete user');
        }
      },
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                User Management
              </h1>
              <span className="px-3 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-800 shadow-2xs">
                {totalElements.toLocaleString()} users
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Inspect user activity, modify roles, manage credentials, and take moderation actions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={users.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
              Export Users CSV
            </button>
          </div>
        </div>

        {/* SEARCH AND FILTER ROW */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email address"
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

            {/* Role Filter */}
            <div className="lg:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => handleRoleChangeFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ANALYST">Analyst</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChangeFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BANNED">BANNED</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="lg:col-span-2">
              <select
                value={pageSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="py-20 flex justify-center bg-white rounded-3xl border border-gray-200 shadow-2xs">
            <LoadingSpinner size="lg" message="Loading users list..." />
          </div>
        )}

        {/* USERS TABLE */}
        {!loading && users.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500">
            No users found matching your search or filters.
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Verified</th>
                    <th className="py-3.5 px-4">Member Since</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-center">Analyses</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const initials = ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || 'U';
                    const isMenuOpen = actionMenuOpenId === u.userId;

                    return (
                      <tr
                        key={u.userId}
                        onClick={() => navigate(`/admin/users/${u.userId}`)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        {/* User Avatar + Name + Email */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'ANALYST'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role || 'USER'}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.status === 'SUSPENDED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status || 'ACTIVE'}
                          </span>
                        </td>

                        {/* Email Verified */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          {u.emailVerified ? (
                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>

                        {/* Member Since */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                          {formatDate(u.createdAt)}
                        </td>

                        {/* Last Login */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                          {formatDate(u.lastLoginAt)}
                        </td>

                        {/* Total Analyses */}
                        <td className="py-4 px-4 text-center whitespace-nowrap font-bold text-gray-900">
                          {u.totalAnalyses ?? 0}
                        </td>

                        {/* Actions Dropdown */}
                        <td
                          className="py-4 px-6 text-right whitespace-nowrap relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setActionMenuOpenId(isMenuOpen ? null : u.userId)
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-6 top-10 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 space-y-1 text-xs text-gray-700 animate-fade-in">
                                <Link
                                  to={`/admin/users/${u.userId}`}
                                  className="block px-4 py-2 hover:bg-gray-50 font-bold"
                                >
                                  View Details
                                </Link>

                                <div className="border-t border-gray-100 my-1" />
                                <span className="block px-4 py-1 text-[10px] font-bold uppercase text-gray-400">
                                  Change Role
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleApplyRole(u, 'USER')}
                                  className="w-full text-left px-4 py-1.5 hover:bg-gray-50"
                                >
                                  Set as USER
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyRole(u, 'ANALYST')}
                                  className="w-full text-left px-4 py-1.5 hover:bg-gray-50"
                                >
                                  Set as ANALYST
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyRole(u, 'ADMIN')}
                                  className="w-full text-left px-4 py-1.5 hover:bg-gray-50 text-purple-700 font-semibold"
                                >
                                  Set as ADMIN
                                </button>

                                <div className="border-t border-gray-100 my-1" />
                                <span className="block px-4 py-1 text-[10px] font-bold uppercase text-gray-400">
                                  Account Status
                                </span>
                                {u.status !== 'ACTIVE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyStatus(u, 'ACTIVE')}
                                    className="w-full text-left px-4 py-1.5 hover:bg-emerald-50 text-emerald-700 font-bold"
                                  >
                                    Activate Account
                                  </button>
                                )}
                                {u.status !== 'SUSPENDED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyStatus(u, 'SUSPENDED')}
                                    className="w-full text-left px-4 py-1.5 hover:bg-amber-50 text-amber-700 font-bold"
                                  >
                                    Suspend Account
                                  </button>
                                )}
                                {u.status !== 'BANNED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApplyStatus(u, 'BANNED')}
                                    className="w-full text-left px-4 py-1.5 hover:bg-red-50 text-red-700 font-bold"
                                  >
                                    Ban Account
                                  </button>
                                )}

                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  className="w-full text-left px-4 py-1.5 hover:bg-red-50 text-red-600 font-bold"
                                >
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
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

export default AdminUsersPage;
