package com.jobshield.config;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Service
public class RateLimitService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitService.class);

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public static final String LOGIN_LIMIT = "LOGIN_LIMIT";
    public static final String ANALYSIS_LIMIT = "ANALYSIS_LIMIT";
    public static final String FORGOT_PASSWORD_LIMIT = "FORGOT_PASSWORD_LIMIT";

    public boolean isAllowed(String key, String limitType) {
        String bucketKey = limitType + ":" + key;
        Bucket bucket = buckets.computeIfAbsent(bucketKey, k -> createNewBucket(limitType));
        boolean consumed = bucket.tryConsume(1);
        if (!consumed) {
            logger.warn("Rate limit exceeded for key: {} (type: {})", key, limitType);
        }
        return consumed;
    }

    private Bucket createNewBucket(String limitType) {
        Bandwidth limit;
        switch (limitType) {
            case LOGIN_LIMIT:
                // Max 5 attempts per IP per 15 minutes
                limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15)));
                break;
            case ANALYSIS_LIMIT:
                // Max 10 analyses per userId per minute
                limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1)));
                break;
            case FORGOT_PASSWORD_LIMIT:
                // Max 3 requests per email per hour
                limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofHours(1)));
                break;
            default:
                limit = Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1)));
                break;
        }

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
