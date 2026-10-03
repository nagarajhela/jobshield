package com.jobshield.community;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.exception.BadRequestException;
import com.jobshield.exception.ResourceNotFoundException;

@RestController
public class CommunityReportController {

    private static final Logger logger = LoggerFactory.getLogger(CommunityReportController.class);

    private final CommunityReportRepository reportRepository;
    private final UserRepository userRepository;

    public CommunityReportController(CommunityReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/api/community-reports")
    public ResponseEntity<PagedResponseDTO<Map<String, Object>>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String sort) {

        logger.info("Serving GET /api/community-reports page={}, size={}, status={}, sort={}", page, size, status, sort);

        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("MOST_VOTES".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "upvotes");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sortObj);

        Page<CommunityReport> reportPage;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            reportPage = reportRepository.findByStatus(status.toUpperCase(), pageable);
        } else {
            reportPage = reportRepository.findAll(pageable);
        }

        List<Map<String, Object>> content = reportPage.getContent().stream()
                .map(this::toMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new PagedResponseDTO<>(
                content,
                reportPage.getTotalElements(),
                reportPage.getTotalPages(),
                reportPage.getNumber(),
                reportPage.getSize(),
                reportPage.isFirst(),
                reportPage.isLast()
        ));
    }

    @PostMapping("/api/community-reports")
    public ResponseEntity<Map<String, Object>> submitReport(@RequestBody Map<String, String> request) {
        logger.info("Received new community scam report");

        String companyName = request.get("companyName");
        String jobTitle = request.get("jobTitle");
        String description = request.get("description");

        if (companyName == null || companyName.isBlank()) {
            throw new BadRequestException("Company name is required");
        }
        if (jobTitle == null || jobTitle.isBlank()) {
            throw new BadRequestException("Job title is required");
        }
        if (description == null || description.isBlank()) {
            throw new BadRequestException("Description is required");
        }

        User reporter = getCurrentUser();
        if (reporter == null) {
            // Use admin or fallback user
            reporter = userRepository.findByEmail("admin@jobshield.com")
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
        }

        CommunityReport report = new CommunityReport();
        report.setReporter(reporter);
        report.setCompanyName(companyName.trim());
        report.setJobTitle(jobTitle.trim());
        report.setPlatform(request.getOrDefault("platform", "Other"));
        report.setJobUrl(request.get("jobUrl"));
        report.setDescription(description.trim());
        report.setStatus("PENDING");
        report.setUpvotes(1);
        report.setDownvotes(0);

        CommunityReport saved = reportRepository.save(report);
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(saved));
    }

    @PutMapping("/api/community-reports/{id}/upvote")
    public ResponseEntity<Map<String, Object>> upvoteReport(@PathVariable Long id) {
        CommunityReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
        report.setUpvotes(report.getUpvotes() + 1);
        CommunityReport updated = reportRepository.save(report);
        return ResponseEntity.ok(toMap(updated));
    }

    @PutMapping("/api/community-reports/{id}/downvote")
    public ResponseEntity<Map<String, Object>> downvoteReport(@PathVariable Long id) {
        CommunityReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
        report.setDownvotes(report.getDownvotes() + 1);
        CommunityReport updated = reportRepository.save(report);
        return ResponseEntity.ok(toMap(updated));
    }

    @PutMapping({"/api/community-reports/{id}/status", "/api/admin/reports/{id}/status"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        CommunityReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        String newStatus = request.get("status");
        if (newStatus != null && !newStatus.isBlank()) {
            report.setStatus(newStatus.toUpperCase());
        }
        if (request.containsKey("adminNotes")) {
            report.setAdminNotes(request.get("adminNotes"));
        }

        User admin = getCurrentUser();
        if (admin != null) {
            report.setReviewedBy(admin);
            report.setReviewedAt(java.time.LocalDateTime.now());
        }

        CommunityReport updated = reportRepository.save(report);
        return ResponseEntity.ok(toMap(updated));
    }

    @DeleteMapping({"/api/community-reports/{id}", "/api/admin/reports/{id}"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        logger.info("Admin deleting community report id: {}", id);
        if (!reportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Report not found with id: " + id);
        }
        reportRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return userRepository.findByEmail(auth.getName()).orElse(null);
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private Map<String, Object> toMap(CommunityReport r) {
        return Map.ofEntries(
                Map.entry("reportId", r.getReportId()),
                Map.entry("companyName", r.getCompanyName() != null ? r.getCompanyName() : ""),
                Map.entry("jobTitle", r.getJobTitle() != null ? r.getJobTitle() : ""),
                Map.entry("platform", r.getPlatform() != null ? r.getPlatform() : "Web"),
                Map.entry("jobUrl", r.getJobUrl() != null ? r.getJobUrl() : ""),
                Map.entry("description", r.getDescription() != null ? r.getDescription() : ""),
                Map.entry("upvotes", r.getUpvotes()),
                Map.entry("downvotes", r.getDownvotes()),
                Map.entry("status", r.getStatus() != null ? r.getStatus() : "PENDING"),
                Map.entry("adminNotes", r.getAdminNotes() != null ? r.getAdminNotes() : ""),
                Map.entry("reportedBy", (r.getReporter() != null && r.getReporter().getFirstName() != null)
                        ? r.getReporter().getFirstName() : "Anonymous"),
                Map.entry("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : java.time.LocalDateTime.now().toString())
        );
    }
}
