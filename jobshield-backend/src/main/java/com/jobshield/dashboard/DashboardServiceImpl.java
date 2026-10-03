package com.jobshield.dashboard;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobshield.dto.DashboardStatsDTO;
import com.jobshield.dto.RecentAnalysisDTO;
import com.jobshield.jobs.JobHistoryRepository;
import com.jobshield.jobs.entity.JobAnalysis;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final JobHistoryRepository jobHistoryRepository;

    public DashboardServiceImpl(JobHistoryRepository jobHistoryRepository) {
        this.jobHistoryRepository = jobHistoryRepository;
    }

    @Override
    public DashboardStatsDTO getUserStats(Long userId) {
        logger.info("Computing dashboard statistics for userId: {}", userId);

        int totalAnalyses = jobHistoryRepository.countByUser_UserIdAndIsDeletedFalse(userId);
        int highRiskCount = jobHistoryRepository.countByUser_UserIdAndRiskLevelAndIsDeletedFalse(userId, "HIGH");
        int mediumRiskCount = jobHistoryRepository.countByUser_UserIdAndRiskLevelAndIsDeletedFalse(userId, "MEDIUM");
        int lowRiskCount = jobHistoryRepository.countByUser_UserIdAndRiskLevelAndIsDeletedFalse(userId, "LOW");

        // Safety score calculation: 100 - (average risk score of all user analyses)
        // If no analyses yet: return 100
        int safetyScore = 100;
        if (totalAnalyses > 0) {
            Double avgRisk = jobHistoryRepository.getAverageRiskScore(userId);
            if (avgRisk != null) {
                safetyScore = (int) Math.round(100.0 - avgRisk);
                if (safetyScore < 0) safetyScore = 0;
                if (safetyScore > 100) safetyScore = 100;
            }
        }

        // Most common scam pattern: GROUP BY scam_pattern ORDER BY count DESC LIMIT 1
        String mostCommonScamPattern = null;
        List<Object[]> patterns = jobHistoryRepository.findMostCommonScamPattern(userId);
        if (!patterns.isEmpty() && patterns.get(0) != null && patterns.get(0)[0] != null) {
            mostCommonScamPattern = patterns.get(0)[0].toString();
        }

        int analysesThisMonth = getAnalysesThisMonth(userId);

        // Recent 5 analyses
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

        logger.info("Dashboard stats computed for user {}: total={}, safetyScore={}, scamPattern={}",
                userId, totalAnalyses, safetyScore, mostCommonScamPattern);

        return new DashboardStatsDTO(
                totalAnalyses,
                highRiskCount,
                mediumRiskCount,
                lowRiskCount,
                safetyScore,
                mostCommonScamPattern,
                analysesThisMonth,
                recentAnalyses
        );
    }

    @Override
    public int getAnalysesThisMonth(Long userId) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        return jobHistoryRepository.countAnalysesThisMonth(userId, startOfMonth);
    }
}
