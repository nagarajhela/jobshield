package com.jobshield.jobs;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobshield.jobs.entity.JobAnalysis;

@Repository
public interface JobHistoryRepository extends JpaRepository<JobAnalysis, Long> {

    @Query("SELECT j FROM JobAnalysis j WHERE " +
           "j.user.userId = :userId " +
           "AND j.isDeleted = false " +
           "AND (:riskLevel IS NULL OR j.riskLevel = :riskLevel) " +
           "AND (CAST(:search AS string) IS NULL OR " +
           "     LOWER(j.companyName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "     LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (CAST(:startDate AS java.time.LocalDateTime) IS NULL OR j.createdAt >= :startDate) " +
           "AND (CAST(:endDate AS java.time.LocalDateTime) IS NULL OR j.createdAt <= :endDate)")
    Page<JobAnalysis> findUserHistory(
            @Param("userId") Long userId,
            @Param("riskLevel") String riskLevel,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT j.scamPattern, COUNT(j) as cnt " +
           "FROM JobAnalysis j " +
           "WHERE j.user.userId = :userId " +
           "AND j.isDeleted = false " +
           "AND j.scamPattern IS NOT NULL " +
           "GROUP BY j.scamPattern " +
           "ORDER BY cnt DESC")
    List<Object[]> findMostCommonScamPattern(@Param("userId") Long userId);

    @Query("SELECT COUNT(j) FROM JobAnalysis j " +
           "WHERE j.user.userId = :userId " +
           "AND j.isDeleted = false " +
           "AND j.createdAt >= :startOfMonth")
    int countAnalysesThisMonth(
            @Param("userId") Long userId,
            @Param("startOfMonth") LocalDateTime startOfMonth
    );

    Optional<JobAnalysis> findByAnalysisIdAndUser_UserIdAndIsDeletedFalse(Long analysisId, Long userId);

    List<JobAnalysis> findByUser_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    List<JobAnalysis> findTop5ByUser_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    int countByUser_UserIdAndIsDeletedFalse(Long userId);

    int countByUser_UserIdAndRiskLevelAndIsDeletedFalse(Long userId, String riskLevel);

    @Query("SELECT AVG(j.riskScore) FROM JobAnalysis j WHERE j.user.userId = :userId AND j.isDeleted = false AND j.riskScore IS NOT NULL")
    Double getAverageRiskScore(@Param("userId") Long userId);

    long countByCreatedAtGreaterThanEqual(LocalDateTime date);

    long countByCreatedAtGreaterThanEqualAndRiskLevel(LocalDateTime date, String riskLevel);

    @Query("SELECT j FROM JobAnalysis j WHERE " +
           "(:userId IS NULL OR j.user.userId = :userId) AND " +
           "(:riskLevel IS NULL OR j.riskLevel = :riskLevel) AND " +
           "j.isDeleted = false")
    Page<JobAnalysis> findAllAnalysesSystemWide(
            @Param("userId") Long userId,
            @Param("riskLevel") String riskLevel,
            Pageable pageable
    );

    long countByRiskLevelAndIsDeletedFalse(String riskLevel);

    List<JobAnalysis> findByRiskLevelAndIsDeletedFalseOrderByCreatedAtDesc(String riskLevel);
}
