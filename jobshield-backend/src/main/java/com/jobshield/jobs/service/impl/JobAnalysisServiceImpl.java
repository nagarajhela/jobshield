package com.jobshield.jobs.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.jobshield.ai.GeminiService;
import com.jobshield.ai.dto.AiAnalysisResult;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.campaign.dto.CampaignSummaryResponse;
import com.jobshield.campaign.entity.ScamCampaign;
import com.jobshield.campaign.repository.ScamCampaignRepository;
import com.jobshield.exception.ResourceNotFoundException;
import com.jobshield.jobs.UrlAnalyzerService;
import com.jobshield.jobs.dto.AnalyzeJobRequest;
import com.jobshield.jobs.dto.AnalyzeJobResponse;
import com.jobshield.jobs.dto.AnalyzeUrlRequest;
import com.jobshield.jobs.dto.DashboardResponse;
import com.jobshield.jobs.dto.ExtractedJobDTO;
import com.jobshield.jobs.dto.JobDetailsResponse;
import com.jobshield.jobs.dto.JobHistoryResponse;
import com.jobshield.jobs.entity.JobAnalysis;
import com.jobshield.jobs.repository.JobAnalysisRepository;
import com.jobshield.jobs.service.JobAnalysisService;
import com.jobshield.jobs.util.ScamPatternGenerator.ScamPatternGenerator;
import com.jobshield.jobs.util.ScamSimilarityEngine.ScamSimilarityEngine;
import com.jobshield.notification.Notification;
import com.jobshield.notification.NotificationRepository;
import com.jobshield.pdf.PdfService;

