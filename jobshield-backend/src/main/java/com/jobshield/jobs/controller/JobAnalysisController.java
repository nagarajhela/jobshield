package com.jobshield.jobs.controller;

import java.util.List;
import com.jobshield.jobs.dto.JobDetailsResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.jobshield.audit.AuditLogService;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.config.RateLimitService;
import com.jobshield.exception.RateLimitExceededException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.jobshield.campaign.dto.CampaignSummaryResponse;
import com.jobshield.jobs.dto.AnalyzeJobRequest;
import com.jobshield.jobs.dto.AnalyzeJobResponse;
import com.jobshield.jobs.dto.DashboardResponse;
import com.jobshield.jobs.dto.JobHistoryResponse;
import com.jobshield.jobs.service.JobAnalysisService;
import com.jobshield.pdf.PdfService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/jobs")
public class JobAnalysisController {
    private final JobAnalysisService jobAnalysisService;
    private final PdfService pdfService;
    private final RateLimitService rateLimitService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public JobAnalysisController(
            JobAnalysisService jobAnalysisService,
            PdfService pdfService,
            RateLimitService rateLimitService,
            AuditLogService auditLogService,
            UserRepository userRepository) {

        this.jobAnalysisService = jobAnalysisService;
        this.pdfService = pdfService;
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeJobResponse> analyzeJob(
            @Valid @RequestBody AnalyzeJobRequest request,
            HttpServletRequest httpRequest) {

        User currentUser = getCurrentUser();
        if (currentUser != null) {
            boolean allowed = rateLimitService.isAllowed("userId_" + currentUser.getUserId(), RateLimitService.ANALYSIS_LIMIT);
            if (!allowed) {
                throw new RateLimitExceededException("Analysis rate limit exceeded. Max 10 analyses per minute.");
            }
        }

        AnalyzeJobResponse response =
                jobAnalysisService.analyzeJob(request);

        if (currentUser != null) {
            auditLogService.logFromRequest(
                    currentUser.getUserId(),
                    "ANALYSIS_CREATED",
                    httpRequest,
                    "SUCCESS",
                    "Job analysis created for: " + request.getCompanyName() + " (" + response.getRiskLevel() + ")"
            );
        }

        return ResponseEntity.ok(response);
    }
    // Deprecated in favor of paginated GET /api/jobs/history in JobHistoryController
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

    @PostMapping("/analyze-url")
    public ResponseEntity<AnalyzeJobResponse> analyzeUrl(
            @Valid @RequestBody com.jobshield.jobs.dto.AnalyzeUrlRequest request) {

        AnalyzeJobResponse response =
                jobAnalysisService.analyzeUrl(request);

        return ResponseEntity.ok(response);
    }

    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                return userRepository.findByEmail(authentication.getName()).orElse(null);
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}