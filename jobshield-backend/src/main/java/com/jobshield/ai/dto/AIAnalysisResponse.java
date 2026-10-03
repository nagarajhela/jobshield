package com.jobshield.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class AIAnalysisResponse {

    private int riskScore;
    private String riskLevel;
    private String reason;
    private int confidenceScore;
    private String employerStatus;
    private String scamPattern;
    private List<String> redFlags = new ArrayList<>();
    private List<String> recommendedActions = new ArrayList<>();

    public AIAnalysisResponse() {
    }

    public AIAnalysisResponse(int riskScore, String riskLevel, String reason, int confidenceScore,
                              String employerStatus, String scamPattern, List<String> redFlags,
                              List<String> recommendedActions) {
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reason = reason;
        this.confidenceScore = confidenceScore;
        this.employerStatus = employerStatus;
        this.scamPattern = scamPattern;
        this.redFlags = redFlags != null ? redFlags : new ArrayList<>();
        this.recommendedActions = recommendedActions != null ? recommendedActions : new ArrayList<>();
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
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

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(int confidenceScore) {
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
