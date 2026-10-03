package com.jobshield.auth.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobshield.audit.AuditLogService;
import com.jobshield.auth.dto.ChangePasswordRequest;
import com.jobshield.auth.dto.EmailRequest;
import com.jobshield.auth.dto.LoginRequest;
import com.jobshield.auth.dto.LoginResponse;
import com.jobshield.auth.dto.RegisterRequest;
import com.jobshield.auth.dto.ResetPasswordRequest;
import com.jobshield.auth.dto.UpdateProfileRequest;
import com.jobshield.auth.dto.UserProfileResponse;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.auth.service.AuthService;
import com.jobshield.auth.service.UserService;
import com.jobshield.config.RateLimitService;
import com.jobshield.exception.BadRequestException;
import com.jobshield.exception.RateLimitExceededException;
import com.jobshield.security.jwt.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserService userService;
    private final JwtService jwtService;
    private final RateLimitService rateLimitService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService,
                          UserService userService,
                          JwtService jwtService,
                          RateLimitService rateLimitService,
                          AuditLogService auditLogService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userService = userService;
        this.jwtService = jwtService;
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody RegisterRequest request) {
        logger.info("Register request received for: {}", request.getEmail());
        String message = authService.register(request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        logger.info("Login request received for: {}", request.getEmail());

        String clientIp = extractClientIp(httpRequest);
        boolean allowed = rateLimitService.isAllowed(clientIp, RateLimitService.LOGIN_LIMIT);
        if (!allowed) {
            logger.warn("Rate limit exceeded for login on IP: {}", clientIp);
            auditLogService.logFromRequest(null, "LOGIN_FAILED", httpRequest, "FAILURE", "Rate limit exceeded for IP: " + clientIp);
            throw new RateLimitExceededException("Too many login attempts. Please wait 15 minutes.");
        }

        try {
            User user = authService.login(request);
            String token = jwtService.generateToken(user);
            UserProfileResponse userProfile = new UserProfileResponse(
                    user.getUserId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole()
            );

            auditLogService.logFromRequest(user.getUserId(), "LOGIN_SUCCESS", httpRequest, "SUCCESS", "User login successful");
            return ResponseEntity.ok(new LoginResponse(token, userProfile));
        } catch (Exception e) {
            auditLogService.logFromRequest(null, "LOGIN_FAILED", httpRequest, "FAILURE", "Login failed for email: " + request.getEmail());
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest httpRequest) {
        logger.info("Logout request received");
        Long userId = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                User user = userRepository.findByEmail(authentication.getName()).orElse(null);
                if (user != null) {
                    userId = user.getUserId();
                }
            }
        } catch (Exception ignored) {
        }

        auditLogService.logFromRequest(userId, "LOGOUT", httpRequest, "SUCCESS", "User logged out");
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        logger.info("Email verification request received with token");
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/dev-verify")
    public ResponseEntity<Map<String, Object>> devVerify(@RequestParam("email") String email) {
        logger.info("Direct verification requested for email: {}", email);
        authService.directVerifyEmail(email);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email verified successfully for " + email + ". You can now log in!"
        ));
    }

    @GetMapping("/dev-make-admin")
    public ResponseEntity<Map<String, Object>> devMakeAdmin(@RequestParam("email") String email) {
        logger.info("Direct admin promotion requested for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));
        user.setRole("ROLE_ADMIN");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User " + email + " is now an ADMIN! Please re-login to refresh your session token."
        ));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@Valid @RequestBody EmailRequest request) {
        logger.info("Resend verification requested for: {}", request.getEmail());
        String message = authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody EmailRequest request, HttpServletRequest httpRequest) {
        logger.info("Forgot password requested for: {}", request.getEmail());

        boolean allowed = rateLimitService.isAllowed(request.getEmail(), RateLimitService.FORGOT_PASSWORD_LIMIT);
        if (!allowed) {
            logger.warn("Rate limit exceeded for forgot password on email: {}", request.getEmail());
            throw new RateLimitExceededException("Too many password reset requests. Please try again in an hour.");
        }

        String message = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest httpRequest) {
        logger.info("Reset password submission received");
        String message = authService.resetPassword(request.getToken(), request.getNewPassword());
        auditLogService.logFromRequest(null, "PASSWORD_RESET", httpRequest, "SUCCESS", "Password reset successfully");
        return ResponseEntity.ok(message);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByEmail(authentication.getName());

        UserProfileResponse response = new UserProfileResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByEmail(authentication.getName());

        if (updateRequest.getFirstName() != null && !updateRequest.getFirstName().isBlank()) {
            user.setFirstName(updateRequest.getFirstName().trim());
        }
        if (updateRequest.getLastName() != null && !updateRequest.getLastName().isBlank()) {
            user.setLastName(updateRequest.getLastName().trim());
        }
        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber().trim());
        }

        userRepository.save(user);

        UserProfileResponse response = new UserProfileResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByEmail(authentication.getName());

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logFromRequest(user.getUserId(), "PASSWORD_CHANGED", httpRequest, "SUCCESS", "Password changed successfully");
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}