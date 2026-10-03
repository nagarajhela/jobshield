package com.jobshield.jobs.dto;

import java.time.LocalDateTime;

public class JobHistoryResponse {

    private Long analysisId;
    private String companyName;
    private String jobTitle;
    private Integer riskScore;
    private String riskLevel;
    private LocalDateTime createdAt;

    public JobHistoryResponse() {
    }

    public JobHistoryResponse(Long analysisId,
                              String companyName,
                              String jobTitle,
                              Integer riskScore,
                              String riskLevel,
                              LocalDateTime createdAt) {
        this.analysisId = analysisId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
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

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}