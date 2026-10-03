package com.jobshield.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobshield.auth.dto.LoginRequest;
import com.jobshield.auth.dto.RegisterRequest;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.auth.service.AuthService;
import com.jobshield.email.EmailService;
import com.jobshield.exception.AccountLockedException;
import com.jobshield.exception.AccountUnverifiedException;
import com.jobshield.exception.BadRequestException;
import com.jobshield.exception.ResourceNotFoundException;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        logger.info("Processing user registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("ROLE_USER");
        user.setAccountStatus("ACTIVE");
        user.setEmailVerified(false);

        // Generate UUID verification token valid for 24 hours
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(user);
        logger.info("User registered successfully. Generated verification token for user ID: {}", user.getUserId());

        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);

        return "Registration successful. Please check your email to verify your account.";
    }

    @Override
    @Transactional
    public String verifyEmail(String token) {
        logger.info("Processing email verification for token");

        if (token == null || token.isBlank()) {
            throw new BadRequestException("Verification token is required");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("Verification token expired for user: {}", user.getEmail());
            throw new BadRequestException("Token expired. Please request a new verification email.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);

        userRepository.save(user);
        logger.info("Email verified successfully for user: {}", user.getEmail());

        return "Email verified successfully!";
    }

    @Override
    @Transactional
    public void directVerifyEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
        logger.info("Directly verified email for user: {}", email);
    }

    @Override
    @Transactional
    public String resendVerification(String email) {
        logger.info("Processing resend verification for email: {}", email);

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email already verified");
        }

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(user);
        logger.info("New verification token generated for email: {}", email);

        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), token);

        return "Verification email resent.";
    }

    @Override
    @Transactional
    public String forgotPassword(String email) {
        logger.info("Processing forgot password request for email: {}", email);

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);

        // Security: do NOT reveal if email exists
        if (optionalUser.isEmpty()) {
            logger.info("Forgot password requested for non-existent email: {}", email);
            return "If that email exists, a reset link has been sent.";
        }

        User user = optionalUser.get();
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));

        userRepository.save(user);
        logger.info("Password reset token generated for user: {}", user.getEmail());

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetToken);

        return "If that email exists, a reset link has been sent.";
    }

    @Override
    @Transactional
    public String resetPassword(String token, String newPassword) {
        logger.info("Processing password reset via token");

        if (token == null || token.isBlank()) {
            throw new BadRequestException("Reset token is required");
        }

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid password reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("Password reset token expired for user: {}", user.getEmail());
            throw new BadRequestException("Password reset token expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
        logger.info("Password reset successfully for user: {}", user.getEmail());

        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName());

        return "Password reset successfully!";
    }

    @Override
    @Transactional(noRollbackFor = {BadRequestException.class, AccountUnverifiedException.class})
    public User login(LoginRequest request) {
        logger.info("Processing user login for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        // Check if locked_until > now
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            logger.warn("Login attempt on locked account: {}", user.getEmail());
            throw new AccountLockedException("Account locked. Try again after " + user.getLockedUntil() + ".");
        }

        // Check email_verified = true
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            logger.warn("Login attempt on unverified account: {}", user.getEmail());
            throw new AccountUnverifiedException("Please verify your email before logging in.");
        }

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            logger.warn("Failed login attempt #{} for user: {}", attempts, user.getEmail());

            if (attempts >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                logger.warn("Account locked for 15 minutes due to 5 failed attempts: {}", user.getEmail());
            }

            userRepository.save(user);
            throw new BadRequestException("Invalid email or password");
        }

        // On successful authentication, reset failed attempts & clear lockout
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        logger.info("User logged in successfully: {}", user.getEmail());
        return user;
    }
}
