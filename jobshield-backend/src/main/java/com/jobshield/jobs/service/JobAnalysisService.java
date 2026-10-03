package com.jobshield.jobs.service;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.jobshield.jobs.dto.JobHistoryResponse;
import com.jobshield.campaign.dto.CampaignSummaryResponse;
import com.jobshield.jobs.dto.AnalyzeJobRequest;
import com.jobshield.jobs.dto.AnalyzeJobResponse;
import com.jobshield.jobs.dto.JobDetailsResponse;
import com.jobshield.jobs.dto.DashboardResponse;

public interface JobAnalysisService {

    AnalyzeJobResponse analyzeJob(AnalyzeJobRequest request);
    List<JobHistoryResponse> getHistory();
    DashboardResponse getDashboard();

    JobDetailsResponse getAnalysisById(Long analysisId);
    List<CampaignSummaryResponse> getCampaignSummary();
    AnalyzeJobResponse analyzePdf(MultipartFile file);
    AnalyzeJobResponse analyzeUrl(com.jobshield.jobs.dto.AnalyzeUrlRequest request);

}