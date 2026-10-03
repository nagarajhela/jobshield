package com.jobshield.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class JobAnalysisDetailDTO extends JobHistoryDTO {
    private String jobDescription;
    private String aiReason;
    private List<String> redFlags;
    private List<String> recommendedActions;
    private BigDecimal confidenceScore;
    private String sourceUrl;

    public JobAnalysisDetailDTO() {
        super();
    }

    public JobAnalysisDetailDTO(Long analysisId, String companyName, String jobTitle, String salary,
                                String riskLevel, int riskScore, String scamPattern, String employerStatus,
                                String sourceType, LocalDateTime createdAt, String jobDescription,
                                String aiReason, List<String> redFlags, List<String> recommendedActions,
                                BigDecimal confidenceScore, String sourceUrl) {
        super(analysisId, companyName, jobTitle, salary, riskLevel, riskScore, scamPattern, employerStatus, sourceType, createdAt);
        this.jobDescription = jobDescription;
        this.aiReason = aiReason;
        this.redFlags = redFlags;
        this.recommendedActions = recommendedActions;
        this.confidenceScore = confidenceScore;
        this.sourceUrl = sourceUrl;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getAiReason() {
        return aiReason;
    }

    public void setAiReason(String aiReason) {
        this.aiReason = aiReason;
    }

    public List<String> getRedFlags() {
        return redFlags;
    }

    public void setRedFlags(List<String> redFlags) {
        this.redFlags = redFlags;
    }

    public List<String> getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(List<String> recommendedActions) {
        this.recommendedActions = recommendedActions;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }
}
