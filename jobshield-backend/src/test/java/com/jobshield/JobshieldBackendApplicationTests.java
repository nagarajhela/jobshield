package com.jobshield;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.jobshield.ai.GeminiService;
import com.jobshield.ai.dto.AiAnalysisResult;
import com.jobshield.auth.dto.LoginRequest;
import com.jobshield.auth.dto.RegisterRequest;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.auth.service.AuthService;
import com.jobshield.exception.AccountLockedException;
import com.jobshield.exception.AccountUnverifiedException;
import com.jobshield.exception.BadRequestException;
import com.jobshield.security.service.RateLimitingService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;

@SpringBootTest
class JobshieldBackendApplicationTests {

    @Autowired(required = false)
    private GeminiService geminiService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RateLimitingService rateLimitingService;

    @Test
    void contextLoads() {
    }

    @Test
    void testOpenRouterAiAnalysis() {
        if (geminiService != null) {
            AiAnalysisResult result = geminiService.analyzeJob(
                "Work from home. Earn $1000 daily. Send $100 registration fee via crypto."
            );
            System.out.println(">>> LIVE OPENROUTER RESULT: " + result.getRiskScore() + " | " + result.getRiskLevel() + " | " + result.getReason());
            assertNotNull(result);
            assertTrue(result.getRiskScore() > 0);
        }
    }

    @Test
    void testRegistrationVerificationAndLoginFlow() {
        String testEmail = "test_verify_" + UUID.randomUUID() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFirstName("Alice");
        registerReq.setLastName("Tester");
        registerReq.setEmail(testEmail);
        registerReq.setPassword("Password123!");
        registerReq.setPhoneNumber("1234567890");

        // 1. Register user
        String regMessage = authService.register(registerReq);
        assertTrue(regMessage.contains("check your email"));

        User user = userRepository.findByEmail(testEmail).orElseThrow();
        assertFalse(user.getEmailVerified());
        assertNotNull(user.getVerificationToken());
        assertNotNull(user.getTokenExpiry());

        // 2. Attempt login before email verification -> must throw AccountUnverifiedException (403)
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("Password123!");
        assertThrows(AccountUnverifiedException.class, () -> authService.login(loginReq));

        // 3. Verify email with token
        String verifyMsg = authService.verifyEmail(user.getVerificationToken());
        assertEquals("Email verified successfully!", verifyMsg);

        User verifiedUser = userRepository.findByEmail(testEmail).orElseThrow();
        assertTrue(verifiedUser.getEmailVerified());
        assertNull(verifiedUser.getVerificationToken());
        assertNull(verifiedUser.getTokenExpiry());

        // 4. Now login should succeed
        User loggedInUser = authService.login(loginReq);
        assertNotNull(loggedInUser);
        assertEquals(0, loggedInUser.getFailedLoginAttempts());

        // Cleanup
        userRepository.delete(loggedInUser);
    }

    @Test
    void testAccountLockoutFlow() {
        String testEmail = "test_lock_" + UUID.randomUUID() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFirstName("Bob");
        registerReq.setLastName("Security");
        registerReq.setEmail(testEmail);
        registerReq.setPassword("SecretPass123!");

        authService.register(registerReq);
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        authService.verifyEmail(user.getVerificationToken());

        LoginRequest wrongPass = new LoginRequest();
        wrongPass.setEmail(testEmail);
        wrongPass.setPassword("WrongPassword!");

        // 5 consecutive wrong passwords
        for (int i = 1; i <= 5; i++) {
            assertThrows(BadRequestException.class, () -> authService.login(wrongPass));
        }

        // Account must now be locked -> throws AccountLockedException (423)
        assertThrows(AccountLockedException.class, () -> authService.login(wrongPass));

        // Cleanup
        User lockedUser = userRepository.findByEmail(testEmail).orElseThrow();
        userRepository.delete(lockedUser);
    }

