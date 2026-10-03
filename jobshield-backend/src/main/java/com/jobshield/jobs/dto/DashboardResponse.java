package com.jobshield.jobs.dto;

public class DashboardResponse {

    private long totalAnalyses;
    private long highRisk;
    private long mediumRisk;
    private long lowRisk;

    public DashboardResponse() {
    }

    public DashboardResponse(long totalAnalyses,
                             long highRisk,
                             long mediumRisk,
                             long lowRisk) {
        this.totalAnalyses = totalAnalyses;
        this.highRisk = highRisk;
        this.mediumRisk = mediumRisk;
        this.lowRisk = lowRisk;
    }

    public long getTotalAnalyses() {
        return totalAnalyses;
    }

    public void setTotalAnalyses(long totalAnalyses) {
        this.totalAnalyses = totalAnalyses;
    }

    public long getHighRisk() {
        return highRisk;
    }

    public void setHighRisk(long highRisk) {
        this.highRisk = highRisk;
    }

    public long getMediumRisk() {
        return mediumRisk;
    }

    public void setMediumRisk(long mediumRisk) {
        this.mediumRisk = mediumRisk;
    }

    public long getLowRisk() {
        return lowRisk;
    }

    public void setLowRisk(long lowRisk) {
        this.lowRisk = lowRisk;
    }
}