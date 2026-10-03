package com.jobshield.ai.dto;

import java.util.List;

public class GeminiResponse {

    private List<Candidate> candidates;

    public GeminiResponse() {
    }

    public List<Candidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }
}