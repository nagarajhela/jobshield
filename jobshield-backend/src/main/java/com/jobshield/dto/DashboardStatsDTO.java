package com.jobshield.dto;

import java.util.List;

public class DashboardStatsDTO {
    private int totalAnalyses;
    private int highRiskCount;
    private int mediumRiskCount;
    private int lowRiskCount;
    private int safetyScore;
    private String mostCommonScamPattern;
    private int analysesThisMonth;
    private List<RecentAnalysisDTO> recentAnalyses;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(int totalAnalyses, int highRiskCount, int mediumRiskCount, int lowRiskCount,
                             int safetyScore, String mostCommonScamPattern, int analysesThisMonth,
                             List<RecentAnalysisDTO> recentAnalyses) {
        this.totalAnalyses = totalAnalyses;
        this.highRiskCount = highRiskCount;
        this.mediumRiskCount = mediumRiskCount;
        this.lowRiskCount = lowRiskCount;
        this.safetyScore = safetyScore;
        this.mostCommonScamPattern = mostCommonScamPattern;
        this.analysesThisMonth = analysesThisMonth;
        this.recentAnalyses = recentAnalyses;
    }

    public int getTotalAnalyses() {
        return totalAnalyses;
    }

    public void setTotalAnalyses(int totalAnalyses) {
        this.totalAnalyses = totalAnalyses;
    }

    public int getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(int highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public int getMediumRiskCount() {
        return mediumRiskCount;
    }

    public void setMediumRiskCount(int mediumRiskCount) {
        this.mediumRiskCount = mediumRiskCount;
    }

    public int getLowRiskCount() {
        return lowRiskCount;
    }

    public void setLowRiskCount(int lowRiskCount) {
        this.lowRiskCount = lowRiskCount;
    }

    public int getSafetyScore() {
        return safetyScore;
    }

    public void setSafetyScore(int safetyScore) {
        this.safetyScore = safetyScore;
    }

    public String getMostCommonScamPattern() {
        return mostCommonScamPattern;
    }

    public void setMostCommonScamPattern(String mostCommonScamPattern) {
        this.mostCommonScamPattern = mostCommonScamPattern;
    }

    public int getAnalysesThisMonth() {
        return analysesThisMonth;
    }

    public void setAnalysesThisMonth(int analysesThisMonth) {
        this.analysesThisMonth = analysesThisMonth;
    }

    public List<RecentAnalysisDTO> getRecentAnalyses() {
        return recentAnalyses;
    }

    public void setRecentAnalyses(List<RecentAnalysisDTO> recentAnalyses) {
        this.recentAnalyses = recentAnalyses;
    }
}
