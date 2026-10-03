package com.jobshield.jobs.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobshield.auth.entity.User;
import com.jobshield.campaign.entity.ScamCampaign;
import com.jobshield.jobs.entity.JobAnalysis;

public interface JobAnalysisRepository
        extends JpaRepository<JobAnalysis, Long> {

    List<JobAnalysis> findByUser(User user);
    Optional<JobAnalysis> findByAnalysisIdAndUser(Long analysisId, User user);
    long countByUser(User user);

    long countByUserAndRiskLevel(User user, String riskLevel);
    List<JobAnalysis> findByScamPattern(String scamPattern);

    List<JobAnalysis> findByCompanyNameContainingIgnoreCase(String companyName);
    List<JobAnalysis> findByCampaign(ScamCampaign campaign);

    org.springframework.data.domain.Page<JobAnalysis> findByUserUserIdAndIsDeletedFalse(Long userId, org.springframework.data.domain.Pageable pageable);
    long countByUserUserIdAndRiskLevel(Long userId, String riskLevel);
    long countByUserUserId(Long userId);
    List<JobAnalysis> findByUserUserIdAndIsDeletedFalse(Long userId);
    long countByCreatedAtAfter(java.time.LocalDateTime dateTime);
    long countByRiskLevelAndCreatedAtAfter(String riskLevel, java.time.LocalDateTime dateTime);
    List<JobAnalysis> findTop5ByUserUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);
    Optional<JobAnalysis> findByUserUserIdAndAnalysisId(Long userId, Long analysisId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE JobAnalysis j SET j.campaign = null WHERE j.campaign.campaignId = :campaignId")
    void clearCampaignReference(@org.springframework.data.repository.query.Param("campaignId") Long campaignId);
}