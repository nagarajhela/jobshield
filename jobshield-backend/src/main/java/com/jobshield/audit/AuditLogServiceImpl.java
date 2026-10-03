package com.jobshield.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void log(Long userId, String action, String ipAddress, String userAgent, String status, String metadata) {
        logger.info("Audit log: action={}, userId={}, status={}, ip={}", action, userId, status, ipAddress);

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        AuditLog auditLog = new AuditLog(user, action, ipAddress, userAgent, status, metadata);
        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional
    public void logFromRequest(Long userId, String action, HttpServletRequest request, String status, String metadata) {
        String ipAddress = "127.0.0.1";
        String userAgent = "Unknown";

        if (request != null) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                ipAddress = forwarded.split(",")[0].trim();
            } else if (request.getRemoteAddr() != null) {
                ipAddress = request.getRemoteAddr();
            }
            String ua = request.getHeader("User-Agent");
            if (ua != null && !ua.isBlank()) {
                userAgent = ua.length() > 500 ? ua.substring(0, 500) : ua;
            }
        }

        log(userId, action, ipAddress, userAgent, status, metadata);
    }
}
