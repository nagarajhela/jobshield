import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import AnalysisDetailModal from '../components/history/AnalysisDetailModal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Analysis #${id} | JobShield`;
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to History
        </Link>

        <AnalysisDetailModal
          analysisId={id}
          isOpen={true}
          onClose={() => navigate('/history')}
          onDelete={() => navigate('/history')}
        />
      </div>
    </div>
  );
};

export default HistoryDetailPage;
