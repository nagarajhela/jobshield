package com.jobshield.jobs.entity;

import java.time.LocalDateTime;

import com.jobshield.auth.entity.User;
import com.jobshield.campaign.entity.ScamCampaign;

import jakarta.persistence.*;

@Entity
@Table(name = "job_analysis")
public class JobAnalysis {
	

	

	public JobAnalysis() {
		super();
		// TODO Auto-generated constructor stub
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
	public void setScamPattern(String scamPattern) {
        this.scamPattern = scamPattern;
    }
	public ScamCampaign getCampaign() {
	    return campaign;
	}

	public void setCampaign(ScamCampaign campaign) {
	    this.campaign = campaign;
	}

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

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "scam_pattern")
    private String scamPattern;

    public String getScamPattern() {
        return scamPattern;
    }
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private ScamCampaign campaign;

	

	
    
}