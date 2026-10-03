package com.jobshield.config;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

import com.jobshield.exception.AccountLockedException;
import com.jobshield.exception.AccountUnverifiedException;
import com.jobshield.exception.BadRequestException;
import com.jobshield.exception.ConflictException;
import com.jobshield.exception.RateLimitExceededException;
import com.jobshield.exception.ResourceNotFoundException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Global Exception Handler for JobShield REST API.
 * Standardizes error responses across all controllers.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private Map<String, Object> buildBaseError(String error, String message, HttpServletRequest request) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", error);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("path", request != null ? request.getRequestURI() : "");
        return response;
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFoundException(
            EntityNotFoundException ex, HttpServletRequest request) {
        log.warn("EntityNotFoundException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Not Found",
                ex.getMessage() != null ? ex.getMessage() : "Requested resource was not found",
                request
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("ResourceNotFoundException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Not Found",
                ex.getMessage() != null ? ex.getMessage() : "Requested resource was not found",
                request
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("AccessDeniedException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Access Denied",
                "You do not have permission",
                request
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(AccountUnverifiedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountUnverifiedException(
            AccountUnverifiedException ex, HttpServletRequest request) {
        log.warn("AccountUnverifiedException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Account Unverified",
                ex.getMessage() != null ? ex.getMessage() : "Email verification required",
                request
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountLockedException(
            AccountLockedException ex, HttpServletRequest request) {
        log.warn("AccountLockedException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Account Locked",
                ex.getMessage() != null ? ex.getMessage() : "Account is temporarily locked",
                request
        );
        return ResponseEntity.status(HttpStatus.LOCKED).body(body);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitExceededException(
            RateLimitExceededException ex, HttpServletRequest request) {
        log.warn("RateLimitExceededException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Too Many Requests",
                ex.getMessage() != null ? ex.getMessage() : "Please wait before trying again",
                request
        );
        body.put("retryAfter", 60);
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(body);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequestException(
            BadRequestException ex, HttpServletRequest request) {
        log.warn("BadRequestException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Bad Request",
                ex.getMessage() != null ? ex.getMessage() : "Bad request",
                request
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflictException(
            ConflictException ex, HttpServletRequest request) {
        log.warn("ConflictException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Conflict",
                ex.getMessage() != null ? ex.getMessage() : "Resource conflict occurred",
                request
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation failed on {}: {} errors", request.getRequestURI(), ex.getBindingResult().getErrorCount());

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Validation failed");
        body.put("message", "Validation failed for one or more fields");
        body.put("fields", fieldErrors);
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("path", request != null ? request.getRequestURI() : "");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("HttpMessageNotReadableException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Bad Request",
                "Invalid request format",
                request
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("DataIntegrityViolationException on {}: {}", request.getRequestURI(), ex.getMessage());
        Map<String, Object> body = buildBaseError(
                "Conflict",
                "Resource already exists",
                request
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleRestClientResponseException(
            RestClientResponseException ex, HttpServletRequest request) {
        log.error("RestClientResponseException (AI/External service) on {}: status={}, body={}",
                request.getRequestURI(), ex.getStatusCode(), ex.getResponseBodyAsString());
        Map<String, Object> body = buildBaseError(
                "Service Unavailable",
                "AI service temporarily unavailable",
                request
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {}: ", request.getRequestURI(), ex);
        Map<String, Object> body = buildBaseError(
                "Internal Server Error",
                "An unexpected error occurred",
                request
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
