import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AdminCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    campaignCode: '',
    severity: 'HIGH',
    platformOrigin: 'Telegram & WhatsApp',
    targetedJobTitles: '',
    victimCount: 1,
    description: '',
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // Try /api/campaigns first or adminService
      const res = await adminService.getCampaigns ? adminService.getCampaigns() : null;
      if (res && Array.isArray(res)) {
        setCampaigns(res);
      } else {
        const fallback = await fetch('http://localhost:8081/api/campaigns').then(r => r.json());
        setCampaigns(Array.isArray(fallback) ? fallback : []);
      }
    } catch (e) {
      toast.error('Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Campaign title is required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await adminService.createCampaign({
        ...formData,
        victimCount: parseInt(formData.victimCount, 10) || 0,
        active: true,
      });
      toast.success('New campaign added successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        campaignCode: '',
        severity: 'HIGH',
        platformOrigin: 'Telegram & WhatsApp',
        targetedJobTitles: '',
        victimCount: 1,
        description: '',
      });
      setCampaigns((prev) => [created, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (campaignId, title) => {
    if (!window.confirm(`Are you sure you want to completely delete campaign "${title || campaignId}"? This will permanently remove it from the database.`)) {
      return;
    }
    try {
      await adminService.deleteCampaign(campaignId);
      toast.success('Campaign completely deleted.');
      setCampaigns((prev) => prev.filter((c) => c.campaignId !== campaignId));
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Back to Overview
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Scam Campaigns</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                {campaigns.length} campaigns
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Track coordinated fraudulent recruitment campaigns, syndicate networks, and victim telemetry.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors self-start sm:self-center"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Campaign
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-600">No active campaigns detected at this time.</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add New Campaign" to record a scam pattern.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div
                key={c.campaignId || c.campaignCode}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        c.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700'
                          : c.severity === 'HIGH'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {c.severity || 'HIGH'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{c.platformOrigin || 'Cross-Platform'}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {c.title || c.campaignName || 'Phishing Syndicate'}
                  </h3>
                  {c.campaignCode && (
                    <span className="text-[11px] font-mono text-gray-400 mt-0.5 block">
                      Code: {c.campaignCode}
                    </span>
                  )}

                  <p className="mt-2.5 text-xs text-gray-600 line-clamp-3">
                    {c.description || 'Targeting job seekers with advance fees.'}
                  </p>

                  {c.targetedJobTitles && (
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Targeting: </span>
                      {c.targetedJobTitles}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Victims flagged: <strong className="text-gray-900">{c.victimCount ?? 0}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCampaign(c.campaignId, c.title)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Permanently Delete Campaign"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD CAMPAIGN MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                  Add New Scam Campaign
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Telegram High-Pay Typist Advance Fee Syndicate"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Campaign Code
                    </label>
                    <input
                      type="text"
                      name="campaignCode"
                      value={formData.campaignCode}
                      onChange={handleInputChange}
                      placeholder="e.g. CAMP-TYP-01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Severity Level
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Platform Origin
                    </label>
                    <input
                      type="text"
                      name="platformOrigin"
                      value={formData.platformOrigin}
                      onChange={handleInputChange}
                      placeholder="e.g. Telegram & LinkedIn"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Victims Flagged
                    </label>
                    <input
                      type="number"
                      name="victimCount"
                      min="0"
                      value={formData.victimCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Targeted Job Titles
                  </label>
                  <input
                    type="text"
                    name="targetedJobTitles"
                    value={formData.targetedJobTitles}
                    onChange={handleInputChange}
                    placeholder="e.g. Remote Typist, Data Entry Clerk, Translator"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Description & Modus Operandi
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe how the scam operates, requests for upfront fees, spoofed domains, etc."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCampaignsPage;
