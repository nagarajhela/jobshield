package com.jobshield.dto;

import java.time.LocalDateTime;

public class AuditLogDTO {

    private Long logId;
    private Long userId;
    private String userEmail;
    private String action;
    private String ipAddress;
    private String status;
    private String metadata;
    private LocalDateTime createdAt;

    public AuditLogDTO() {
    }

    public AuditLogDTO(Long logId, Long userId, String userEmail, String action, String ipAddress,
                       String status, String metadata, LocalDateTime createdAt) {
        this.logId = logId;
        this.userId = userId;
        this.userEmail = userEmail;
        this.action = action;
        this.ipAddress = ipAddress;
        this.status = status;
        this.metadata = metadata;
        this.createdAt = createdAt;
    }

    public Long getLogId() {
        return logId;
    }

    public void setLogId(Long logId) {
        this.logId = logId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
