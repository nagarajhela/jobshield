package com.jobshield.dto;

import java.time.LocalDateTime;

public class RecentAnalysisDTO {
    private Long analysisId;
    private String companyName;
    private String jobTitle;
    private String riskLevel;
    private int riskScore;
    private LocalDateTime createdAt;

    public RecentAnalysisDTO() {
    }

    public RecentAnalysisDTO(Long analysisId, String companyName, String jobTitle, String riskLevel, int riskScore, LocalDateTime createdAt) {
        this.analysisId = analysisId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.createdAt = createdAt;
    }

    public Long getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(Long analysisId) {
        this.analysisId = analysisId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