@Service
public class JobAnalysisServiceImpl implements JobAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(JobAnalysisServiceImpl.class);

    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final JobAnalysisRepository jobAnalysisRepository;
    private final ScamPatternGenerator scamPatternGenerator;
    private final ScamSimilarityEngine similarityEngine;
    private final ScamCampaignRepository scamCampaignRepository;
    private final PdfService pdfService;
    private final NotificationRepository notificationRepository;
    private final UrlAnalyzerService urlAnalyzerService;

    public JobAnalysisServiceImpl(
            JobAnalysisRepository jobAnalysisRepository,
            UserRepository userRepository,
            GeminiService geminiService,
            ScamPatternGenerator scamPatternGenerator,
            ScamSimilarityEngine similarityEngine,
            ScamCampaignRepository scamCampaignRepository,
            PdfService pdfService,
            NotificationRepository notificationRepository,
            UrlAnalyzerService urlAnalyzerService) {

        this.jobAnalysisRepository = jobAnalysisRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.scamPatternGenerator = scamPatternGenerator;
        this.similarityEngine = similarityEngine;
        this.scamCampaignRepository = scamCampaignRepository;
        this.pdfService = pdfService;
        this.notificationRepository = notificationRepository;
        this.urlAnalyzerService = urlAnalyzerService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobHistoryResponse> getHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<JobAnalysis> analyses = jobAnalysisRepository.findByUser(user);

        return analyses.stream()
                .map(job -> new JobHistoryResponse(
                        job.getAnalysisId(),
                        job.getCompanyName(),
                        job.getJobTitle(),
                        job.getRiskScore(),
                        job.getRiskLevel(),
                        job.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetailsResponse getAnalysisById(Long analysisId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        JobAnalysis analysis = jobAnalysisRepository
                .findByAnalysisIdAndUser(analysisId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));

        return new JobDetailsResponse(
                analysis.getAnalysisId(),
                analysis.getCompanyName(),
                analysis.getJobTitle(),
                analysis.getSalary(),
                analysis.getJobDescription(),
                analysis.getRiskScore(),
                analysis.getRiskLevel(),
                analysis.getAiReason(),
                analysis.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long total = jobAnalysisRepository.countByUser(user);
        long high = jobAnalysisRepository.countByUserAndRiskLevel(user, "HIGH");
        long medium = jobAnalysisRepository.countByUserAndRiskLevel(user, "MEDIUM");
        long low = jobAnalysisRepository.countByUserAndRiskLevel(user, "LOW");

        return new DashboardResponse(total, high, medium, low);
    }

    @Override
    @Transactional
    public AnalyzeJobResponse analyzeJob(AnalyzeJobRequest request) {
        return analyzeJobInternal(request, "MANUAL", null);
    }

    @Override
    @Transactional
    public AnalyzeJobResponse analyzeUrl(AnalyzeUrlRequest request) {
        logger.info("Executing analyzeUrl for URL: {}", request.getUrl());
        ExtractedJobDTO extracted = urlAnalyzerService.extractJobFromUrl(request.getUrl());

        AnalyzeJobRequest jobRequest = new AnalyzeJobRequest();
        jobRequest.setCompanyName(extracted.getCompanyName());
        jobRequest.setJobTitle(extracted.getJobTitle());
        jobRequest.setSalary("Not specified");
        jobRequest.setJobDescription(extracted.getDescription());

        return analyzeJobInternal(jobRequest, "URL_SCAN", extracted.getSourceUrl());
    }

    private AnalyzeJobResponse analyzeJobInternal(AnalyzeJobRequest request, String sourceType, String sourceUrl) {
        logger.info("Running AI scam analysis for company: '{}', title: '{}'", request.getCompanyName(), request.getJobTitle());

        // 1. Call Gemini AI with complete request details
        AiAnalysisResult aiResult = geminiService.analyzeJob(request);

        int riskScore = aiResult.getRiskScore();
        String riskLevel = aiResult.getRiskLevel();
        String reason = aiResult.getReason();

        // 2. Scam pattern resolution
        String scamPattern = (aiResult.getScamPattern() != null && !aiResult.getScamPattern().isBlank() && !"NONE".equalsIgnoreCase(aiResult.getScamPattern()))
                ? aiResult.getScamPattern()
                : scamPatternGenerator.generate(request.getJobDescription());

        // 3. Campaign similarity check
        List<JobAnalysis> previousAnalyses = jobAnalysisRepository.findAll();
        int matchedScams = 0;
        double highestSimilarity = 0;
        List<String> similarCompanies = new ArrayList<>();

        for (JobAnalysis analysis : previousAnalyses) {
            if (analysis.getScamPattern() == null) {
                continue;
            }

            double score = similarityEngine.calculateSimilarity(scamPattern, analysis.getScamPattern());

            if (score >= 60) {
                matchedScams++;
                if (!similarCompanies.contains(analysis.getCompanyName())) {
                    similarCompanies.add(analysis.getCompanyName());
                }
                if (score > highestSimilarity) {
                    highestSimilarity = score;
                }
            }
        }

        ScamCampaign campaign = null;
        if (highestSimilarity >= 80) {
            for (JobAnalysis previous : previousAnalyses) {
                if (previous.getScamPattern() == null) {
                    continue;
                }
                double score = similarityEngine.calculateSimilarity(scamPattern, previous.getScamPattern());
                if (score >= 80 && previous.getCampaign() != null) {
                    campaign = previous.getCampaign();
                    break;
                }
            }
        }

        if (campaign == null) {
            campaign = new ScamCampaign();
            campaign.setCampaignCode("CMP-" + System.currentTimeMillis());
            campaign.setCreatedAt(LocalDateTime.now());
            scamCampaignRepository.save(campaign);
        }

        // 4. Resolve authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : "anonymous";
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // 5. Create & populate JobAnalysis entity with all richer fields
        JobAnalysis analysis = new JobAnalysis();
        analysis.setCompanyName(request.getCompanyName());
        analysis.setJobTitle(request.getJobTitle());
        analysis.setSalary(request.getSalary());
        analysis.setJobDescription(request.getJobDescription());
        analysis.setScamPattern(scamPattern);
        analysis.setRiskScore(riskScore);
        analysis.setRiskLevel(riskLevel);
        analysis.setAiReason(reason);
        analysis.setCreatedAt(LocalDateTime.now());
        analysis.setUser(user);
        analysis.setCampaign(campaign);

        // Save new enriched fields
        analysis.setConfidenceScore(BigDecimal.valueOf(aiResult.getConfidenceScore()));
        analysis.setEmployerStatus(aiResult.getEmployerStatus());
        analysis.setRedFlags(convertListToJsonString(aiResult.getRedFlags()));
        analysis.setRecommendedActions(convertListToJsonString(aiResult.getRecommendedActions()));
        analysis.setSourceType(sourceType != null ? sourceType : "MANUAL");
        analysis.setSourceUrl(sourceUrl);

        jobAnalysisRepository.save(analysis);
        logger.info("Saved JobAnalysis ID {} for user {}", analysis.getAnalysisId(), user.getEmail());

        // 6. If riskLevel = HIGH -> create Notification
        if ("HIGH".equalsIgnoreCase(riskLevel)) {
            logger.warn("HIGH risk level detected for job analysis {}. Creating notification.", analysis.getAnalysisId());
            Notification notification = new Notification(
                    user,
                    "HIGH_RISK_DETECTED",
                    "High Risk Job Detected!",
                    String.format("The job at %s scored %d/100 risk. Exercise extreme caution.",
                            analysis.getCompanyName() != null ? analysis.getCompanyName() : "Unknown Company",
                            riskScore)
            );
            notificationRepository.save(notification);
        }

        // 7. Return detailed response
        return new AnalyzeJobResponse(
                riskScore,
                riskLevel,
                reason,
                matchedScams,
                highestSimilarity,
                similarCompanies,
                aiResult.getConfidenceScore(),
                aiResult.getEmployerStatus(),
                scamPattern,
                aiResult.getRedFlags(),
                aiResult.getRecommendedActions()
        );
    }

    private String convertListToJsonString(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            String item = list.get(i);
            sb.append("\"").append(item.replace("\\", "\\\\").replace("\"", "\\\"")).append("\"");
            if (i < list.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignSummaryResponse> getCampaignSummary() {
        List<ScamCampaign> campaigns = scamCampaignRepository.findAll();
        List<CampaignSummaryResponse> response = new ArrayList<>();

        for (ScamCampaign campaign : campaigns) {
            List<JobAnalysis> analyses = jobAnalysisRepository.findByCampaign(campaign);
            if (analyses.isEmpty()) {
                continue;
            }

            int totalScams = analyses.size();
            double averageRisk = analyses.stream()
                    .mapToInt(JobAnalysis::getRiskScore)
                    .average()
                    .orElse(0);

            Set<String> companies = analyses.stream()
                    .map(JobAnalysis::getCompanyName)
                    .collect(Collectors.toCollection(HashSet::new));

            response.add(
                    new CampaignSummaryResponse(
                            campaign.getCampaignCode(),
                            totalScams,
                            averageRisk,
                            new ArrayList<>(companies)
                    )
            );
        }

        return response;
    }

    @Override
    @Transactional
    public AnalyzeJobResponse analyzePdf(MultipartFile file) {
        String pdfText = pdfService.extractText(file);

        AnalyzeJobRequest request = new AnalyzeJobRequest();
        request.setCompanyName("Uploaded PDF");
        request.setJobTitle("Uploaded Job");
        request.setSalary("Not Available");
        request.setJobDescription(pdfText);

        return analyzeJob(request);
    }
}