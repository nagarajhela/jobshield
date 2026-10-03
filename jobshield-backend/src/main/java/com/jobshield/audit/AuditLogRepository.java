package com.jobshield.audit;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobshield.auth.entity.User;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserOrderByCreatedAtDesc(User user);

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    List<AuditLog> findByIpAddressOrderByCreatedAtDesc(String ipAddress);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.user.userId = :userId) " +
           "AND (:action IS NULL OR a.action = :action)")
    Page<AuditLog> findAuditLogs(
            @Param("userId") Long userId,
            @Param("action") String action,
            Pageable pageable
    );

    Page<AuditLog> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<AuditLog> findByIpAddressAndActionAndCreatedAtAfter(String ipAddress, String action, java.time.LocalDateTime after);

    long countByIpAddressAndActionAndCreatedAtAfter(String ipAddress, String action, java.time.LocalDateTime after);
}
