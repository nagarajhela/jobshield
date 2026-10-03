package com.jobshield.auth.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jobshield.auth.dto.LoginRequest;
import com.jobshield.auth.dto.RegisterRequest;
import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.auth.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    public UserServiceImpl(UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

this.userRepository = userRepository;
this.passwordEncoder = passwordEncoder;
}

    @Override
    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        // Temporary (later BCrypt)
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhoneNumber(request.getPhoneNumber());

        user.setAccountStatus("ACTIVE");
        user.setEmailVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

	
	@Override
	public User loginUser(LoginRequest request) {

	    Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

	    if (optionalUser.isEmpty()) {
	        throw new RuntimeException("Invalid email or password");
	    }

	    User user = optionalUser.get();

	    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
	        throw new RuntimeException("Invalid email or password");
	    }

	    return user;
	}
	@Override
	public User getUserByEmail(String email) {

	    return userRepository.findByEmail(email)
	            .orElseThrow(() ->
	                    new RuntimeException("User not found"));
	}
}