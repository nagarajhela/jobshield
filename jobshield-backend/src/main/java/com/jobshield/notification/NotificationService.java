package com.jobshield.notification;

import java.util.List;

public interface NotificationService {

    Notification createNotification(Long userId, String type, String title, String message);

    List<NotificationDTO> getUserNotifications(Long userId);

    int getUnreadCount(Long userId);

    NotificationDTO markAsRead(Long notificationId, Long userId);

    int markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);
}
