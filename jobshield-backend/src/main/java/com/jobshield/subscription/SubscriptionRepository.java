package com.jobshield.subscription;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobshield.auth.entity.User;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserOrderByCreatedAtDesc(User user);

    Optional<Subscription> findFirstByUserAndStatusOrderByCreatedAtDesc(User user, String status);

    boolean existsByUserAndStatus(User user, String status);

    Optional<Subscription> findByUserUserIdAndStatus(Long userId, String status);

    Optional<Subscription> findByUser_UserIdAndStatus(Long userId, String status);

    List<Subscription> findByUserUserId(Long userId);

    List<Subscription> findByUser_UserId(Long userId);
}
