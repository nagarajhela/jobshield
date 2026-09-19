package com.jobshield.campaign.dto;


import java.util.List;

public class CampaignSummaryResponse {

    private String campaignCode;
    private int totalScams;
    private double averageRisk;
    private List<String> companies;

    public CampaignSummaryResponse() {
    }

    public CampaignSummaryResponse(String campaignCode,
                                   int totalScams,
                                   double averageRisk,
                                   List<String> companies) {
        this.campaignCode = campaignCode;
        this.totalScams = totalScams;
        this.averageRisk = averageRisk;
        this.companies = companies;
    }

    public String getCampaignCode() {
        return campaignCode;
    }

    public void setCampaignCode(String campaignCode) {
        this.campaignCode = campaignCode;
    }

    public int getTotalScams() {
        return totalScams;
    }

    public void setTotalScams(int totalScams) {
        this.totalScams = totalScams;
    }

    public double getAverageRisk() {
        return averageRisk;
    }

    public void setAverageRisk(double averageRisk) {
        this.averageRisk = averageRisk;
    }

    public List<String> getCompanies() {
        return companies;
    }

    public void setCompanies(List<String> companies) {
        this.companies = companies;
    }
}