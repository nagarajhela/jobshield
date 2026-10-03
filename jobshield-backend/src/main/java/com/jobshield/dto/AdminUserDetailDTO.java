package com.jobshield.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AdminUserDetailDTO extends AdminUserDTO {

    private String phoneNumber;
    private int failedLoginAttempts;
    private LocalDateTime lockedUntil;
    private String lastLoginIp;
    private List<RecentAnalysisDTO> recentAnalyses;

    public AdminUserDetailDTO() {
        super();
    }

    public AdminUserDetailDTO(Long userId, String firstName, String lastName, String email, String role,
                              String accountStatus, boolean emailVerified, LocalDateTime createdAt,
                              LocalDateTime lastLoginAt, int totalAnalyses, String phoneNumber,
                              int failedLoginAttempts, LocalDateTime lockedUntil, String lastLoginIp,
                              List<RecentAnalysisDTO> recentAnalyses) {
        super(userId, firstName, lastName, email, role, accountStatus, emailVerified, createdAt, lastLoginAt, totalAnalyses);
        this.phoneNumber = phoneNumber;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockedUntil = lockedUntil;
        this.lastLoginIp = lastLoginIp;
        this.recentAnalyses = recentAnalyses;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public String getLastLoginIp() {
        return lastLoginIp;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public List<RecentAnalysisDTO> getRecentAnalyses() {
        return recentAnalyses;
    }

    public void setRecentAnalyses(List<RecentAnalysisDTO> recentAnalyses) {
        this.recentAnalyses = recentAnalyses;
    }
}
