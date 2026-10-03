package com.jobshield.jobs.dto;

import java.time.LocalDateTime;

public class JobDetailsResponse {

    private Long analysisId;
    private String companyName;
    private String jobTitle;
    private String salary;
    private String jobDescription;
    private Integer riskScore;
    private String riskLevel;
    private String reason;
    private LocalDateTime createdAt;

    public JobDetailsResponse() {
    }

    public JobDetailsResponse(Long analysisId,
                              String companyName,
                              String jobTitle,
                              String salary,
                              String jobDescription,
                              Integer riskScore,
                              String riskLevel,
                              String reason,
                              LocalDateTime createdAt) {

        this.analysisId = analysisId;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.salary = salary;
        this.jobDescription = jobDescription;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reason = reason;
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

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}