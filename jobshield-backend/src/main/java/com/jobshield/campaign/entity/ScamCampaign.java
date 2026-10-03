package com.jobshield.campaign.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "scam_campaign")
public class ScamCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(name = "campaign_code", nullable = false, unique = true, length = 50)
    private String campaignCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // === New Fields ===
    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity", length = 20)
    private String severity;

    @Column(name = "victim_count", nullable = false)
    private int victimCount = 0;

    @Column(name = "targeted_job_titles", length = 500)
    private String targetedJobTitles;

    @Column(name = "platform_origin", length = 100)
    private String platformOrigin;

    @Column(name = "first_seen")
    private LocalDate firstSeen;

    @Column(name = "last_seen")
    private LocalDate lastSeen;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

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

    // === New Getters and Setters ===
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public int getVictimCount() {
        return victimCount;
    }

    public void setVictimCount(int victimCount) {
        this.victimCount = victimCount;
    }

    public String getTargetedJobTitles() {
        return targetedJobTitles;
    }

    public void setTargetedJobTitles(String targetedJobTitles) {
        this.targetedJobTitles = targetedJobTitles;
    }

    public String getPlatformOrigin() {
        return platformOrigin;
    }

    public void setPlatformOrigin(String platformOrigin) {
        this.platformOrigin = platformOrigin;
    }

    public LocalDate getFirstSeen() {
        return firstSeen;
    }

    public void setFirstSeen(LocalDate firstSeen) {
        this.firstSeen = firstSeen;
    }

    public LocalDate getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDate lastSeen) {
        this.lastSeen = lastSeen;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
}