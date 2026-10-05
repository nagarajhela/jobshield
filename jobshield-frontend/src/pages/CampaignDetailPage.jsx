import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  CalendarDaysIcon,
  DevicePhoneMobileIcon,
  ShareIcon,
  FlagIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import campaignService from '../services/campaignService';

const parseJobTitles = (titles) => {
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

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Campaign Intelligence | JobShield';
  }, []);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campaignService.getCampaignById(id);
      setCampaign(data);
    } catch (err) {
      toast.error('Failed to load campaign intelligence record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  // Fallback demo details if backend item not seeded yet
  const details = useMemo(() => {
    if (campaign) return campaign;
    return {
      campaignId: id || 1,
      campaignCode: `CAMP-2026-00${id || 1}`,
      title: 'Telegram High-Pay Typist Advance Fee Syndicate',
      description:
        'Coordinated syndicate targeting Malaysian candidates with deceptive promises of RM 80–150/hr for remote data conversion and copy-typing. Recruiter claims applicants must purchase an enterprise activation license or training accreditation prior to receiving first wage disbursement.',
      severity: 'CRITICAL',
      isActive: true,
      victimCount: 64,
      firstSeen: '2026-08-12T10:00:00Z',
      lastSeen: '2026-09-22T08:30:00Z',
      platform: 'Telegram & WhatsApp',
      scamPattern: 'ADVANCE_FEE',
      targetedJobTitles: [
        'Data Entry Typist',
        'Online Document Specialist',
        'Remote Copy Typist',
        'Transcription Assistant',
        'Word Processing Clerk',
      ],
      relatedAnalyses: [
        { id: 101, companyName: 'Apex Data Services', score: 95 },
        { id: 102, companyName: 'Global Transcribe Sdn Bhd', score: 92 },
        { id: 103, companyName: 'Prime Text Cloud', score: 88 },
      ],
    };
  }, [campaign, id]);

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

  const daysActive = useMemo(() => {
    if (!details.firstSeen) return 42;
    try {
      const days = differenceInDays(new Date(), new Date(details.firstSeen));
      return Math.max(1, days);
    } catch (e) {
      return 30;
    }
  }, [details.firstSeen]);

  // Social Sharing
  const shareUrl = window.location.href;
  const shareText = `⚠ Warning: ${details.title} scam is targeting job seekers. Check JobShield for details: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Campaign link copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const getSeverityBannerColor = (sev) => {
    const s = (sev || 'LOW').toUpperCase();
    if (s === 'CRITICAL') return 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white';
    if (s === 'HIGH') return 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 text-white';
    if (s === 'MEDIUM') return 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-white';
    return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link to="/campaigns" className="hover:text-blue-600">
            Campaigns
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-sm">{details.title}</span>
        </nav>

        {/* HEADER SECTION WITH SEVERITY BANNER */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-md ${getSeverityBannerColor(details.severity)} space-y-3`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-black/20 text-white">
              #{details.campaignCode}
            </span>
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-white/20 text-white">
              {details.isActive ? 'Active Syndicate' : 'Inactive'}
            </span>
            <span className="text-xs opacity-90">
              Updated {formatDate(details.lastSeen)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
            {details.title}
          </h1>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT MAIN (65% -> 8 cols out of 12) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-5">
              <h2 className="text-lg font-black text-gray-900">Campaign Overview</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {details.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-medium block">Platform Origin</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{details.platform}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">First / Last Seen</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">
                    {formatDate(details.firstSeen)} — {formatDate(details.lastSeen)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Victims Impacted</span>
                  <span className="font-bold text-red-600 mt-0.5 block flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                    {details.victimCount} reported
                  </span>
                </div>
              </div>
            </div>

            {/* Targeted Job Titles Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
              <h2 className="text-lg font-black text-gray-900">Common Job Titles Used</h2>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
                ⚠ Be extra careful if you see jobs with these titles advertised on social apps:
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {parseJobTitles(details.targetedJobTitles).map((title, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs sm:text-sm font-bold border border-blue-200"
                  >
                    {title}
                  </span>
                ))}
                {parseJobTitles(details.targetedJobTitles).length === 0 && (
                  <span className="text-xs text-gray-400 italic">Various positions</span>
                )}
              </div>
            </div>

            {/* How This Scam Works Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-blue-600" />
                How This Scam Works
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-900">1. Unsolicited Contact or Portal Lure:</span>
                  <p className="text-gray-600">
                    Recruiter reaches out via WhatsApp/Telegram or posts attractive work-from-home vacancies with unusually high hourly wages.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-900">2. Instant Acceptance & Fake Assessment:</span>
                  <p className="text-gray-600">
                    No formal interview or background verification is performed. The applicant is granted employment within minutes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-900">3. Upfront Fee / Information Demands:</span>
                  <p className="text-gray-600">
                    Candidate is instructed to transfer a processing deposit or register an account with sensitive ID proof before receiving contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Analyses Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900">Recent Scam Reports in this Cluster</h2>
                <Link to="/history" className="text-xs font-bold text-blue-600 hover:underline">
                  View All Related Reports →
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {(details.relatedAnalyses || []).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-gray-900">{item.companyName}</span>
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      Threat Score {item.score}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (35% -> 4 cols out of 12) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Syndicate Statistics
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Reported Victims</span>
                  <p className="text-3xl font-black text-red-600">{details.victimCount}</p>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium">Days Active</span>
                  <p className="text-2xl font-black text-gray-900">{daysActive} days</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Severity Level</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-red-100 text-red-800">
                    {details.severity}
                  </span>
                </div>
              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                How to Protect Yourself
              </h3>

              <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Never transfer money or buy equipment before your first paycheck.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Verify employer email domains match their official website.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Conduct interviews through legitimate company video channels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Withhold bank and passport records until formal onboarding.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Scan every suspicious posting using JobShield AI.</span>
                </li>
              </ul>
            </div>

            {/* Report This Scam Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-200 shadow-2xs space-y-3">
              <h3 className="text-base font-black text-red-900">Encountered This Scam?</h3>
              <p className="text-xs text-red-700 leading-relaxed">
                Help law enforcement and candidate communities by submitting screenshots, recruiter phone numbers, and messages.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate('/report-scam', {
                    state: {
                      campaignId: details.campaignId,
                      companyName: details.title,
                      description: `Referencing Campaign #${details.campaignCode}`,
                    },
                  })
                }
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FlagIcon className="w-4 h-4" />
                Submit a Scam Report
              </button>
            </div>

            {/* Share Campaign Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-gray-900">Warn Others About This Scam</h3>
              <p className="text-xs text-gray-500">
                Share this intelligence report to prevent friends and fresh graduates from being defrauded.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShareIcon className="w-3.5 h-3.5" />
                  Copy Report Link
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                  >
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignDetailPage;
