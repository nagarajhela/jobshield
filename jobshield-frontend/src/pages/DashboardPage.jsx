import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import StatsCard from '../components/dashboard/StatsCard';
import SafetyScoreCircle from '../components/dashboard/SafetyScoreCircle';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  BookmarkIcon,
  FlagIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const patternMeta = {
  ADVANCE_FEE: {
    icon: '💰',
    label: 'Advance Fee Scam',
    description: 'Requires candidates to pay upfront fees for equipment, software, or background verification.',
  },
  PHISHING: {
    icon: '🎣',
    label: 'Phishing Attempt',
    description: 'Attempts to harvest credentials or financial account information via spoofed forms or emails.',
  },
  FAKE_RECRUITER: {
    icon: '🎭',
    label: 'Fake Recruiter',
    description: 'Impersonates authentic companies or HR leaders to orchestrate fraud without affiliation.',
  },
  MLM_PYRAMID: {
    icon: '🔺',
    label: 'MLM / Pyramid Scheme',
    description: 'Focuses on recruitment commissions and product inventory purchases rather than genuine employment.',
  },
  DATA_HARVESTING: {
    icon: '📋',
    label: 'Data Harvesting',
    description: 'Mass gathers sensitive personal documents, social security numbers, and IDs for resale.',
  },
  UNPAID_TRIAL: {
    icon: '⏰',
    label: 'Unpaid Trial Scam',
    description: 'Exploits candidates for free labor or commercial production under the guise of an assessment.',
  },
  IDENTITY_THEFT: {
    icon: '🪪',
    label: 'Identity Theft',
    description: 'Steals banking details and government identity documents to open fraudulent credit lines.',
  },
  NONE: {
    icon: '✅',
    label: 'No Pattern Detected',
    description: 'No known fraudulent syndicate or scam patterns detected in your recent scans.',
  },
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard | JobShield';
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Recharts data
  const chartData = [
    { name: 'LOW', count: stats?.lowRiskCount ?? 0, fill: '#22C55E' },
    { name: 'MEDIUM', count: stats?.mediumRiskCount ?? 0, fill: '#EAB308' },
    { name: 'HIGH', count: stats?.highRiskCount ?? 0, fill: '#EF4444' },
  ];

  const hasChartData = (stats?.totalAnalyses ?? 0) > 0;

  // Tip text based on safety score
  const getSafetyTip = (score = 100) => {
    if (score <= 40) {
      return 'You have analyzed many risky jobs. Be very careful with your applications.';
    }
    if (score <= 70) {
      return 'Some risky jobs detected. Always verify before applying.';
    }
    return 'You are mostly applying to safe jobs. Keep it up!';
  };

  const patternInfo = patternMeta[stats?.mostCommonScamPattern] || patternMeta.NONE;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* SECTION 1 - Welcome Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Welcome back, {currentUser?.firstName || 'Analyst'}! 👋
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Here is your job safety overview and application health.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl shadow-xs border border-gray-200 text-xs font-semibold text-gray-600 self-start sm:self-auto">
            <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
            <span>{currentDate}</span>
          </div>
        </section>

        {/* SECTION 2 - Stats Cards Row (4 cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Total Analyses"
            value={stats?.totalAnalyses ?? 0}
            icon={ChartBarIcon}
            colorScheme="blue"
            subtext={`${stats?.analysesThisMonth ?? 0} this month`}
            loading={loading}
          />

          <StatsCard
            title="High Risk Jobs"
            value={stats?.highRiskCount ?? 0}
            icon={ShieldExclamationIcon}
            colorScheme="red"
            subtext="Be very careful"
            loading={loading}
          />

          <StatsCard
            title="Medium Risk Jobs"
            value={stats?.mediumRiskCount ?? 0}
            icon={ExclamationTriangleIcon}
            colorScheme="yellow"
            subtext="Proceed with caution"
            loading={loading}
          />

          <StatsCard
            title="Safe Jobs"
            value={stats?.lowRiskCount ?? 0}
            icon={ShieldCheckIcon}
            colorScheme="green"
            subtext="Looks legitimate"
            loading={loading}
          />
        </section>

        {/* SECTION 3 - Two Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* LEFT COLUMN (60% width = 7/12 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Risk Distribution</h3>
                <p className="text-xs text-gray-500">Breakdown of analyzed jobs by scam risk tier.</p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center animate-pulse">
                <div className="w-full h-48 bg-gray-100 rounded-xl" />
              </div>
            ) : !hasChartData ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                <ChartBarIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-700">No scan telemetry yet</p>
                <p className="text-xs text-gray-400 mt-1">Analyze job descriptions or offer letters to populate charts.</p>
              </div>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                              <span className="font-bold">{data.name}:</span> {data.count} scans
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (40% width = 5/12 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Safety Score Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="w-full text-left mb-2">
                <h3 className="text-base font-bold text-gray-900">Your Safety Score</h3>
                <p className="text-xs text-gray-500">Calculated composite index of overall application safety.</p>
              </div>

              <div className="my-2">
                <SafetyScoreCircle score={stats?.safetyScore ?? 100} loading={loading} />
              </div>

              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2 text-center w-full leading-relaxed">
                {getSafetyTip(stats?.safetyScore ?? 100)}
              </p>
            </div>

            {/* Most Common Scam Pattern Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">Most Common Scam Pattern</h3>
                <span className="text-2xl">{patternInfo.icon}</span>
              </div>

              <h4 className="text-sm font-black text-gray-900">{patternInfo.label}</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {patternInfo.description}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <Link
                  to="/campaigns"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Learn More <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - Recent Analyses Table */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Analyses</h3>
                <p className="text-xs text-gray-500">Your 5 most recent job scam evaluations.</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-full space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : !stats?.recentAnalyses || stats.recentAnalyses.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={MagnifyingGlassIcon}
                  title="No analyses yet"
                  message="Start by analyzing a job posting or offer letter to detect red flags and fraud."
                  actionLabel="Analyze Your First Job"
                  onAction={() => navigate('/analyze')}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Company Name</th>
                      <th className="px-6 py-3">Job Title</th>
                      <th className="px-6 py-3">Risk Level</th>
                      <th className="px-6 py-3">Risk Score</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {stats.recentAnalyses.slice(0, 5).map((analysis) => {
                      const scoreColor =
                        analysis.riskScore >= 70
                          ? 'text-red-600 font-bold'
                          : analysis.riskScore >= 40
                          ? 'text-amber-600 font-semibold'
                          : 'text-emerald-600 font-semibold';

                      return (
                        <tr
                          key={analysis.analysisId}
                          onClick={() => navigate(`/history`)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {analysis.createdAt
                              ? new Date(analysis.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recent'}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            {analysis.companyName}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {analysis.jobTitle}
                          </td>
                          <td className="px-6 py-4">
                            <RiskBadge level={analysis.riskLevel} size="sm" />
                          </td>
                          <td className={`px-6 py-4 text-sm ${scoreColor}`}>
                            {analysis.riskScore}/100
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/history`);
                              }}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5 - Quick Action Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/analyze"
            className="p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <p className="text-xs uppercase font-bold text-blue-200">Action</p>
              <h4 className="text-base font-bold mt-0.5">Analyze a Job</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/history"
            className="p-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <p className="text-xs uppercase font-bold text-purple-200">Review</p>
              <h4 className="text-base font-bold mt-0.5">View History</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClockIcon className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/saved"
            className="p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <p className="text-xs uppercase font-bold text-emerald-200">Library</p>
              <h4 className="text-base font-bold mt-0.5">Saved Jobs</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookmarkIcon className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/report-scam"
            className="p-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <p className="text-xs uppercase font-bold text-red-200">Community</p>
              <h4 className="text-base font-bold mt-0.5">Report a Scam</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FlagIcon className="w-5 h-5" />
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
