package com.jobshield.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.jobshield.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

}