    @Test
    void testForgotPasswordAndResetFlow() {
        String testEmail = "test_reset_" + UUID.randomUUID() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFirstName("Charlie");
        registerReq.setLastName("Brown");
        registerReq.setEmail(testEmail);
        registerReq.setPassword("OldPassword123!");

        authService.register(registerReq);
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        authService.verifyEmail(user.getVerificationToken());

        // Forgot password
        String forgotMsg = authService.forgotPassword(testEmail);
        assertTrue(forgotMsg.contains("If that email exists"));

        User resetUser = userRepository.findByEmail(testEmail).orElseThrow();
        assertNotNull(resetUser.getResetToken());
        assertNotNull(resetUser.getResetTokenExpiry());

        // Reset password
        String resetMsg = authService.resetPassword(resetUser.getResetToken(), "BrandNewPassword123!");
        assertEquals("Password reset successfully!", resetMsg);

        // Login with new password
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("BrandNewPassword123!");
        User authenticated = authService.login(loginReq);
        assertNotNull(authenticated);

        // Cleanup
        userRepository.delete(authenticated);
    }

    @Test
    void testForgotPasswordRateLimiting() {
        String testEmail = "rate_limit_" + UUID.randomUUID() + "@example.com";

        // First 3 calls succeed
        assertTrue(rateLimitingService.tryConsumeForgotPassword(testEmail));
        assertTrue(rateLimitingService.tryConsumeForgotPassword(testEmail));
        assertTrue(rateLimitingService.tryConsumeForgotPassword(testEmail));

        // 4th call must be blocked by rate limit
        assertFalse(rateLimitingService.tryConsumeForgotPassword(testEmail));
    }

    @Autowired
    private com.jobshield.dashboard.DashboardService dashboardService;

    @Autowired
    private com.jobshield.jobs.JobHistoryService jobHistoryService;

    @Autowired
    private com.jobshield.jobs.JobHistoryRepository jobHistoryRepository;

    @Autowired
    private com.jobshield.saved.SavedJobRepository savedJobRepository;

