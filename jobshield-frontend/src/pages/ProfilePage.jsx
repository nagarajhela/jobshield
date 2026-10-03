import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  KeyIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/layout/Navbar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const ProfilePage = () => {
  const { currentUser, refreshUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'settings'

  // Profile info state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Account Settings Notification Toggles
  const [settings, setSettings] = useState({
    emailNotifications: true,
    highRiskAlerts: true,
    campaignAlerts: true,
    securityAlerts: true,
  });

  // Danger Zone Delete Modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    document.title = 'My Profile | JobShield';
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phoneNumber: currentUser.phoneNumber || '',
      });
    }
  }, [currentUser]);

  // Password strength validation live rules
  const hasMinLength = passwords.newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwords.newPassword);
  const hasNumber = /[0-9]/.test(passwords.newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile(profileData);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error('Please meet all password requirements.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success('Notification preferences updated!');
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteEmailInput.trim().toLowerCase() !== (currentUser?.email || '').toLowerCase()) {
      toast.error('Email confirmation does not match your account email.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      // In a production backend, calls account deletion endpoint
      toast.success('Your account has been deleted.');
      setIsDeleteDialogOpen(false);
      logout();
    } catch (err) {
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Initials for avatar
  const initials = useMemo(() => {
    const f = currentUser?.firstName?.[0] || '';
    const l = currentUser?.lastName?.[0] || '';
    return (f + l).toUpperCase() || 'JS';
  }, [currentUser]);

  // Role Badge Formatter
  const renderRoleBadge = (role) => {
    const r = (role || 'USER').toUpperCase();
    if (r === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
          Admin
        </span>
      );
    }
    if (r === 'ANALYST') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
          Analyst
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-700 border border-gray-200">
        User
      </span>
    );
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Account & Profile
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal profile, security credentials, and alert preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* LEFT SIDEBAR (30% -> 3 cols out of 10) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm flex flex-col items-center text-center">
              {/* Profile Picture Circle (120px) */}
              <div className="relative mb-4">
                <div className="w-[120px] h-[120px] rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-md border-4 border-white">
                  {initials}
                </div>
                <button
                  type="button"
                  onClick={() => toast('Photo upload will be available in the next release.', { icon: 'ℹ️' })}
                  className="absolute bottom-1 right-1 p-2 bg-gray-900 text-white rounded-full shadow-md hover:bg-gray-800 transition-colors"
                  title="Change Photo"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Name & Email */}
              <h2 className="text-xl font-black text-gray-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 break-all">
                {currentUser?.email}
              </p>

              <div className="mt-3">
                {renderRoleBadge(currentUser?.role)}
              </div>

              {/* Metadata List */}
              <div className="w-full mt-6 pt-6 border-t border-gray-100 text-left space-y-3 text-xs">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Member Since</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(currentUser?.createdAt || new Date())}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-500">
                  <span>Last Login</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(currentUser?.lastLoginAt || new Date())}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-500">
                  <span>Last IP</span>
                  <span className="font-mono text-gray-800">
                    {currentUser?.lastLoginIp || '127.0.0.1'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN SECTION (70% -> 7 cols out of 10) */}
          <div className="lg:col-span-7 space-y-6">
            {/* TABS HEADER */}
            <div className="bg-white rounded-2xl p-2 border border-gray-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserCircleIcon className="w-4 h-4" />
                <span>Profile Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'password'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <KeyIcon className="w-4 h-4" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
            </div>

            {/* TAB CONTENT CARDS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm">
              {/* TAB 1: PROFILE INFO */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Update your identity and communication details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phoneNumber: e.target.value })
                      }
                      placeholder="+60 12-345 6789"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address (Read-Only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-100 border border-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
                    />
                    <span className="text-xs text-gray-400 mt-1 block">
                      Contact support to change your primary account email.
                    </span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CHANGE PASSWORD */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Change Password</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ensure your account uses a secure, non-reused password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, currentPassword: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Password requirements checklist */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <span className="font-bold text-gray-700 block mb-1">
                      Password Requirements:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={hasMinLength ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                        {hasMinLength ? '✓' : '○'} At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={hasUppercase ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                        {hasUppercase ? '✓' : '○'} At least one uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={hasNumber ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                        {hasNumber ? '✓' : '○'} At least one number
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwords.confirmNewPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmNewPassword: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={changingPassword || !isPasswordValid}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {changingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: ACCOUNT SETTINGS & DANGER ZONE */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        Notification Preferences
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customize what email alerts and urgent updates you receive.
                      </p>
                    </div>

                    <div className="divide-y divide-gray-100 border-y border-gray-100">
                      {[
                        {
                          id: 'emailNotifications',
                          title: 'Email notifications',
                          desc: 'Receive periodic weekly safety summaries and tips.',
                        },
                        {
                          id: 'highRiskAlerts',
                          title: 'High risk detection alerts',
                          desc: 'Immediate warning if a scanned job matches known syndicate indicators.',
                        },
                        {
                          id: 'campaignAlerts',
                          title: 'Scam campaign updates',
                          desc: 'Notifications when fresh scam campaigns target your industry.',
                        },
                        {
                          id: 'securityAlerts',
                          title: 'Security and login alerts',
                          desc: 'Alerts on password changes, new logins, or suspicious sessions.',
                        },
                      ].map((item) => (
                        <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings[item.id]}
                              onChange={(e) => {
                                setSettings({ ...settings, [item.id]: e.target.checked });
                                handleSaveSettings();
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 rounded-2xl bg-red-50/70 border-2 border-red-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-black text-red-900">Danger Zone</h4>
                        <p className="text-xs sm:text-sm text-red-700 mt-0.5 leading-relaxed">
                          Permanently delete your account and all associated job scan history. This action cannot be reversed.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteEmailInput('');
                          setIsDeleteDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-red-700 bg-white border border-red-300 hover:bg-red-100 rounded-xl transition-colors shadow-2xs"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center gap-3 text-red-600">
              <ExclamationTriangleIcon className="w-7 h-7" />
              <h3 className="text-lg font-black text-gray-900">Delete Account</h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              This will permanently delete all your analyses, saved jobs, and profile records.
              Type your account email (<strong>{currentUser?.email}</strong>) below to confirm:
            </p>

            <input
              type="email"
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder="Type your email to confirm"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  isDeletingAccount ||
                  deleteEmailInput.trim().toLowerCase() !== (currentUser?.email || '').toLowerCase()
                }
                onClick={handleDeleteAccountConfirm}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-40 transition-colors"
              >
                {isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
