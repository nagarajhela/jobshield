package com.jobshield.exception;

public class AccountUnverifiedException extends RuntimeException {
    public AccountUnverifiedException(String message) {
        super(message);
    }
}
