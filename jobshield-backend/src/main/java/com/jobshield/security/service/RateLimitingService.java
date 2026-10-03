package com.jobshield.security.service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();

    public boolean tryConsumeForgotPassword(String email) {
        String key = email != null ? email.toLowerCase().trim() : "anonymous";
        Bucket bucket = forgotPasswordBuckets.computeIfAbsent(key, k -> createForgotPasswordBucket());
        return bucket.tryConsume(1);
    }

    private Bucket createForgotPasswordBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(3)
                .refillIntervally(3, Duration.ofHours(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
