package com.jobshield.notification;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        User user = getAuthenticatedUser();
        logger.info("Serving GET /api/notifications for user: {}", user.getEmail());
        List<NotificationDTO> list = notificationService.getUserNotifications(user.getUserId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount() {
        User user = getAuthenticatedUser();
        logger.info("Serving GET /api/notifications/unread-count for user: {}", user.getEmail());
        int count = notificationService.getUnreadCount(user.getUserId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        logger.info("Serving PUT /api/notifications/{}/read for user: {}", id, user.getEmail());
        NotificationDTO dto = notificationService.markAsRead(id, user.getUserId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead() {
        User user = getAuthenticatedUser();
        logger.info("Serving PUT /api/notifications/read-all for user: {}", user.getEmail());
        int updatedCount = notificationService.markAllAsRead(user.getUserId());
        return ResponseEntity.ok(Map.of("updated", updatedCount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        logger.info("Serving DELETE /api/notifications/{} for user: {}", id, user.getEmail());
        notificationService.deleteNotification(id, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
