import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzeJobPage from './pages/AnalyzeJobPage';
import PdfScannerPage from './pages/PdfScannerPage';
import HistoryPage from './pages/HistoryPage';
import CampaignsPage from './pages/CampaignsPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

/**
 * Main Application Component
 * Sets up routing structure for public and protected JobShield pages.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzeJobPage />} />
          <Route path="/scan-pdf" element={<PdfScannerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}