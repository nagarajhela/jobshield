
package com.jobshield.ai.dto;

public class AiAnalysisResult {

    private int riskScore;
    private String riskLevel;
    private String reason;

    public AiAnalysisResult() {
    }

    public AiAnalysisResult(int riskScore,
                            String riskLevel,
                            String reason) {
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reason = reason;
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
    public interface GeminiService {

        AiAnalysisResult analyzeJob(String jobDescription);

    }
}