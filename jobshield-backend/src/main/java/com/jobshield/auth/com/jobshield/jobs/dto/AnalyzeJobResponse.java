package com.jobshield.jobs.dto;

import java.util.List;

public class AnalyzeJobResponse {

    private Integer riskScore;
    private String riskLevel;
    private String reason;
    private Integer matchedScams;

    private double highestSimilarity;

    private List<String> similarCompanies;

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
}