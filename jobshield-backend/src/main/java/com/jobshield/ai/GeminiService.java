package com.jobshield.ai;

import com.jobshield.ai.dto.AiAnalysisResult;

import com.jobshield.jobs.dto.AnalyzeJobRequest;

public interface GeminiService {

    AiAnalysisResult analyzeJob(String jobDescription);

    AiAnalysisResult analyzeJob(AnalyzeJobRequest request);

    AiAnalysisResult analyzeJob(String companyName, String jobTitle, String salary, String jobDescription);

}