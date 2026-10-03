package com.jobshield.audit;

import jakarta.servlet.http.HttpServletRequest;

public interface AuditLogService {

    void log(Long userId, String action, String ipAddress, String userAgent, String status, String metadata);

    void logFromRequest(Long userId, String action, HttpServletRequest request, String status, String metadata);
}
