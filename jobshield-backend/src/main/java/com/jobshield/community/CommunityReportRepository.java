package com.jobshield.community;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobshield.auth.entity.User;

@Repository
public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {

    List<CommunityReport> findByStatusOrderByCreatedAtDesc(String status);

    List<CommunityReport> findByReporterOrderByCreatedAtDesc(User reporter);

    List<CommunityReport> findByCompanyNameContainingIgnoreCaseOrderByCreatedAtDesc(String companyName);

    org.springframework.data.domain.Page<CommunityReport> findByStatus(String status, org.springframework.data.domain.Pageable pageable);

    long countByStatus(String status);

    org.springframework.data.domain.Page<CommunityReport> findByReporter_UserId(Long userId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM CommunityReport c WHERE c.reporter.userId = :userId")
    org.springframework.data.domain.Page<CommunityReport> findByReporterUserId(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);
}
