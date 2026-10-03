package com.jobshield.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobshield.auth.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    List<Notification> findTop20ByUser_UserIdOrderByCreatedAtDesc(Long userId);

    int countByUser_UserIdAndIsReadFalse(Long userId);

    Optional<Notification> findByNotificationIdAndUser_UserId(Long notificationId, Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);

    void deleteByNotificationIdAndUser_UserId(Long notificationId, Long userId);

    org.springframework.data.domain.Page<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    long countByUserUserIdAndIsReadFalse(Long userId);

    List<Notification> findByUserUserIdAndIsReadFalse(Long userId);
}