    @Test
    void testDashboardStatsAndHistoryFlow() {
        String testEmail = "test_dash_" + UUID.randomUUID() + "@example.com";
        User user = new User();
        user.setFirstName("Dan");
        user.setLastName("Analyst");
        user.setEmail(testEmail);
        user.setPasswordHash("hashed_pwd_123");
        user.setRole("USER");
        user.setEmailVerified(true);
        user = userRepository.save(user);

        // 1. Initially 0 analyses -> safety score must be 100
        com.jobshield.dto.DashboardStatsDTO initialStats = dashboardService.getUserStats(user.getUserId());
        assertEquals(0, initialStats.getTotalAnalyses());
        assertEquals(100, initialStats.getSafetyScore());

        // 2. Create 3 analyses: 1 HIGH (90), 1 MEDIUM (50), 1 LOW (20)
        com.jobshield.jobs.entity.JobAnalysis ja1 = new com.jobshield.jobs.entity.JobAnalysis();
        ja1.setUser(user);
        ja1.setCompanyName("ScamCorp");
        ja1.setJobTitle("Data Entry Specialist");
        ja1.setJobDescription("Pay $200 upfront equipment fee.");
        ja1.setRiskScore(90);
        ja1.setRiskLevel("HIGH");
        ja1.setScamPattern("ADVANCE_FEE");
        ja1.setRedFlags("[\"Upfront fee\", \"Unverified recruiter\"]");
        ja1.setRecommendedActions("[\"Do not pay\", \"Report recruiter\"]");
        ja1 = jobHistoryRepository.save(ja1);

        com.jobshield.jobs.entity.JobAnalysis ja2 = new com.jobshield.jobs.entity.JobAnalysis();
        ja2.setUser(user);
        ja2.setCompanyName("ScamCorp");
        ja2.setJobTitle("Remote Assistant");
        ja2.setJobDescription("Wiring money transfer.");
        ja2.setRiskScore(50);
        ja2.setRiskLevel("MEDIUM");
        ja2.setScamPattern("ADVANCE_FEE");
        ja2 = jobHistoryRepository.save(ja2);

        com.jobshield.jobs.entity.JobAnalysis ja3 = new com.jobshield.jobs.entity.JobAnalysis();
        ja3.setUser(user);
        ja3.setCompanyName("GoodCo");
        ja3.setJobTitle("Software Engineer");
        ja3.setJobDescription("Full-time engineering position.");
        ja3.setRiskScore(20);
        ja3.setRiskLevel("LOW");
        ja3.setScamPattern("NONE");
        ja3 = jobHistoryRepository.save(ja3);

        // 3. Verify Dashboard stats
        com.jobshield.dto.DashboardStatsDTO stats = dashboardService.getUserStats(user.getUserId());
        assertEquals(3, stats.getTotalAnalyses());
        assertEquals(1, stats.getHighRiskCount());
        assertEquals(1, stats.getMediumRiskCount());
        assertEquals(1, stats.getLowRiskCount());
        // avg risk = (90 + 50 + 20) / 3 = 53.33 -> safetyScore = 100 - 53 = 47
        assertEquals(47, stats.getSafetyScore());
        assertEquals("ADVANCE_FEE", stats.getMostCommonScamPattern());
        assertEquals(3, stats.getRecentAnalyses().size());
        assertTrue(stats.getAnalysesThisMonth() >= 3);

        // 4. Test Job History pagination & filtering
        com.jobshield.dto.PagedResponseDTO<com.jobshield.dto.JobHistoryDTO> historyAll =
                jobHistoryService.getHistory(user.getUserId(), 0, 10, null, null, "created_at", "desc", null, null);
        assertEquals(3, historyAll.getTotalElements());
        assertEquals(3, historyAll.getContent().size());

        // Filter by riskLevel HIGH
        com.jobshield.dto.PagedResponseDTO<com.jobshield.dto.JobHistoryDTO> historyHigh =
                jobHistoryService.getHistory(user.getUserId(), 0, 10, "HIGH", null, "created_at", "desc", null, null);
        assertEquals(1, historyHigh.getTotalElements());
        assertEquals("ScamCorp", historyHigh.getContent().get(0).getCompanyName());

        // Search by company name
        com.jobshield.dto.PagedResponseDTO<com.jobshield.dto.JobHistoryDTO> historySearch =
                jobHistoryService.getHistory(user.getUserId(), 0, 10, null, "GoodCo", "created_at", "desc", null, null);
        assertEquals(1, historySearch.getTotalElements());
        assertEquals("GoodCo", historySearch.getContent().get(0).getCompanyName());

        // 5. Test Analysis Detail
        com.jobshield.dto.JobAnalysisDetailDTO detail = jobHistoryService.getAnalysisById(ja1.getAnalysisId(), user.getUserId());
        assertNotNull(detail);
        assertEquals("ScamCorp", detail.getCompanyName());
        assertEquals(2, detail.getRedFlags().size());
        assertEquals("Upfront fee", detail.getRedFlags().get(0));

        // 6. Test CSV Export
        byte[] csvBytes = jobHistoryService.exportCsv(user.getUserId());
        String csvString = new String(csvBytes, java.nio.charset.StandardCharsets.UTF_8);
        assertTrue(csvString.startsWith("Date,Company,Job Title,Risk Level,Risk Score,Scam Pattern"));
        assertTrue(csvString.contains("ScamCorp"));
        assertTrue(csvString.contains("GoodCo"));

        // 7. Test Saved Job Flow
        com.jobshield.saved.SavedJob saved = jobHistoryService.saveJob(ja1.getAnalysisId(), user.getUserId());
        assertNotNull(saved);

        // Duplicate save -> must throw ConflictException (409)
        final Long targetAnalysisId = ja1.getAnalysisId();
        final Long targetUserId = user.getUserId();
        assertThrows(com.jobshield.exception.ConflictException.class, () ->
                jobHistoryService.saveJob(targetAnalysisId, targetUserId));

        // Get saved jobs
        java.util.List<com.jobshield.dto.JobAnalysisDetailDTO> savedList = jobHistoryService.getSavedJobs(user.getUserId());
        assertEquals(1, savedList.size());
        assertEquals("ScamCorp", savedList.get(0).getCompanyName());

        // Unsave
        jobHistoryService.unsaveJob(ja1.getAnalysisId(), user.getUserId());
        assertEquals(0, jobHistoryService.getSavedJobs(user.getUserId()).size());

        // 8. Test Soft Delete
        jobHistoryService.softDeleteAnalysis(ja3.getAnalysisId(), user.getUserId());
        com.jobshield.dto.PagedResponseDTO<com.jobshield.dto.JobHistoryDTO> afterDelete =
                jobHistoryService.getHistory(user.getUserId(), 0, 10, null, null, "created_at", "desc", null, null);
        assertEquals(2, afterDelete.getTotalElements());

        // Cleanup
        jobHistoryRepository.deleteAll(java.util.List.of(ja1, ja2, ja3));
        userRepository.delete(user);
    }

