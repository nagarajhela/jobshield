package com.jobshield.jobs;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.dto.JobAnalysisDetailDTO;
import com.jobshield.dto.JobHistoryDTO;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.exception.ConflictException;
import com.jobshield.exception.ResourceNotFoundException;
import com.jobshield.jobs.entity.JobAnalysis;
import com.jobshield.saved.SavedJob;
import com.jobshield.saved.SavedJobRepository;

@Service
public class JobHistoryServiceImpl implements JobHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(JobHistoryServiceImpl.class);
    private static final DateTimeFormatter CSV_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JobHistoryRepository jobHistoryRepository;
    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;

    public JobHistoryServiceImpl(
            JobHistoryRepository jobHistoryRepository,
            SavedJobRepository savedJobRepository,
            UserRepository userRepository) {
        this.jobHistoryRepository = jobHistoryRepository;
        this.savedJobRepository = savedJobRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<JobHistoryDTO> getHistory(
            Long userId,
            int page,
            int size,
            String riskLevel,
            String search,
            String sortBy,
            String sortDir,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        logger.info("Fetching history for userId: {}, page: {}, size: {}, riskLevel: {}, search: {}",
                userId, page, size, riskLevel, search);

        // Normalize filter values
        String filterRiskLevel = (riskLevel != null && !riskLevel.trim().isEmpty() && !riskLevel.equalsIgnoreCase("ALL"))
                ? riskLevel.trim().toUpperCase() : null;
        String filterSearch = (search != null && !search.trim().isEmpty())
                ? search.trim() : null;

        // Map sortBy field to entity property name
        String sortProperty = mapSortProperty(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProperty));

        Page<JobAnalysis> pageResult = jobHistoryRepository.findUserHistory(
                userId,
                filterRiskLevel,
                filterSearch,
                startDate,
                endDate,
                pageable
        );

        List<JobHistoryDTO> content = pageResult.getContent().stream()
                .map(this::mapToHistoryDTO)
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                content,
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.isFirst(),
                pageResult.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public JobAnalysisDetailDTO getAnalysisById(Long analysisId, Long userId) {
        logger.info("Fetching analysis details for analysisId: {}, userId: {}", analysisId, userId);

        JobAnalysis analysis = jobHistoryRepository.findByAnalysisIdAndUser_UserIdAndIsDeletedFalse(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job analysis not found with id: " + analysisId));

        return mapToDetailDTO(analysis);
    }

    @Override
    @Transactional
    public void softDeleteAnalysis(Long analysisId, Long userId) {
        logger.info("Soft deleting analysisId: {} for userId: {}", analysisId, userId);

        JobAnalysis analysis = jobHistoryRepository.findByAnalysisIdAndUser_UserIdAndIsDeletedFalse(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job analysis not found with id: " + analysisId));

        analysis.setDeleted(true);
        analysis.setDeletedAt(LocalDateTime.now());
        jobHistoryRepository.save(analysis);

        logger.info("Successfully soft deleted analysisId: {}", analysisId);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(Long userId) {
        logger.info("Exporting history as CSV for userId: {}", userId);

        List<JobAnalysis> analyses = jobHistoryRepository.findByUser_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);

        StringBuilder sb = new StringBuilder();
        // Header
        sb.append("Date,Company,Job Title,Risk Level,Risk Score,Scam Pattern\n");

        for (JobAnalysis a : analyses) {
            String dateStr = a.getCreatedAt() != null ? a.getCreatedAt().format(CSV_DATE_FORMATTER) : "";
            String company = escapeCsv(a.getCompanyName());
            String jobTitle = escapeCsv(a.getJobTitle());
            String riskLevel = a.getRiskLevel() != null ? a.getRiskLevel() : "";
            String riskScore = a.getRiskScore() != null ? String.valueOf(a.getRiskScore()) : "0";
            String scamPattern = a.getScamPattern() != null ? escapeCsv(a.getScamPattern()) : "";

            sb.append(dateStr).append(",")
              .append(company).append(",")
              .append(jobTitle).append(",")
              .append(riskLevel).append(",")
              .append(riskScore).append(",")
              .append(scamPattern).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    @Transactional
    public SavedJob saveJob(Long analysisId, Long userId) {
        logger.info("Saving job analysisId: {} for userId: {}", analysisId, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        JobAnalysis analysis = jobHistoryRepository.findById(analysisId)
                .filter(a -> !a.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Job analysis not found: " + analysisId));

        if (savedJobRepository.existsByUserAndJobAnalysis(user, analysis)) {
            logger.warn("Job analysisId {} already saved for userId {}", analysisId, userId);
            throw new ConflictException("Job analysis is already saved.");
        }

        SavedJob savedJob = new SavedJob(user, analysis, null);
        SavedJob saved = savedJobRepository.save(savedJob);
        logger.info("Job analysisId {} saved successfully for userId {}", analysisId, userId);
        return saved;
    }

    @Override
    @Transactional
    public void unsaveJob(Long analysisId, Long userId) {
        logger.info("Unsaving job analysisId: {} for userId: {}", analysisId, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        JobAnalysis analysis = jobHistoryRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Job analysis not found: " + analysisId));

        SavedJob savedJob = savedJobRepository.findByUserAndJobAnalysis(user, analysis)
                .orElseThrow(() -> new ResourceNotFoundException("Saved job not found for analysisId: " + analysisId));

        savedJobRepository.delete(savedJob);
        logger.info("Job analysisId {} unsaved successfully for userId {}", analysisId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobAnalysisDetailDTO> getSavedJobs(Long userId) {
        logger.info("Fetching saved jobs for userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<SavedJob> savedJobs = savedJobRepository.findByUserOrderBySavedAtDesc(user);

        List<JobAnalysisDetailDTO> result = new ArrayList<>();
        for (SavedJob sj : savedJobs) {
            JobAnalysis a = sj.getJobAnalysis();
            if (a != null && !a.isDeleted()) {
                result.add(mapToDetailDTO(a));
            }
        }
        return result;
    }

    private JobHistoryDTO mapToHistoryDTO(JobAnalysis j) {
        return new JobHistoryDTO(
                j.getAnalysisId(),
                j.getCompanyName(),
                j.getJobTitle(),
                j.getSalary(),
                j.getRiskLevel(),
                j.getRiskScore() != null ? j.getRiskScore() : 0,
                j.getScamPattern(),
                j.getEmployerStatus(),
                j.getSourceType(),
                j.getCreatedAt()
        );
    }

    private JobAnalysisDetailDTO mapToDetailDTO(JobAnalysis j) {
        return new JobAnalysisDetailDTO(
                j.getAnalysisId(),
                j.getCompanyName(),
                j.getJobTitle(),
                j.getSalary(),
                j.getRiskLevel(),
                j.getRiskScore() != null ? j.getRiskScore() : 0,
                j.getScamPattern(),
                j.getEmployerStatus(),
                j.getSourceType(),
                j.getCreatedAt(),
                j.getJobDescription(),
                j.getAiReason(),
                parseList(j.getRedFlags()),
                parseList(j.getRecommendedActions()),
                j.getConfidenceScore(),
                j.getSourceUrl()
        );
    }

    private List<String> parseList(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String trimmed = raw.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        if (trimmed.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(trimmed.split("[\",\\n;]+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.equals("\"") && !s.equals("[") && !s.equals("]"))
                .collect(Collectors.toList());
    }

    private String mapSortProperty(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return "createdAt";
        }
        switch (sortBy.toLowerCase()) {
            case "created_at":
            case "createdat":
            case "date":
                return "createdAt";
            case "company_name":
            case "companyname":
            case "company":
                return "companyName";
            case "job_title":
            case "jobtitle":
            case "title":
                return "jobTitle";
            case "risk_score":
            case "riskscore":
            case "score":
                return "riskScore";
            case "risk_level":
            case "risklevel":
                return "riskLevel";
            default:
                return "createdAt";
        }
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
