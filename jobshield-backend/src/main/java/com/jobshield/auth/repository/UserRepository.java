package com.jobshield.auth.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobshield.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByResetToken(String resetToken);

    java.util.List<User> findByAccountStatus(String accountStatus);

    @Query("SELECT u FROM User u WHERE " +
           "(CAST(:search AS string) IS NULL OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(u.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           " LOWER(u.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<User> findUsers(
            @Param("search") String search,
            Pageable pageable
    );

    long countByCreatedAtGreaterThanEqual(LocalDateTime date);
}