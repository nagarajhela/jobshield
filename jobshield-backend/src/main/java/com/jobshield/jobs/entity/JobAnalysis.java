package com.jobshield.jobs.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.jobshield.auth.entity.User;
import com.jobshield.campaign.entity.ScamCampaign;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_analysis")
public class JobAnalysis {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "analysis_id")
	private Long analysisId;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "company_name", nullable = false, length = 100)
	private String companyName;

	@Column(name = "job_title", nullable = false, length = 100)
	private String jobTitle;

	@Column(name = "salary", length = 50)
	private String salary;

	@Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
	private String jobDescription;

	@Column(name = "risk_score")
	private Integer riskScore;

	@Column(name = "risk_level", length = 20)
	private String riskLevel;

	@Column(name = "ai_reason", columnDefinition = "TEXT")
	private String aiReason;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "scam_pattern")
	private String scamPattern;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "campaign_id")
	private ScamCampaign campaign;

	// === New Fields ===
	@Column(name = "red_flags", columnDefinition = "TEXT")
	private String redFlags;

	@Column(name = "confidence_score", precision = 5, scale = 2)
	private BigDecimal confidenceScore;

	@Column(name = "employer_status", length = 30)
	private String employerStatus;

	@Column(name = "recommended_actions", columnDefinition = "TEXT")
	private String recommendedActions;

	@Column(name = "is_deleted", nullable = false)
	private boolean isDeleted = false;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	@Column(name = "source_url", length = 1024)
	private String sourceUrl;

	@Column(name = "source_type", length = 30)
	private String sourceType = "MANUAL";

	public JobAnalysis() {
		super();
	}

	public Long getAnalysisId() {
		return analysisId;
	}

	public void setAnalysisId(Long analysisId) {
		this.analysisId = analysisId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getJobTitle() {
		return jobTitle;
	}

	public void setJobTitle(String jobTitle) {
		this.jobTitle = jobTitle;
	}

	public String getSalary() {
		return salary;
	}

	public void setSalary(String salary) {
		this.salary = salary;
	}

	public String getJobDescription() {
		return jobDescription;
	}

	public void setJobDescription(String jobDescription) {
		this.jobDescription = jobDescription;
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

	public String getAiReason() {
		return aiReason;
	}

	public void setAiReason(String aiReason) {
		this.aiReason = aiReason;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getScamPattern() {
		return scamPattern;
	}

	public void setScamPattern(String scamPattern) {
		this.scamPattern = scamPattern;
	}

	public ScamCampaign getCampaign() {
		return campaign;
	}

	public void setCampaign(ScamCampaign campaign) {
		this.campaign = campaign;
	}

	// === New Getters and Setters ===
	public String getRedFlags() {
		return redFlags;
	}

	public void setRedFlags(String redFlags) {
		this.redFlags = redFlags;
	}

	public BigDecimal getConfidenceScore() {
		return confidenceScore;
	}

	public void setConfidenceScore(BigDecimal confidenceScore) {
		this.confidenceScore = confidenceScore;
	}

	public String getEmployerStatus() {
		return employerStatus;
	}

	public void setEmployerStatus(String employerStatus) {
		this.employerStatus = employerStatus;
	}

	public String getRecommendedActions() {
		return recommendedActions;
	}

	public void setRecommendedActions(String recommendedActions) {
		this.recommendedActions = recommendedActions;
	}

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public LocalDateTime getDeletedAt() {
		return deletedAt;
	}

	public void setDeletedAt(LocalDateTime deletedAt) {
		this.deletedAt = deletedAt;
	}

	public String getSourceUrl() {
		return sourceUrl;
	}

	public void setSourceUrl(String sourceUrl) {
		this.sourceUrl = sourceUrl;
	}

	public String getSourceType() {
		return sourceType;
	}

	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}
}