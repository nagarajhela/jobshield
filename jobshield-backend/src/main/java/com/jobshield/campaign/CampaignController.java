package com.jobshield.campaign;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.jobshield.campaign.entity.ScamCampaign;
import com.jobshield.campaign.repository.ScamCampaignRepository;
import com.jobshield.exception.ResourceNotFoundException;

@RestController
public class CampaignController {

    private static final Logger logger = LoggerFactory.getLogger(CampaignController.class);

    private final ScamCampaignRepository campaignRepository;
    private final com.jobshield.jobs.repository.JobAnalysisRepository jobAnalysisRepository;

    public CampaignController(
            ScamCampaignRepository campaignRepository,
            com.jobshield.jobs.repository.JobAnalysisRepository jobAnalysisRepository) {
        this.campaignRepository = campaignRepository;
        this.jobAnalysisRepository = jobAnalysisRepository;
    }

    @GetMapping("/api/campaigns")
    public ResponseEntity<List<ScamCampaign>> getAllCampaigns(@RequestParam(required = false) Boolean activeOnly) {
        logger.info("Serving GET /api/campaigns (activeOnly={})", activeOnly);
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(campaignRepository.findByIsActiveTrueOrderByCreatedAtDesc());
        }
        return ResponseEntity.ok(campaignRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/api/campaigns/active")
    public ResponseEntity<List<ScamCampaign>> getActiveCampaigns() {
        logger.info("Serving GET /api/campaigns/active");
        return ResponseEntity.ok(campaignRepository.findByIsActiveTrueOrderByCreatedAtDesc());
    }

    @GetMapping("/api/campaigns/{id}")
    public ResponseEntity<ScamCampaign> getCampaignById(@PathVariable Long id) {
        logger.info("Serving GET /api/campaigns/{}", id);
        ScamCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
        return ResponseEntity.ok(campaign);
    }

    @PostMapping({"/api/campaigns", "/api/admin/campaigns"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScamCampaign> createCampaign(@RequestBody ScamCampaign request) {
        logger.info("Admin creating new scam campaign: {}", request.getTitle());

        ScamCampaign campaign = new ScamCampaign();
        if (request.getCampaignCode() != null && !request.getCampaignCode().isBlank()) {
            campaign.setCampaignCode(request.getCampaignCode().trim().toUpperCase());
        } else {
            campaign.setCampaignCode("CAMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        campaign.setTitle(request.getTitle() != null ? request.getTitle() : "Untitled Scam Syndicate");
        campaign.setDescription(request.getDescription() != null ? request.getDescription() : "No description provided.");
        campaign.setSeverity(request.getSeverity() != null ? request.getSeverity().toUpperCase() : "HIGH");
        campaign.setVictimCount(request.getVictimCount() >= 0 ? request.getVictimCount() : 0);
        campaign.setTargetedJobTitles(request.getTargetedJobTitles() != null ? request.getTargetedJobTitles() : "General Positions");
        campaign.setPlatformOrigin(request.getPlatformOrigin() != null ? request.getPlatformOrigin() : "Web");
        campaign.setActive(request.isActive());
        campaign.setFirstSeen(request.getFirstSeen() != null ? request.getFirstSeen() : LocalDate.now());
        campaign.setLastSeen(request.getLastSeen() != null ? request.getLastSeen() : LocalDate.now());

        ScamCampaign saved = campaignRepository.save(campaign);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping({"/api/campaigns/{id}", "/api/admin/campaigns/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        logger.info("Admin deleting campaign id: {}", id);
        if (!campaignRepository.existsById(id)) {
            throw new ResourceNotFoundException("Campaign not found with id: " + id);
        }
        jobAnalysisRepository.clearCampaignReference(id);
        campaignRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
