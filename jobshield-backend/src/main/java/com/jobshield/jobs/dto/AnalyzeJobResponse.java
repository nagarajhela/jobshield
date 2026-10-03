package com.jobshield.jobs.dto;

import java.util.ArrayList;
import java.util.List;

public class AnalyzeJobResponse {

    private Integer riskScore;
    private String riskLevel;
    private String reason;
    private Integer matchedScams;
    private double highestSimilarity;
    private List<String> similarCompanies;

    // === New Detailed AI Results ===
    private Integer confidenceScore;
    private String employerStatus;
    private String scamPattern;
    private List<String> redFlags = new ArrayList<>();
    private List<String> recommendedActions = new ArrayList<>();

    public AnalyzeJobResponse() {
    }

    public AnalyzeJobResponse(Integer riskScore,
                              String riskLevel,
                              String reason,
                              Integer matchedScams,
                              double highestSimilarity,
                              List<String> similarCompanies) {
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reason = reason;
        this.matchedScams = matchedScams;
        this.highestSimilarity = highestSimilarity;
        this.similarCompanies = similarCompanies;
    }

    public AnalyzeJobResponse(Integer riskScore,
                              String riskLevel,
                              String reason,
                              Integer matchedScams,
                              double highestSimilarity,
                              List<String> similarCompanies,
                              Integer confidenceScore,
                              String employerStatus,
                              String scamPattern,
                              List<String> redFlags,
                              List<String> recommendedActions) {
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reason = reason;
        this.matchedScams = matchedScams;
        this.highestSimilarity = highestSimilarity;
        this.similarCompanies = similarCompanies;
        this.confidenceScore = confidenceScore;
        this.employerStatus = employerStatus;
        this.scamPattern = scamPattern;
        this.redFlags = redFlags != null ? redFlags : new ArrayList<>();
        this.recommendedActions = recommendedActions != null ? recommendedActions : new ArrayList<>();
    }

    public Integer getMatchedScams() {
        return matchedScams;
    }

    public void setMatchedScams(Integer matchedScams) {
        this.matchedScams = matchedScams;
    }

    public List<String> getSimilarCompanies() {
        return similarCompanies;
    }

    public void setSimilarCompanies(List<String> similarCompanies) {
        this.similarCompanies = similarCompanies;
    }

    public double getHighestSimilarity() {
        return highestSimilarity;
    }

    public void setHighestSimilarity(double highestSimilarity) {
        this.highestSimilarity = highestSimilarity;
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

    public Integer getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Integer confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getEmployerStatus() {
        return employerStatus;
    }

    public void setEmployerStatus(String employerStatus) {
        this.employerStatus = employerStatus;
    }

    public String getScamPattern() {
        return scamPattern;
    }

    public void setScamPattern(String scamPattern) {
        this.scamPattern = scamPattern;
    }

    public List<String> getRedFlags() {
        return redFlags;
    }

    public void setRedFlags(List<String> redFlags) {
        this.redFlags = redFlags != null ? redFlags : new ArrayList<>();
    }

    public List<String> getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(List<String> recommendedActions) {
        this.recommendedActions = recommendedActions != null ? recommendedActions : new ArrayList<>();
    }
}