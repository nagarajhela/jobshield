package com.jobshield.admin;

import com.jobshield.dto.AdminOverviewDTO;
import com.jobshield.dto.AdminUserDTO;
import com.jobshield.dto.AdminUserDetailDTO;
import com.jobshield.dto.AuditLogDTO;
import com.jobshield.dto.JobHistoryDTO;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.dto.SystemHealthDTO;

public interface AdminService {

    AdminOverviewDTO getSystemOverview();

    PagedResponseDTO<AdminUserDTO> getAllUsers(int page, int size, String search);

    AdminUserDetailDTO getUserById(Long userId);

    AdminUserDTO updateUserStatus(Long userId, String status);

    AdminUserDTO updateUserRole(Long userId, String role);

    PagedResponseDTO<JobHistoryDTO> getAllAnalyses(int page, int size, String riskLevel, Long userId);

    PagedResponseDTO<AuditLogDTO> getAuditLogs(int page, int size, String action, Long userId);

    SystemHealthDTO getSystemHealth();

    void deleteAnalysis(Long analysisId);

    void deleteUser(Long userId);
}
