package com.jobshield.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobshield.audit.AuditLog;
import com.jobshield.audit.AuditLogRepository;
import com.jobshield.audit.AuditLogService;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.campaign.repository.ScamCampaignRepository;
import com.jobshield.dto.AdminOverviewDTO;
import com.jobshield.dto.AdminUserDTO;
import com.jobshield.dto.AdminUserDetailDTO;
import com.jobshield.dto.AuditLogDTO;
import com.jobshield.dto.JobHistoryDTO;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.dto.RecentAnalysisDTO;
import com.jobshield.dto.SystemHealthDTO;
import com.jobshield.exception.BadRequestException;
import com.jobshield.exception.ResourceNotFoundException;
import com.jobshield.jobs.JobHistoryRepository;
import com.jobshield.jobs.entity.JobAnalysis;

import jakarta.persistence.EntityManager;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "SUSPENDED", "BANNED");
    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "ANALYST", "ADMIN", "RECRUITER");

    private final UserRepository userRepository;
    private final JobHistoryRepository jobHistoryRepository;
    private final ScamCampaignRepository scamCampaignRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final EntityManager entityManager;

    public AdminServiceImpl(
            UserRepository userRepository,
            JobHistoryRepository jobHistoryRepository,
            ScamCampaignRepository scamCampaignRepository,
            AuditLogRepository auditLogRepository,
            AuditLogService auditLogService,
            EntityManager entityManager) {
        this.userRepository = userRepository;
        this.jobHistoryRepository = jobHistoryRepository;
        this.scamCampaignRepository = scamCampaignRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOverviewDTO getSystemOverview() {
        logger.info("Admin: Fetching system overview metrics");

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtGreaterThanEqual(startOfToday);

        long totalAnalyses = jobHistoryRepository.count();
        long analysesToday = jobHistoryRepository.countByCreatedAtGreaterThanEqual(startOfToday);
        long highRiskToday = jobHistoryRepository.countByCreatedAtGreaterThanEqualAndRiskLevel(startOfToday, "HIGH");

        long activeCampaigns = scamCampaignRepository.count();
        long pendingReports = 0;
        String systemStatus = "HEALTHY";

        AdminOverviewDTO dto = new AdminOverviewDTO(
                totalUsers,
                newUsersToday,
                totalAnalyses,
                analysesToday,
                highRiskToday,
                activeCampaigns,
                pendingReports,
                systemStatus
        );

        long low = jobHistoryRepository.countByRiskLevelAndIsDeletedFalse("LOW");
        long med = jobHistoryRepository.countByRiskLevelAndIsDeletedFalse("MEDIUM");
        long high = jobHistoryRepository.countByRiskLevelAndIsDeletedFalse("HIGH");
        dto.setLowRiskCount(low);
        dto.setMediumRiskCount(med);
        dto.setHighRiskCount(high);

        List<JobAnalysis> highRiskAnalyses = jobHistoryRepository.findByRiskLevelAndIsDeletedFalseOrderByCreatedAtDesc("HIGH");
        List<java.util.Map<String, Object>> recentList = highRiskAnalyses.stream()
                .map(j -> java.util.Map.of(
                        "analysisId", (Object) j.getAnalysisId(),
                        "companyName", j.getCompanyName() != null ? j.getCompanyName() : "Unknown",
                        "jobTitle", j.getJobTitle() != null ? j.getJobTitle() : "Position",
                        "riskScore", j.getRiskScore() != null ? j.getRiskScore() : 90,
                        "riskLevel", j.getRiskLevel() != null ? j.getRiskLevel() : "HIGH",
                        "userEmail", (j.getUser() != null && j.getUser().getEmail() != null) ? j.getUser().getEmail() : "anonymous",
                        "createdAt", j.getCreatedAt() != null ? j.getCreatedAt().toString() : LocalDateTime.now().toString()
                ))
                .collect(Collectors.toList());
        dto.setRecentHighRiskAnalyses(recentList);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<AdminUserDTO> getAllUsers(int page, int size, String search) {
        logger.info("Admin: Fetching users page={}, size={}, search='{}'", page, size, search);

        String searchPattern = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> userPage = userRepository.findUsers(searchPattern, pageable);

        List<AdminUserDTO> dtoList = userPage.getContent().stream()
                .map(this::mapToAdminUserDTO)
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                dtoList,
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.getNumber(),
                userPage.getSize(),
                userPage.isFirst(),
                userPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDetailDTO getUserById(Long userId) {
        logger.info("Admin: Fetching user details for userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        int totalAnalyses = jobHistoryRepository.countByUser_UserIdAndIsDeletedFalse(userId);
        List<JobAnalysis> recentEntities = jobHistoryRepository.findTop5ByUser_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);

        List<RecentAnalysisDTO> recentAnalyses = recentEntities.stream()
                .map(j -> new RecentAnalysisDTO(
                        j.getAnalysisId(),
                        j.getCompanyName(),
                        j.getJobTitle(),
                        j.getRiskLevel(),
                        j.getRiskScore() != null ? j.getRiskScore() : 0,
                        j.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new AdminUserDetailDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountStatus(),
                Boolean.TRUE.equals(user.getEmailVerified()),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                totalAnalyses,
                user.getPhoneNumber(),
                user.getFailedLoginAttempts(),
                user.getLockedUntil(),
                user.getLastLoginIp(),
                recentAnalyses
        );
    }

    @Override
    @Transactional
    public AdminUserDTO updateUserStatus(Long userId, String status) {
        if (status == null || !ALLOWED_STATUSES.contains(status.trim().toUpperCase())) {
            throw new BadRequestException("Invalid status. Allowed values: ACTIVE, SUSPENDED, BANNED");
        }
        String cleanStatus = status.trim().toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Security check: cannot suspend or ban another ADMIN
        if (user.getRole() != null && user.getRole().toUpperCase().contains("ADMIN") && !cleanStatus.equals("ACTIVE")) {
            throw new BadRequestException("Cannot suspend or ban another ADMIN");
        }

        user.setAccountStatus(cleanStatus);
        User updated = userRepository.save(user);

        Long currentAdminId = getCurrentAdminId();
        auditLogService.log(
                userId,
                "ACCOUNT_DEACTIVATED",
                "127.0.0.1",
                "System Admin",
                "SUCCESS",
                "Status changed to " + cleanStatus + " by admin " + currentAdminId
        );

        return mapToAdminUserDTO(updated);
    }

    @Override
    @Transactional
    public AdminUserDTO updateUserRole(Long userId, String role) {
        if (role == null || !ALLOWED_ROLES.contains(role.trim().toUpperCase())) {
            throw new BadRequestException("Invalid role. Allowed values: USER, ANALYST, ADMIN");
        }
        String cleanRole = role.trim().toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(cleanRole);
        User updated = userRepository.save(user);

        Long currentAdminId = getCurrentAdminId();
        auditLogService.log(
                userId,
                "ROLE_CHANGED",
                "127.0.0.1",
                "System Admin",
                "SUCCESS",
                "Role changed to " + cleanRole + " by admin " + currentAdminId
        );

        return mapToAdminUserDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<JobHistoryDTO> getAllAnalyses(int page, int size, String riskLevel, Long userId) {
        logger.info("Admin: Fetching all analyses page={}, size={}, riskLevel={}, userId={}", page, size, riskLevel, userId);

        String filterRisk = (riskLevel != null && !riskLevel.isBlank() && !riskLevel.equalsIgnoreCase("ALL"))
                ? riskLevel.trim().toUpperCase() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<JobAnalysis> pageResult = jobHistoryRepository.findAllAnalysesSystemWide(userId, filterRisk, pageable);

        List<JobHistoryDTO> content = pageResult.getContent().stream()
                .map(j -> new JobHistoryDTO(
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
                ))
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
    public PagedResponseDTO<AuditLogDTO> getAuditLogs(int page, int size, String action, Long userId) {
        logger.info("Admin: Fetching audit logs page={}, size={}, action={}, userId={}", page, size, action, userId);

        String filterAction = (action != null && !action.isBlank()) ? action.trim().toUpperCase() : null;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AuditLog> pageResult = auditLogRepository.findAuditLogs(userId, filterAction, pageable);

        List<AuditLogDTO> content = pageResult.getContent().stream()
                .map(a -> new AuditLogDTO(
                        a.getLogId(),
                        a.getUser() != null ? a.getUser().getUserId() : null,
                        a.getUser() != null ? a.getUser().getEmail() : "system",
                        a.getAction(),
                        a.getIpAddress(),
                        a.getStatus(),
                        a.getMetadata(),
                        a.getCreatedAt()
                ))
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
    public SystemHealthDTO getSystemHealth() {
        String dbStatus = "HEALTHY";
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
        } catch (Exception e) {
            logger.error("Database health check failed", e);
            dbStatus = "UNHEALTHY";
        }

        String aiStatus = "HEALTHY";
        String overall = (dbStatus.equals("HEALTHY") && aiStatus.equals("HEALTHY")) ? "HEALTHY" : "DEGRADED";

        return new SystemHealthDTO(
                dbStatus,
                aiStatus,
                overall,
                LocalDateTime.now()
        );
    }

    private AdminUserDTO mapToAdminUserDTO(User user) {
        int totalAnalyses = jobHistoryRepository.countByUser_UserIdAndIsDeletedFalse(user.getUserId());
        return new AdminUserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountStatus(),
                Boolean.TRUE.equals(user.getEmailVerified()),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                totalAnalyses
        );
    }

    private Long getCurrentAdminId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return userRepository.findByEmail(auth.getName())
                        .map(User::getUserId)
                        .orElse(null);
            }
        } catch (Exception ignored) {}
        return null;
    }

    @Override
    @Transactional
    public void deleteAnalysis(Long analysisId) {
        logger.info("Admin deleting analysis id: {}", analysisId);
        if (!jobHistoryRepository.existsById(analysisId)) {
            throw new ResourceNotFoundException("Analysis not found with id: " + analysisId);
        }
        jobHistoryRepository.deleteById(analysisId);
        auditLogService.log(
                getCurrentAdminId(),
                "ANALYSIS_DELETED",
                "127.0.0.1",
                "System Admin",
                "SUCCESS",
                "Analysis #" + analysisId + " permanently deleted by admin"
        );
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        logger.info("Admin deleting user id: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
        auditLogService.log(
                getCurrentAdminId(),
                "USER_DELETED",
                "127.0.0.1",
                "System Admin",
                "SUCCESS",
                "User #" + userId + " permanently deleted by admin"
        );
    }
}