    @Autowired
    private com.jobshield.jobs.UrlAnalyzerService urlAnalyzerService;

    @Autowired
    private com.jobshield.notification.NotificationRepository notificationRepository;

    @Autowired
    private com.jobshield.jobs.service.JobAnalysisService jobAnalysisService;

    @Test
    void testUrlAnalyzerValidation() {
        // Invalid URLs must throw BadRequestException (400)
        assertThrows(BadRequestException.class, () -> urlAnalyzerService.extractJobFromUrl(""));
        assertThrows(BadRequestException.class, () -> urlAnalyzerService.extractJobFromUrl("not-a-valid-url"));
        assertThrows(BadRequestException.class, () -> urlAnalyzerService.extractJobFromUrl("ftp://example.com"));

        // Valid URL extraction test against public domain
        com.jobshield.jobs.dto.ExtractedJobDTO extracted = urlAnalyzerService.extractJobFromUrl("https://example.com");
        assertNotNull(extracted);
        assertNotNull(extracted.getJobTitle());
        assertNotNull(extracted.getDescription());
        assertEquals("https://example.com", extracted.getSourceUrl());
    }

    @Test
    void testJobAnalysisEnrichedFieldsAndNotification() {
        String testEmail = "test_ai_" + UUID.randomUUID() + "@example.com";
        User user = new User();
        user.setFirstName("Eva");
        user.setLastName("Security");
        user.setEmail(testEmail);
        user.setPasswordHash("hashed_pwd_456");
        user.setRole("USER");
        user.setEmailVerified(true);
        user = userRepository.save(user);
        final Long userId = user.getUserId();

        // Authenticate as this user in SecurityContext
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        testEmail, null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
                )
        );

        com.jobshield.jobs.dto.AnalyzeJobRequest req = new com.jobshield.jobs.dto.AnalyzeJobRequest();
        req.setCompanyName("Scammy Corp");
        req.setJobTitle("Payment Processor");
        req.setSalary("$5000/week");
        req.setJobDescription("Work from home. Send $200 processing fee via Bitcoin before receiving check.");

        com.jobshield.jobs.dto.AnalyzeJobResponse resp = jobAnalysisService.analyzeJob(req);
        assertNotNull(resp);
        assertNotNull(resp.getRiskLevel());

        // Check JobAnalysis saved in DB
        java.util.List<com.jobshield.jobs.entity.JobAnalysis> list = jobHistoryRepository.findByUser_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        assertFalse(list.isEmpty());
        com.jobshield.jobs.entity.JobAnalysis savedAnalysis = list.get(0);
        assertNotNull(savedAnalysis.getConfidenceScore());
        assertNotNull(savedAnalysis.getEmployerStatus());
        assertNotNull(savedAnalysis.getScamPattern());
        assertNotNull(savedAnalysis.getRedFlags());
        assertNotNull(savedAnalysis.getRecommendedActions());
        assertEquals("MANUAL", savedAnalysis.getSourceType());

        // If risk level was HIGH, verify notification was dispatched
        if ("HIGH".equalsIgnoreCase(savedAnalysis.getRiskLevel())) {
            java.util.List<com.jobshield.notification.Notification> notifications = notificationRepository.findAll();
            boolean hasHighRiskNotif = notifications.stream().anyMatch(n ->
                    n.getUser().getUserId().equals(userId) && "HIGH_RISK_DETECTED".equals(n.getType()));
            assertTrue(hasHighRiskNotif);
        }

        // Cleanup
        jobHistoryRepository.delete(savedAnalysis);
        notificationRepository.deleteAll(notificationRepository.findAll().stream()
                .filter(n -> n.getUser().getUserId().equals(userId)).toList());
        userRepository.delete(user);
    }
}
