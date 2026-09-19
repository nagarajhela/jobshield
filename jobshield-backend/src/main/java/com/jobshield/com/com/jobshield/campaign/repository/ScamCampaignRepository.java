package com.jobshield.campaign.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobshield.campaign.entity.ScamCampaign;

public interface ScamCampaignRepository
        extends JpaRepository<ScamCampaign, Long> {

    Optional<ScamCampaign> findByCampaignCode(String campaignCode);

}