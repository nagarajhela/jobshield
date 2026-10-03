package com.jobshield.auth.service;

import com.jobshield.auth.dto.LoginRequest;
import com.jobshield.auth.dto.RegisterRequest;
import com.jobshield.auth.entity.User;

public interface AuthService {

    String register(RegisterRequest request);

    User login(LoginRequest request);

    String verifyEmail(String token);

    String resendVerification(String email);

    String forgotPassword(String email);

    String resetPassword(String token, String newPassword);

    void directVerifyEmail(String email);
}
