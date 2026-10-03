import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  FlagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/layout/Navbar';
import reportService from '../services/reportService';

const schema = yup.object().shape({
  companyName: yup.string().required('Company name is required').min(2, 'At least 2 characters').max(255),
  jobTitle: yup.string().required('Job title is required').min(2, 'At least 2 characters').max(255),
  platform: yup.string().required('Platform is required'),
  jobUrl: yup.string().url('Must be a valid URL format').nullable().notRequired(),
  description: yup
    .string()
    .required('Description is required')
    .min(50, 'Please write at least 50 characters of detail')
    .max(2000, 'Max 2000 characters'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the truthfulness terms'),
});

const evidenceOptions = [
  'Asked for upfront payment',
  'Requested personal ID/passport',
  'Promised unrealistic salary',
  'No interview, immediate job offer',
  'Contact via WhatsApp/Telegram only',
  'Company not found online',
  'Poor grammar and spelling',
  'Pressure to decide quickly',
];

const ReportScamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read any pre-filled state passed from AnalyzePage or CampaignDetailPage
  const prefill = location.state || {};

  const [formData, setFormData] = useState({
    companyName: prefill.companyName || '',
    jobTitle: prefill.jobTitle || '',
    platform: prefill.platform || 'LinkedIn',
    jobUrl: prefill.jobUrl || '',
    description: prefill.description || '',
    evidence: [],
    isAnonymous: false,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  useEffect(() => {
    document.title = 'Report a Scam Job | JobShield';
  }, []);

  const handleEvidenceToggle = (item) => {
    setFormData((prev) => {
      const exists = prev.evidence.includes(item);
      const next = exists ? prev.evidence.filter((e) => e !== item) : [...prev.evidence, item];
      return { ...prev, evidence: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await schema.validate(formData, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const errorMap = {};
        err.inner.forEach((validationError) => {
          errorMap[validationError.path] = validationError.message;
        });
        setErrors(errorMap);
        toast.error('Please fix the errors before submitting.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        platform: formData.platform,
        jobUrl: formData.jobUrl?.trim() || null,
        description: formData.description.trim(),
        evidence: formData.evidence,
        isAnonymous: formData.isAnonymous,
      };

      const res = await reportService.submitReport(payload);
      const refId = res?.reportId || Math.floor(100000 + Math.random() * 900000);
      setSubmissionSuccess(refId);
      toast.success('Report submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report. Please try again.';
      setErrors({ global: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionSuccess(null);
    setFormData({
      companyName: '',
      jobTitle: '',
      platform: 'LinkedIn',
      jobUrl: '',
      description: '',
      evidence: [],
      isAnonymous: false,
      termsAccepted: false,
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-3"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Report a Scam Job
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Help protect other job seekers by reporting suspicious postings, predatory fee demands, and fake employers.
          </p>
        </div>

        {/* HOW IT WORKS STEPS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-1">
              1
            </span>
            <span className="font-bold text-gray-800 block">Fill in the details</span>
            <p className="text-gray-500 mt-0.5">Tell us what occurred during your interaction.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-1">
              2
            </span>
            <span className="font-bold text-gray-800 block">Our team reviews</span>
            <p className="text-gray-500 mt-0.5">Our analysts verify the domain, scripts, and phone numbers.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-1">
              3
            </span>
            <span className="font-bold text-gray-800 block">Help the community</span>
            <p className="text-gray-500 mt-0.5">Verified reports protect thousands of future candidates.</p>
          </div>
        </div>

        {/* SUCCESS STATE */}
        {submissionSuccess ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircleIcon className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900">Report Submitted!</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto leading-relaxed">
                Thank you for helping protect the community. Our team will review your report within 24-48 hours.
              </p>
            </div>

            <div className="inline-block px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-800">
              Reference Number: #RPT-{submissionSuccess}
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Submit Another Report
              </button>
              <Link
                to="/community-reports"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
              >
                View All Reports
              </Link>
            </div>
          </div>
        ) : (
          /* REPORT FORM */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs">
            {errors.global && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errors.global}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Global Logistics"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {errors.companyName && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.companyName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Remote Data Entry Specialist"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {errors.jobTitle && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.jobTitle}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Platform Advertised <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="JobStreet">JobStreet</option>
                    <option value="Telegram">Telegram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Job Posting URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {errors.jobUrl && (
                    <span className="text-xs text-red-600 mt-1 block">{errors.jobUrl}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Incident Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400 font-mono">
                    {formData.description.length} / 2000
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe why this job is suspicious. What red flags did you notice? What happened when you applied? Did they ask for money or personal info?"
                  className="w-full p-3.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
                {errors.description && (
                  <span className="text-xs text-red-600 mt-1 block">{errors.description}</span>
                )}
              </div>

              {/* Evidence Section */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Additional Evidence (Optional)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">Help us verify your report faster</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {evidenceOptions.map((opt) => {
                    const isChecked = formData.evidence.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEvidenceToggle(opt)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Anonymous Report Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-sm font-bold text-gray-800 block">Submit anonymously</span>
                  <p className="text-xs text-gray-500">
                    Your username will not be publicly displayed. Your identity is protected.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                  />
                  <span>
                    I confirm this report is truthful and I am not submitting false or defamatory information.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <span className="text-xs text-red-600 mt-1 block">{errors.termsAccepted}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.termsAccepted}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting report...</span>
                ) : (
                  <>
                    <FlagIcon className="w-5 h-5" />
                    <span>Submit Scam Report</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportScamPage;
