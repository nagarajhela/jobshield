package com.jobshield.notification;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class NotificationDTO {

    private Long notificationId;
    private String type;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String timeAgo;

    public NotificationDTO() {
    }

    public NotificationDTO(Long notificationId, String type, String title, String message, boolean isRead, LocalDateTime createdAt) {
        this.notificationId = notificationId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.timeAgo = calculateTimeAgo(createdAt);
    }

    public static String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Just now";
        }
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(dateTime, now);
        long seconds = duration.getSeconds();

        if (seconds < 60) {
            return "Just now";
        }
        long minutes = duration.toMinutes();
        if (minutes < 60) {
            return minutes + " minutes ago";
        }
        long hours = duration.toHours();
        if (hours < 24) {
            return hours + " hours ago";
        }
        long days = duration.toDays();
        if (days < 7) {
            return days + " days ago";
        }
        return dateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        this.timeAgo = calculateTimeAgo(createdAt);
    }

    public String getTimeAgo() {
        if (this.timeAgo == null && this.createdAt != null) {
            this.timeAgo = calculateTimeAgo(this.createdAt);
        }
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }
}
