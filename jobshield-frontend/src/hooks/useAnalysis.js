import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import analysisService from '../services/analysisService';

/**
 * @typedef {Object} JobAnalysisPayload
 * @property {string} companyName - Target company name
 * @property {string} jobTitle - Stated job designation
 * @property {string} [salary] - Advertised salary/remuneration
 * @property {string} jobDescription - Full text of the posting or message
 */

/**
 * @typedef {Object} AnalysisResponse
 * @property {number} [analysisId] - Generated record ID
 * @property {string} riskLevel - HIGH, MEDIUM, or LOW
 * @property {number} riskScore - Threat score between 0 and 100
 * @property {string} [employerStatus] - LIKELY_REAL, SUSPICIOUS, or LIKELY_FAKE
 * @property {number} [confidenceScore] - AI confidence metric
 * @property {string} [scamPattern] - Identified category of scam
 * @property {string} [reason] - Comprehensive AI justification
 * @property {string[]} [redFlags] - Extracted list of fraud warning signals
 * @property {string[]} [recommendedActions] - Action items for candidate safety
 */

/**
 * Custom hook to execute and manage AI job scam evaluation workflows.
 * Handles loading indicators, error extraction, and toast notifications.
 *
 * @returns {{
 *   isAnalyzing: boolean,
 *   result: AnalysisResponse|null,
 *   error: string|null,
 *   analyzeJob: (data: JobAnalysisPayload) => Promise<AnalysisResponse|null>,
 *   analyzeUrl: (url: string) => Promise<AnalysisResponse|null>,
 *   clearResult: () => void
 * }} Analysis operations and reactive status
 *
 * @example
 * const { isAnalyzing, result, analyzeJob, clearResult } = useAnalysis();
 * // Trigger an analysis:
 * await analyzeJob({
 *   companyName: 'Apex Data Services',
 *   jobTitle: 'Data Entry Typist',
 *   jobDescription: 'Earn RM 150/hr converting images to docx. Pay RM 250 fee first.'
 * });
 * console.log('AI Threat Risk Result:', result?.riskScore);
 */
export const useAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const analyzeJob = useCallback(async (data) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await analysisService.analyzeJob(data);
      setResult(response);
      toast.success('Job analysis completed successfully!');
      return response;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to complete job evaluation. Please try again.';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeUrl = useCallback(async (url) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await analysisService.analyzeUrl(url);
      setResult(response);
      toast.success('URL scanned and analyzed successfully!');
      return response;
    } catch (err) {
      let message = 'Unable to scan destination URL. Please copy and paste the text manually.';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        message = 'Request timed out while accessing portal. Please try again or use manual input.';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    result,
    error,
    analyzeJob,
    analyzeUrl,
    clearResult,
  };
};

export default useAnalysis;
