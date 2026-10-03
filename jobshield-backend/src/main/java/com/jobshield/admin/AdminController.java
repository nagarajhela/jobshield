package com.jobshield.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobshield.dto.AdminOverviewDTO;
import com.jobshield.dto.AdminUserDTO;
import com.jobshield.dto.AdminUserDetailDTO;
import com.jobshield.dto.AuditLogDTO;
import com.jobshield.dto.JobHistoryDTO;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.dto.SystemHealthDTO;
import com.jobshield.dto.UpdateRoleRequest;
import com.jobshield.dto.UpdateStatusRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewDTO> getOverview() {
        logger.info("Admin endpoint: GET /api/admin/overview");
        AdminOverviewDTO overview = adminService.getSystemOverview();
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/users")
    public ResponseEntity<PagedResponseDTO<AdminUserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {

        logger.info("Admin endpoint: GET /api/admin/users (page={}, size={}, search='{}')", page, size, search);
        PagedResponseDTO<AdminUserDTO> users = adminService.getAllUsers(page, size, search);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDetailDTO> getUserById(@PathVariable Long id) {
        logger.info("Admin endpoint: GET /api/admin/users/{}", id);
        AdminUserDetailDTO user = adminService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {

        logger.info("Admin endpoint: PUT /api/admin/users/{}/status -> {}", id, request.getStatus());
        AdminUserDTO updated = adminService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {

        logger.info("Admin endpoint: PUT /api/admin/users/{}/role -> {}", id, request.getRole());
        AdminUserDTO updated = adminService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/analyses")
    public ResponseEntity<PagedResponseDTO<JobHistoryDTO>> getAllAnalyses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) Long userId) {

        logger.info("Admin endpoint: GET /api/admin/analyses (page={}, size={}, riskLevel={}, userId={})", page, size, riskLevel, userId);
        PagedResponseDTO<JobHistoryDTO> analyses = adminService.getAllAnalyses(page, size, riskLevel, userId);
        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<PagedResponseDTO<AuditLogDTO>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId) {

        logger.info("Admin endpoint: GET /api/admin/audit-logs (page={}, size={}, action={}, userId={})", page, size, action, userId);
        PagedResponseDTO<AuditLogDTO> logs = adminService.getAuditLogs(page, size, action, userId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/system-health")
    public ResponseEntity<SystemHealthDTO> getSystemHealth() {
        logger.info("Admin endpoint: GET /api/admin/system-health");
        SystemHealthDTO health = adminService.getSystemHealth();
        return ResponseEntity.ok(health);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/analyses/{id}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable Long id) {
        logger.info("Admin endpoint: DELETE /api/admin/analyses/{}", id);
        adminService.deleteAnalysis(id);
        return ResponseEntity.noContent().build();
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("Admin endpoint: DELETE /api/admin/users/{}", id);
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
