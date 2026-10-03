package com.jobshield.jobs;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.dto.JobAnalysisDetailDTO;
import com.jobshield.dto.JobHistoryDTO;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.exception.ResourceNotFoundException;
import com.jobshield.saved.SavedJob;

@RestController
@RequestMapping("/api/jobs")
public class JobHistoryController {

    private static final Logger logger = LoggerFactory.getLogger(JobHistoryController.class);

    private final JobHistoryService jobHistoryService;
    private final UserRepository userRepository;

    public JobHistoryController(JobHistoryService jobHistoryService, UserRepository userRepository) {
        this.jobHistoryService = jobHistoryService;
        this.userRepository = userRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<PagedResponseDTO<JobHistoryDTO>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "created_at") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        User user = getAuthenticatedUser();
        LocalDateTime start = parseDateTime(startDate);
        LocalDateTime end = parseDateTime(endDate);

        if (page < 0) {
            throw new IllegalArgumentException("Page index must not be less than zero");
        }
        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }

        logger.info("Serving GET /api/jobs/history for userId: {}", user.getUserId());
        PagedResponseDTO<JobHistoryDTO> history = jobHistoryService.getHistory(
                user.getUserId(), page, size, riskLevel, search, sortBy, sortDir, start, end
        );
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/{analysisId}")
    public ResponseEntity<JobAnalysisDetailDTO> getAnalysisById(@PathVariable Long analysisId) {
        User user = getAuthenticatedUser();
        logger.info("Serving GET /api/jobs/history/{} for userId: {}", analysisId, user.getUserId());

        JobAnalysisDetailDTO detail = jobHistoryService.getAnalysisById(analysisId, user.getUserId());
        return ResponseEntity.ok(detail);
    }

    @DeleteMapping("/history/{analysisId}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable Long analysisId) {
        User user = getAuthenticatedUser();
        logger.info("Serving DELETE /api/jobs/history/{} for userId: {}", analysisId, user.getUserId());

        jobHistoryService.softDeleteAnalysis(analysisId, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        User user = getAuthenticatedUser();
        logger.info("Serving GET /api/jobs/history/export/csv for userId: {}", user.getUserId());

        byte[] csvData = jobHistoryService.exportCsv(user.getUserId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"jobshield-history.csv\"");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }

    @PostMapping("/{analysisId}/save")
    public ResponseEntity<SavedJob> saveJob(@PathVariable Long analysisId) {
        User user = getAuthenticatedUser();
        logger.info("Serving POST /api/jobs/{}/save for userId: {}", analysisId, user.getUserId());

        SavedJob saved = jobHistoryService.saveJob(analysisId, user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{analysisId}/unsave")
    public ResponseEntity<Void> unsaveJob(@PathVariable Long analysisId) {
        User user = getAuthenticatedUser();
        logger.info("Serving DELETE /api/jobs/{}/unsave for userId: {}", analysisId, user.getUserId());

        jobHistoryService.unsaveJob(analysisId, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/saved")
    public ResponseEntity<List<JobAnalysisDetailDTO>> getSavedJobs() {
        User user = getAuthenticatedUser();
        logger.info("Serving GET /api/jobs/saved for userId: {}", user.getUserId());

        List<JobAnalysisDetailDTO> savedJobs = jobHistoryService.getSavedJobs(user.getUserId());
        return ResponseEntity.ok(savedJobs);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        String trimmed = dateStr.trim();
        try {
            if (trimmed.length() == 10) {
                return LocalDate.parse(trimmed).atStartOfDay();
            }
            return LocalDateTime.parse(trimmed, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr + ". Please use ISO format (e.g. 2026-09-22 or 2026-09-22T10:30:00).");
        }
    }
}
