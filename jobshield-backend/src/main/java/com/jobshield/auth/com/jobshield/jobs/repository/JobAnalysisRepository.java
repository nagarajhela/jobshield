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
}