package com.jobshield.ai;

import com.jobshield.ai.dto.AiAnalysisResult;

public interface GeminiService {

    AiAnalysisResult analyzeJob(String jobDescription);

}