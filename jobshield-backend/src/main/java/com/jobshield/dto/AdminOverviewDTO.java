package com.jobshield.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AdminOverviewDTO {

    private long totalUsers;
    private long newUsersToday;
    private long totalAnalyses;
    private long analysesToday;
    private long highRiskToday;
    private long activeCampaigns;
    private long pendingReports;
    private String systemStatus;

    private long lowRiskCount;
    private long mediumRiskCount;
    private long highRiskCount;
    private List<Map<String, Object>> analysesPerDay = new ArrayList<>();
    private List<Map<String, Object>> recentHighRiskAnalyses = new ArrayList<>();

    public AdminOverviewDTO() {
    }

    public AdminOverviewDTO(long totalUsers, long newUsersToday, long totalAnalyses, long analysesToday,
                            long highRiskToday, long activeCampaigns, long pendingReports, String systemStatus) {
        this.totalUsers = totalUsers;
        this.newUsersToday = newUsersToday;
        this.totalAnalyses = totalAnalyses;
        this.analysesToday = analysesToday;
        this.highRiskToday = highRiskToday;
        this.activeCampaigns = activeCampaigns;
        this.pendingReports = pendingReports;
        this.systemStatus = systemStatus;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getNewUsersToday() {
        return newUsersToday;
    }

    public void setNewUsersToday(long newUsersToday) {
        this.newUsersToday = newUsersToday;
    }

    public long getTotalAnalyses() {
        return totalAnalyses;
    }

    public void setTotalAnalyses(long totalAnalyses) {
        this.totalAnalyses = totalAnalyses;
    }

    public long getAnalysesToday() {
        return analysesToday;
    }

    public void setAnalysesToday(long analysesToday) {
        this.analysesToday = analysesToday;
    }

    public long getHighRiskToday() {
        return highRiskToday;
    }

    public void setHighRiskToday(long highRiskToday) {
        this.highRiskToday = highRiskToday;
    }

    public long getActiveCampaigns() {
        return activeCampaigns;
    }

    public void setActiveCampaigns(long activeCampaigns) {
        this.activeCampaigns = activeCampaigns;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public String getSystemStatus() {
        return systemStatus;
    }

    public void setSystemStatus(String systemStatus) {
        this.systemStatus = systemStatus;
    }

    public long getLowRiskCount() {
        return lowRiskCount;
    }

    public void setLowRiskCount(long lowRiskCount) {
        this.lowRiskCount = lowRiskCount;
    }

    public long getMediumRiskCount() {
        return mediumRiskCount;
    }

    public void setMediumRiskCount(long mediumRiskCount) {
        this.mediumRiskCount = mediumRiskCount;
    }

    public long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(long highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public List<Map<String, Object>> getAnalysesPerDay() {
        return analysesPerDay;
    }

    public void setAnalysesPerDay(List<Map<String, Object>> analysesPerDay) {
        this.analysesPerDay = analysesPerDay;
    }

    public List<Map<String, Object>> getRecentHighRiskAnalyses() {
        return recentHighRiskAnalyses;
    }

    public void setRecentHighRiskAnalyses(List<Map<String, Object>> recentHighRiskAnalyses) {
        this.recentHighRiskAnalyses = recentHighRiskAnalyses;
    }
}
