import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import campaignService from '../services/campaignService';

export const parseJobTitles = (titles) => {
  if (!titles) return [];
  if (Array.isArray(titles)) return titles;
  if (typeof titles === 'string') {
    return titles
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('LATEST'); // LATEST, VICTIMS, SEVERITY
  const [activeOnly, setActiveOnly] = useState(false);

  // Load more pagination state
  const [displayCount, setDisplayCount] = useState(9);

  useEffect(() => {
    document.title = 'Scam Campaigns | JobShield';
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campaignService.getCampaigns();
      const list = Array.isArray(data) ? data : data?.content || [];
      setCampaigns(list);
    } catch (err) {
      toast.error('Failed to load active scam campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Fallback demo data if backend hasn't seeded campaigns yet
  const effectiveCampaigns = useMemo(() => {
    if (campaigns.length > 0) return campaigns;
    return [
      {
        campaignId: 1,
        campaignCode: 'CAMP-2026-001',
        title: 'Telegram High-Pay Typist Advance Fee Syndicate',
        description:
          'Recruiters impersonate legitimate publishing firms offering RM 150/hr for converting images to Word documents, requesting an upfront software activation fee.',
        severity: 'CRITICAL',
        isActive: true,
        victimCount: 64,
        firstSeen: '2026-08-12T10:00:00Z',
        lastSeen: '2026-09-22T08:30:00Z',
        platform: 'Telegram / WhatsApp',
        targetedJobTitles: ['Data Entry Typist', 'Online Document Specialist', 'Remote Copy Typist', 'Transcriptionist'],
        scamPattern: 'ADVANCE_FEE',
      },
      {
        campaignId: 2,
        campaignCode: 'CAMP-2026-002',
        title: 'Spoofed Hotel Hospitality Data Harvester',
        description:
          'Fraudulent job listings using names of regional 5-star hotel chains requesting full passport scans and bank statements before initial interviews.',
        severity: 'HIGH',
        isActive: true,
        victimCount: 38,
        firstSeen: '2026-09-01T14:20:00Z',
        lastSeen: '2026-09-21T16:45:00Z',
        platform: 'Indeed / JobStreet',
        targetedJobTitles: ['Front Desk Associate', 'Guest Relations Officer', 'Night Auditor'],
        scamPattern: 'DATA_HARVESTING',
      },
      {
        campaignId: 3,
        campaignCode: 'CAMP-2026-003',
        title: 'E-Commerce Rating Task Pyramid Scheme',
        description:
          'Victims are invited to complete daily 30-minute product review tasks on fraudulent crypto-funded dashboards to earn commissions, leading to deposit lockouts.',
        severity: 'CRITICAL',
        isActive: true,
        victimCount: 129,
        firstSeen: '2026-07-28T09:15:00Z',
        lastSeen: '2026-09-22T12:10:00Z',
        platform: 'WhatsApp / Facebook',
        targetedJobTitles: ['Order Processing Assistant', 'Product Reviewer', 'Affiliate Operator'],
        scamPattern: 'MLM_PYRAMID',
      },
      {
        campaignId: 4,
        campaignCode: 'CAMP-2026-004',
        title: 'Overseas Virtual Personal Assistant Phishing Ring',
        description:
          'Phishing websites pretending to hire executive virtual assistants, redirecting applicants to fake login forms to compromise Google and Microsoft accounts.',
        severity: 'MEDIUM',
        isActive: false,
        victimCount: 19,
        firstSeen: '2026-08-20T11:00:00Z',
        lastSeen: '2026-09-10T18:00:00Z',
        platform: 'LinkedIn',
        targetedJobTitles: ['Executive VA', 'Remote Scheduling Coordinator'],
        scamPattern: 'PHISHING',
      },
    ];
  }, [campaigns]);

  // Counts for tabs
  const severityCounts = useMemo(() => {
    const counts = { ALL: effectiveCampaigns.length, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    effectiveCampaigns.forEach((c) => {
      const s = (c.severity || 'LOW').toUpperCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [effectiveCampaigns]);

  const activeCount = useMemo(() => {
    return effectiveCampaigns.filter((c) => (c.active !== undefined ? c.active : c.isActive)).length;
  }, [effectiveCampaigns]);

  // Filtered and Sorted Campaigns
  const filteredCampaigns = useMemo(() => {
    return effectiveCampaigns
      .filter((c) => {
        const isCampActive = c.active !== undefined ? c.active : c.isActive;
        if (activeOnly && !isCampActive) return false;
        if (severityFilter !== 'ALL' && (c.severity || '').toUpperCase() !== severityFilter) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = (c.title || '').toLowerCase().includes(q);
          const matchDesc = (c.description || '').toLowerCase().includes(q);
          const titlesList = parseJobTitles(c.targetedJobTitles);
          const matchTitles = titlesList.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTitles) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'VICTIMS') {
          return (b.victimCount || 0) - (a.victimCount || 0);
        }
        if (sortBy === 'SEVERITY') {
          const rank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (rank[b.severity] || 0) - (rank[a.severity] || 0);
        }
        // Default LATEST
        return new Date(b.lastSeen || b.firstSeen || 0) - new Date(a.lastSeen || a.firstSeen || 0);
      });
  }, [effectiveCampaigns, activeOnly, severityFilter, search, sortBy]);

  const visibleCampaigns = filteredCampaigns.slice(0, displayCount);

  const getTopBarColor = (severity) => {
    const s = (severity || 'LOW').toUpperCase();
    if (s === 'CRITICAL') return 'bg-red-600';
    if (s === 'HIGH') return 'bg-orange-500';
    if (s === 'MEDIUM') return 'bg-amber-400';
    return 'bg-blue-500';
  };

  const getSeverityBadge = (severity) => {
    const s = (severity || 'LOW').toUpperCase();
    if (s === 'CRITICAL') return 'bg-red-100 text-red-800 border-red-200';
    if (s === 'HIGH') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (s === 'MEDIUM') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            Threat Syndicate Watch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Active Scam Campaigns
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Known coordinated job scam syndicates currently targeting job seekers across Malaysian and Southeast Asian employment portals.
          </p>
        </div>

        {/* WARNING BANNER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 text-white" />
            <p className="text-sm sm:text-base font-bold">
              ⚠ Stay Alert: {activeCount} active scam campaigns detected in our system
            </p>
          </div>
          <Link
            to="/report-scam"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl bg-white text-orange-700 hover:bg-orange-50 shadow-xs transition-colors whitespace-nowrap"
          >
            Report an Incident
          </Link>
        </div>

        {/* FILTER ROW */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns by title, keywords, or role"
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <div className="md:col-span-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
              >
                <option value="LATEST">Sort by: Latest Activity</option>
                <option value="VICTIMS">Sort by: Most Victims Reported</option>
                <option value="SEVERITY">Sort by: Threat Severity</option>
              </select>
            </div>

            {/* Active Only Switch */}
            <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-2.5">
              <span className="text-xs font-bold text-gray-700">Active Only</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
              </label>
            </div>
          </div>

          {/* Severity filter tabs */}
          <div className="flex items-center gap-2 border-t border-gray-100 pt-3 overflow-x-auto text-xs font-bold">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{sev === 'ALL' ? 'All Severities' : sev}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    severityFilter === sev ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {severityCounts[sev] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" message="Scanning threat intelligence feeds..." />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredCampaigns.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h3 className="text-lg font-black text-gray-900">No active campaigns found</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Our system hasn't detected any scam campaigns matching your current search or severity filter.
            </p>
          </div>
        )}

        {/* CAMPAIGNS GRID */}
        {!loading && filteredCampaigns.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCampaigns.map((camp) => (
                <div
                  key={camp.campaignId}
                  className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Top Color Bar */}
                    <div className={`h-2.5 w-full ${getTopBarColor(camp.severity)}`} />

                    <div className="p-6 space-y-4">
                      {/* Badges Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${getSeverityBadge(
                            camp.severity
                          )}`}
                        >
                          {camp.severity}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            ((camp.active !== undefined ? camp.active : camp.isActive) ?? true)
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {((camp.active !== undefined ? camp.active : camp.isActive) ?? true) ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-black text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {camp.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                          {camp.description}
                        </p>
                      </div>

                      {/* Stats Row */}
                      <div className="py-2.5 border-y border-gray-100 space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 text-red-600 font-bold">
                          <UsersIcon className="w-3.5 h-3.5" />
                          <span>{camp.victimCount ?? 0} victims reported</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>First: {formatDate(camp.firstSeen)}</span>
                          <span>Last: {formatDate(camp.lastSeen)}</span>
                        </div>
                      </div>

                      {/* Targeted Job Titles */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                          Targeted Job Titles
                        </span>
                        {(() => {
                          const titles = parseJobTitles(camp.targetedJobTitles);
                          return (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {titles.slice(0, 3).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold"
                                >
                                  {t}
                                </span>
                              ))}
                              {titles.length > 3 && (
                                <span className="text-xs text-gray-400 font-bold">
                                  +{titles.length - 3} more
                                </span>
                              )}
                              {titles.length === 0 && (
                                <span className="text-xs text-gray-400 italic">Various positions</span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Platform Origin */}
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>Originated from: <strong>{camp.platformOrigin || camp.platform || 'Unknown'}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Button */}
                  <div className="p-6 pt-0">
                    <Link
                      to={`/campaigns/${camp.campaignId}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200 hover:border-blue-200"
                    >
                      <span>View Full Campaign Intelligence</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* LOAD MORE BUTTON PAGINATION STYLE */}
            <div className="pt-6 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                Showing {Math.min(displayCount, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
              </span>
              {displayCount < filteredCampaigns.length && (
                <button
                  type="button"
                  onClick={() => setDisplayCount((prev) => prev + 9)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-colors"
                >
                  Load More Campaigns
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CampaignsPage;
