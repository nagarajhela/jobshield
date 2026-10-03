import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  BookmarkIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/layout/Navbar';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AnalysisDetailModal from '../components/history/AnalysisDetailModal';
import analysisService from '../services/analysisService';

const SavedJobsPage = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [jobToUnsave, setJobToUnsave] = useState(null);

  // Note editing state: { [analysisId]: { isEditing: boolean, text: string } }
  const [notesState, setNotesState] = useState({});

  useEffect(() => {
    document.title = 'Saved Jobs | JobShield';
  }, []);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analysisService.getSavedJobs();
      const list = Array.isArray(data) ? data : [];
      setSavedJobs(list);

      // Initialize notes from localStorage or item
      const initialNotes = {};
      list.forEach((job) => {
        const stored = localStorage.getItem(`jobshield_note_${job.analysisId}`);
        initialNotes[job.analysisId] = {
          isEditing: false,
          text: stored !== null ? stored : (job.notes || ''),
        };
      });
      setNotesState(initialNotes);
    } catch (err) {
      toast.error('Failed to load saved jobs');
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleUnsaveConfirm = async () => {
    if (!jobToUnsave) return;
    try {
      await analysisService.unsaveJob(jobToUnsave.analysisId);
      toast.success('Job removed from saved list');
      setJobToUnsave(null);
      fetchSavedJobs();
    } catch (err) {
      toast.error('Failed to unsave job');
    }
  };

  const handleStartEditNote = (analysisId) => {
    setNotesState((prev) => ({
      ...prev,
      [analysisId]: {
        ...prev[analysisId],
        isEditing: true,
      },
    }));
  };

  const handleCancelEditNote = (analysisId) => {
    const original = localStorage.getItem(`jobshield_note_${analysisId}`) || '';
    setNotesState((prev) => ({
      ...prev,
      [analysisId]: {
        isEditing: false,
        text: original,
      },
    }));
  };

  const handleNoteTextChange = (analysisId, text) => {
    setNotesState((prev) => ({
      ...prev,
      [analysisId]: {
        ...prev[analysisId],
        text,
      },
    }));
  };

  const handleSaveNote = (analysisId) => {
    const currentText = notesState[analysisId]?.text || '';
    try {
      localStorage.setItem(`jobshield_note_${analysisId}`, currentText);
      toast.success('Note saved');
      setNotesState((prev) => ({
        ...prev,
        [analysisId]: {
          ...prev[analysisId],
          isEditing: false,
        },
      }));
    } catch (err) {
      toast.error('Failed to store note');
    }
  };

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

  const getRiskScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s <= 30) return 'text-emerald-600 font-semibold';
    if (s <= 60) return 'text-amber-600 font-semibold';
    if (s <= 80) return 'text-orange-600 font-bold';
    return 'text-red-600 font-black';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Saved Jobs
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Jobs you bookmarked for later review and ongoing safety monitoring.
            </p>
          </div>

          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition-all self-start sm:self-center"
          >
            <span>←</span> Back to History
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" message="Loading your bookmarked jobs..." />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && savedJobs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
            <EmptyState
              icon={BookmarkIcon}
              title="No saved jobs"
              message="Save jobs from your analysis history to review them later and keep private notes."
              actionLabel="View Analysis History"
              onAction={() => navigate('/history')}
            />
          </div>
        )}

        {/* SAVED JOBS GRID (2 columns desktop, 1 column mobile) */}
        {!loading && savedJobs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedJobs.map((job) => {
              const currentNoteState = notesState[job.analysisId] || {
                isEditing: false,
                text: '',
              };

              return (
                <div
                  key={job.analysisId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Top Row: Company & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                          {job.companyName || 'Unknown Company'}
                        </h2>
                        <p className="text-sm font-medium text-gray-600 mt-0.5 flex items-center gap-1.5">
                          <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                          {job.jobTitle || 'Job Title Not Specified'}
                        </p>
                      </div>
                      <RiskBadge level={job.riskLevel} />
                    </div>

                    {/* Stats & Metadata Row */}
                    <div className="flex items-center justify-between py-2 border-y border-gray-100 text-xs text-gray-500">
                      <div>
                        <span>Threat Score: </span>
                        <span className={`text-sm ${getRiskScoreColor(job.riskScore)}`}>
                          {job.riskScore}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span>Saved: {formatDate(job.createdAt)}</span>
                      </div>
                    </div>

                    {/* NOTES SECTION */}
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          My Private Notes
                        </span>
                        {!currentNoteState.isEditing && (
                          <button
                            type="button"
                            onClick={() => handleStartEditNote(job.analysisId)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                            {currentNoteState.text ? 'Edit Note' : 'Add Note'}
                          </button>
                        )}
                      </div>

                      {currentNoteState.isEditing ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={currentNoteState.text}
                            onChange={(e) =>
                              handleNoteTextChange(job.analysisId, e.target.value)
                            }
                            placeholder="Add your thoughts, application status, or recruiter contact details..."
                            rows={3}
                            className="w-full text-xs sm:text-sm p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleCancelEditNote(job.analysisId)}
                              className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNote(job.analysisId)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                            >
                              <CheckIcon className="w-3.5 h-3.5" />
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                          {currentNoteState.text ? (
                            `"${currentNoteState.text}"`
                          ) : (
                            <span className="text-gray-400 not-italic">
                              No notes added yet. Click Add Note to record follow-ups.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CARD FOOTER BUTTONS */}
                  <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedAnalysisId(job.analysisId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Full Analysis
                    </button>

                    <button
                      type="button"
                      onClick={() => setJobToUnsave(job)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove bookmark"
                    >
                      <BookmarkSolidIcon className="w-4 h-4 text-red-500" />
                      Unsave
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Analysis Details Modal */}
      <AnalysisDetailModal
        analysisId={selectedAnalysisId}
        isOpen={!!selectedAnalysisId}
        onClose={() => setSelectedAnalysisId(null)}
        onDelete={() => {
          setSelectedAnalysisId(null);
          fetchSavedJobs();
        }}
      />

      {/* Confirm Unsave Dialog */}
      <ConfirmDialog
        isOpen={!!jobToUnsave}
        title="Remove Saved Job"
        message={`Are you sure you want to remove "${jobToUnsave?.companyName || 'this job'}" from your bookmarks?`}
        confirmText="Remove"
        variant="warning"
        onConfirm={handleUnsaveConfirm}
        onCancel={() => setJobToUnsave(null)}
      />
    </div>
  );
};

export default SavedJobsPage;
