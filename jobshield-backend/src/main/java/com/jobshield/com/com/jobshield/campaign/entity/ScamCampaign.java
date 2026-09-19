package com.jobshield.campaign.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "scam_campaign")
public class ScamCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(name = "campaign_code", nullable = false, unique = true, length = 50)
    private String campaignCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public ScamCampaign() {
    }

    public ScamCampaign(Long campaignId, String campaignCode, LocalDateTime createdAt) {
        this.campaignId = campaignId;
        this.campaignCode = campaignCode;
        this.createdAt = createdAt;
    }

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(Long campaignId) {
        this.campaignId = campaignId;
    }

    public String getCampaignCode() {
        return campaignCode;
    }

    public void setCampaignCode(String campaignCode) {
        this.campaignCode = campaignCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}