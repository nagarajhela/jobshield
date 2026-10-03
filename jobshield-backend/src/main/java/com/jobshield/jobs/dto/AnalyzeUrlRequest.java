package com.jobshield.jobs.dto;

import jakarta.validation.constraints.NotBlank;

public class AnalyzeUrlRequest {

    @NotBlank(message = "URL is required")
    private String url;

    public AnalyzeUrlRequest() {
    }

    public AnalyzeUrlRequest(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
