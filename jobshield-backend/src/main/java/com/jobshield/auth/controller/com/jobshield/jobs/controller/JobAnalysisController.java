package com.jobshield.jobs.controller;

import java.util.List;
import com.jobshield.jobs.dto.JobDetailsResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import com.jobshield.campaign.dto.CampaignSummaryResponse;
import com.jobshield.jobs.dto.AnalyzeJobRequest;
import com.jobshield.jobs.dto.AnalyzeJobResponse;
import com.jobshield.jobs.dto.DashboardResponse;
import com.jobshield.jobs.dto.JobHistoryResponse;
import com.jobshield.jobs.service.JobAnalysisService;
import com.jobshield.pdf.PdfService;

@RestController
@RequestMapping("/api/jobs")
public class JobAnalysisController {
    private final JobAnalysisService jobAnalysisService;
    private final PdfService pdfService;

    public JobAnalysisController(
            JobAnalysisService jobAnalysisService,
            PdfService pdfService) {

        this.jobAnalysisService = jobAnalysisService;
        this.pdfService = pdfService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeJobResponse> analyzeJob(
            @Valid @RequestBody AnalyzeJobRequest request) {

        AnalyzeJobResponse response =
                jobAnalysisService.analyzeJob(request);

        return ResponseEntity.ok(response);
        
    }
    @GetMapping("/history")
    public ResponseEntity<List<JobHistoryResponse>> getHistory() {

        List<JobHistoryResponse> history =
                jobAnalysisService.getHistory();

        return ResponseEntity.ok(history);
    }
    @GetMapping("/{analysisId}")
    public ResponseEntity<JobDetailsResponse> getAnalysisById(
            @PathVariable Long analysisId) {

        JobDetailsResponse response =
                jobAnalysisService.getAnalysisById(analysisId);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {

        DashboardResponse response =
                jobAnalysisService.getDashboard();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignSummaryResponse>> getCampaigns() {

        return ResponseEntity.ok(
                jobAnalysisService.getCampaignSummary());
    }
    @PostMapping("/analyze-pdf")
    public ResponseEntity<AnalyzeJobResponse> analyzePdf(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("PDF file is required");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        AnalyzeJobResponse response =
                jobAnalysisService.analyzePdf(file);

        return ResponseEntity.ok(response);
    }
}