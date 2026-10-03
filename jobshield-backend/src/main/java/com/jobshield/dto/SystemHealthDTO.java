package com.jobshield.dto;

import java.time.LocalDateTime;

public class SystemHealthDTO {

    private String database;
    private String aiService;
    private String overallStatus;
    private LocalDateTime checkedAt;

    public SystemHealthDTO() {
    }

    public SystemHealthDTO(String database, String aiService, String overallStatus, LocalDateTime checkedAt) {
        this.database = database;
        this.aiService = aiService;
        this.overallStatus = overallStatus;
        this.checkedAt = checkedAt;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getAiService() {
        return aiService;
    }

    public void setAiService(String aiService) {
        this.aiService = aiService;
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public LocalDateTime getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(LocalDateTime checkedAt) {
        this.checkedAt = checkedAt;
    }
}
