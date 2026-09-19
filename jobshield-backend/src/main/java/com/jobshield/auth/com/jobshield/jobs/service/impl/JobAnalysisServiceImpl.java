package com.jobshield.jobs.service.impl;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import com.jobshield.campaign.dto.CampaignSummaryResponse;
import com.jobshield.campaign.entity.ScamCampaign;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.jobshield.jobs.util.ScamPatternGenerator.ScamPatternGenerator;
import com.jobshield.jobs.util.ScamSimilarityEngine.ScamSimilarityEngine;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.jobshield.ai.GeminiService;
import com.jobshield.ai.dto.AiAnalysisResult;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.campaign.dto.CampaignSummaryResponse;
import com.jobshield.campaign.entity.ScamCampaign;
import com.jobshield.campaign.repository.ScamCampaignRepository;
import com.jobshield.exception.ResourceNotFoundException;
import com.jobshield.jobs.dto.AnalyzeJobRequest;
import com.jobshield.jobs.dto.AnalyzeJobResponse;
import com.jobshield.jobs.dto.DashboardResponse;
import com.jobshield.jobs.dto.JobDetailsResponse;
import com.jobshield.jobs.dto.JobHistoryResponse;
import com.jobshield.jobs.entity.JobAnalysis;
import com.jobshield.jobs.repository.JobAnalysisRepository;
import com.jobshield.jobs.service.JobAnalysisService;
import org.springframework.web.multipart.MultipartFile;
import com.jobshield.pdf.PdfService;

@Service
public class JobAnalysisServiceImpl implements JobAnalysisService {

    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final JobAnalysisRepository jobAnalysisRepository;
    private final ScamPatternGenerator scamPatternGenerator;
    private final ScamSimilarityEngine similarityEngine;
    private final ScamCampaignRepository scamCampaignRepository;
	private PdfService pdfService;
    
    

    public JobAnalysisServiceImpl(
            JobAnalysisRepository jobAnalysisRepository,
            UserRepository userRepository,
            GeminiService geminiService,
            ScamPatternGenerator scamPatternGenerator,
            ScamSimilarityEngine similarityEngine,
            ScamCampaignRepository scamCampaignRepository,
            PdfService pdfService) {

        this.jobAnalysisRepository = jobAnalysisRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.scamPatternGenerator = scamPatternGenerator;
        this.similarityEngine = similarityEngine;
        this.scamCampaignRepository = scamCampaignRepository;
        this.pdfService = pdfService;
    }

    @Override
    public List<JobHistoryResponse> getHistory() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<JobAnalysis> analyses =
                jobAnalysisRepository.findByUser(user);
        

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
    public JobDetailsResponse getAnalysisById(Long analysisId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        JobAnalysis analysis = jobAnalysisRepository
                .findByAnalysisIdAndUser(analysisId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Analysis not found"));

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
    public DashboardResponse getDashboard() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        long total = jobAnalysisRepository.countByUser(user);

        long high = jobAnalysisRepository
                .countByUserAndRiskLevel(user, "HIGH");

        long medium = jobAnalysisRepository
                .countByUserAndRiskLevel(user, "MEDIUM");

        long low = jobAnalysisRepository
                .countByUserAndRiskLevel(user, "LOW");

        return new DashboardResponse(
                total,
                high,
                medium,
                low
        );
    }
@Override
public AnalyzeJobResponse analyzeJob(AnalyzeJobRequest request) {

    AiAnalysisResult aiResult =
            geminiService.analyzeJob(request.getJobDescription());

    int riskScore = aiResult.getRiskScore();
    String riskLevel = aiResult.getRiskLevel();
    String reason = aiResult.getReason();
    String scamPattern =
            scamPatternGenerator.generate(request.getJobDescription());
    List<JobAnalysis> previousAnalyses =
            jobAnalysisRepository.findAll();

    int matchedScams = 0;

    double highestSimilarity = 0;
    

    List<String> similarCompanies = new ArrayList<>();
    
    for (JobAnalysis analysis : previousAnalyses) {

        if (analysis.getScamPattern() == null) {
            continue;
        }

        double score = similarityEngine.calculateSimilarity(
                scamPattern,
                analysis.getScamPattern()
        );

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

        // Find an existing matching analysis
        for (JobAnalysis previous : previousAnalyses) {

            if (previous.getScamPattern() == null) {
                continue;
            }

            double score = similarityEngine.calculateSimilarity(
                    scamPattern,
                    previous.getScamPattern());

            if (score >= 80 && previous.getCampaign() != null) {

                campaign = previous.getCampaign();
                break;
            }
        }
    }
    if (campaign == null) {

        campaign = new ScamCampaign();

        campaign.setCampaignCode(
                "CMP-" + System.currentTimeMillis());

        campaign.setCreatedAt(LocalDateTime.now());

        scamCampaignRepository.save(campaign);
    }
    
    
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));

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
    analysis.setScamPattern(scamPattern);
    analysis.setCampaign(campaign);

jobAnalysisRepository.save(analysis);
    

    return new AnalyzeJobResponse(
            riskScore,
            riskLevel,
            reason,
            matchedScams,
            highestSimilarity,
            similarCompanies
    );
}
@Override
public List<CampaignSummaryResponse> getCampaignSummary() {

    List<ScamCampaign> campaigns = scamCampaignRepository.findAll();

    List<CampaignSummaryResponse> response = new ArrayList<>();

    for (ScamCampaign campaign : campaigns) {

        List<JobAnalysis> analyses =
                jobAnalysisRepository.findByCampaign(campaign);

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