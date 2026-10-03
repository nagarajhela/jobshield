package com.jobshield.dto;

import java.time.LocalDateTime;

public class JobHistoryDTO {
    private Long analysisId;
    private String companyName;
    private String jobTitle;
    private String salary;
    private String riskLevel;
    private int riskScore;
    private String scamPattern;
    private String employerStatus;
    private String sourceType;
    private LocalDateTime createdAt;

    public JobHistoryDTO() {
    }

    public JobHistoryDTO(Long analysisId, String companyName, String jobTitle, String salary,
                         String riskLevel, int riskScore, String scamPattern, String employerStatus,
                         String sourceType, LocalDateTime createdAt) {
        this.analysisId = analysisId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.salary = salary;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.scamPattern = scamPattern;
        this.employerStatus = employerStatus;
        this.sourceType = sourceType;
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

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
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

    public String getScamPattern() {
        return scamPattern;
    }

    public void setScamPattern(String scamPattern) {
        this.scamPattern = scamPattern;
    }

    public String getEmployerStatus() {
        return employerStatus;
    }

    public void setEmployerStatus(String employerStatus) {
        this.employerStatus = employerStatus;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
