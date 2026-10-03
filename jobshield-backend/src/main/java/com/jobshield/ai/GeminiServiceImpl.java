package com.jobshield.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.jobshield.ai.dto.AiAnalysisResult;
import com.jobshield.jobs.dto.AnalyzeJobRequest;

@Service
public class GeminiServiceImpl implements GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiServiceImpl.class);

    private final RestClient restClient;

    @Value("${openrouter.api.key:${tokenrouter.api.key:${gemini.api.key:}}}")
    private String apiKey;

    @Value("${openrouter.api.url:${tokenrouter.api.url:https://openrouter.ai/api/v1/chat/completions}}")
    private String apiUrl;

    @Value("${openrouter.model:${tokenrouter.model:google/gemini-3.5-flash-lite}}")
    private String model;

    public GeminiServiceImpl(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public AiAnalysisResult analyzeJob(String jobDescription) {
        return analyzeJob("Not specified", "Not specified", "Not specified", jobDescription);
    }

    @Override
    public AiAnalysisResult analyzeJob(AnalyzeJobRequest request) {
        if (request == null) {
            return analyzeJob("Not specified", "Not specified", "Not specified", "");
        }
        return analyzeJob(
                request.getCompanyName(),
                request.getJobTitle(),
                request.getSalary(),
                request.getJobDescription()
        );
    }

    @Override
    @SuppressWarnings("unchecked")
    public AiAnalysisResult analyzeJob(String companyName, String jobTitle, String salary, String jobDescription) {
        String company = (companyName != null && !companyName.isBlank()) ? companyName : "Not specified";
        String title = (jobTitle != null && !jobTitle.isBlank()) ? jobTitle : "Not specified";
        String sal = (salary != null && !salary.isBlank()) ? salary : "Not specified";
        String desc = (jobDescription != null) ? jobDescription : "";

        String prompt = """
You are an expert job scam detection AI.
Analyze the following job posting and return 
your analysis in EXACTLY this format. 
Do not add any extra text outside this format.

RISK_SCORE: [number 0-100]
RISK_LEVEL: [LOW or MEDIUM or HIGH]
CONFIDENCE: [number 0-100]
EMPLOYER_STATUS: [LIKELY_REAL or SUSPICIOUS or LIKELY_FAKE]
SCAM_PATTERN: [one of: ADVANCE_FEE, PHISHING, 
               FAKE_RECRUITER, MLM_PYRAMID, 
               DATA_HARVESTING, UNPAID_TRIAL, 
               IDENTITY_THEFT, NONE]
RED_FLAGS:
- [red flag 1]
- [red flag 2]
- [red flag 3]
(list only actual red flags found, max 6)
REASON: [one paragraph explanation]
ACTIONS:
- [recommended action 1]
- [recommended action 2]
- [recommended action 3]
(list 3-5 actionable recommendations)

Job Posting to Analyze:
Company: %s
Job Title: %s
Salary: %s
Description: %s
""".formatted(company, title, sal, desc);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "You are an expert AI security analyst evaluating job postings for scam and fraud indicators."
                        ),
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "temperature", 0.2,
                "max_tokens", 800
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("HTTP-Referer", "https://jobshield.local")
                    .header("X-Title", "JobShield")
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                Object choicesObj = response.get("choices");
                if (choicesObj instanceof List<?> choicesList && !choicesList.isEmpty()) {
                    Object firstChoice = choicesList.get(0);
                    if (firstChoice instanceof Map<?, ?> choiceMap) {
                        Object messageObj = choiceMap.get("message");
                        if (messageObj instanceof Map<?, ?> messageMap) {
                            Object contentObj = messageMap.get("content");
                            if (contentObj != null) {
                                return parseAIResponse(contentObj.toString());
                            }
                        }
                    }
                }
            }

            logger.warn("OpenRouter returned empty or unexpected response: {}", response);
            return defaultSafeResult("AI analysis completed. No definitive scam indicators detected.");

        } catch (RestClientResponseException e) {
            logger.error("OpenRouter API error (HTTP {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            return defaultSafeResult("OpenRouter API (" + e.getStatusCode().value() + "): " + extractErrorMessage(e.getResponseBodyAsString()));
        } catch (Exception e) {
            logger.error("Error communicating with AI service", e);
            return defaultSafeResult("AI service notice: " + e.getMessage());
        }
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) return "Service temporarily unavailable.";
        return body.length() > 120 ? body.substring(0, 120) + "..." : body;
    }

    private AiAnalysisResult parseAIResponse(String text) {
        logger.debug("Full AI response before parsing:\n{}", text);

        int riskScore = 0;
        String riskLevel = "LOW";
        int confidence = 85;
        String employerStatus = "SUSPICIOUS";
        String scamPattern = "NONE";
        String reason = "";
        List<String> redFlags = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        if (text != null && !text.isBlank()) {
            // RISK_SCORE: [number 0-100]
            Pattern scorePattern = Pattern.compile("(?i)RISK_SCORE:\\s*(\\d+)");
            Matcher scoreMatcher = scorePattern.matcher(text);
            if (scoreMatcher.find()) {
                try {
                    riskScore = Integer.parseInt(scoreMatcher.group(1).trim());
                } catch (NumberFormatException ignored) {}
            }

            // RISK_LEVEL: (LOW|MEDIUM|HIGH)
            Pattern levelPattern = Pattern.compile("(?i)RISK_LEVEL:\\s*(LOW|MEDIUM|HIGH)");
            Matcher levelMatcher = levelPattern.matcher(text);
            if (levelMatcher.find()) {
                riskLevel = levelMatcher.group(1).trim().toUpperCase();
            }

            // CONFIDENCE: (\d+)
            Pattern confPattern = Pattern.compile("(?i)CONFIDENCE:\\s*(\\d+)");
            Matcher confMatcher = confPattern.matcher(text);
            if (confMatcher.find()) {
                try {
                    confidence = Integer.parseInt(confMatcher.group(1).trim());
                } catch (NumberFormatException ignored) {}
            }

            // EMPLOYER_STATUS: (LIKELY_REAL|SUSPICIOUS|LIKELY_FAKE)
            Pattern empPattern = Pattern.compile("(?i)EMPLOYER_STATUS:\\s*(LIKELY_REAL|SUSPICIOUS|LIKELY_FAKE)");
            Matcher empMatcher = empPattern.matcher(text);
            if (empMatcher.find()) {
                employerStatus = empMatcher.group(1).trim().toUpperCase();
            }

            // SCAM_PATTERN: (\w+)
            Pattern scamPatternRegex = Pattern.compile("(?i)SCAM_PATTERN:\\s*([A-Za-z0-9_]+)");
            Matcher scamMatcher = scamPatternRegex.matcher(text);
            if (scamMatcher.find()) {
                scamPattern = scamMatcher.group(1).trim().toUpperCase();
            }

            // REASON: (.+?)(?=ACTIONS:|$) (DOTALL flag)
            Pattern reasonPattern = Pattern.compile("(?is)REASON:\\s*(.+?)(?=ACTIONS:|$)");
            Matcher reasonMatcher = reasonPattern.matcher(text);
            if (reasonMatcher.find()) {
                reason = reasonMatcher.group(1).trim();
            }

            // RED_FLAGS (as List<String>)
            Pattern flagsPattern = Pattern.compile("(?is)RED_FLAGS:\\s*(.+?)(?=REASON:|$)");
            Matcher flagsMatcher = flagsPattern.matcher(text);
            if (flagsMatcher.find()) {
                String section = flagsMatcher.group(1);
                String[] lines = section.split("\\r?\\n");
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.startsWith("- ")) {
                        String flag = trimmed.substring(2).trim();
                        if (!flag.isEmpty()) {
                            redFlags.add(flag);
                        }
                    }
                }
            }

            // ACTIONS (as List<String>)
            Pattern actionsPattern = Pattern.compile("(?is)ACTIONS:\\s*(.+)");
            Matcher actionsMatcher = actionsPattern.matcher(text);
            if (actionsMatcher.find()) {
                String section = actionsMatcher.group(1);
                String[] lines = section.split("\\r?\\n");
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.startsWith("- ")) {
                        String act = trimmed.substring(2).trim();
                        if (!act.isEmpty()) {
                            actions.add(act);
                        }
                    }
                }
            }

            // Backward compatibility fallbacks
            if (riskScore == 0 && !text.contains("RISK_SCORE:")) {
                Pattern oldScorePattern = Pattern.compile("(?i)(?:Risk Score|Score)\\s*[:=]\\s*(\\d+)");
                Matcher m = oldScorePattern.matcher(text);
                if (m.find()) {
                    try { riskScore = Integer.parseInt(m.group(1)); } catch (Exception ignored) {}
                }
            }
            if (reason.isEmpty()) {
                Pattern oldReasonPattern = Pattern.compile("(?i)(?:Reason)\\s*[:=]\\s*(.+)");
                Matcher m = oldReasonPattern.matcher(text);
                if (m.find()) {
                    reason = m.group(1).trim();
                }
            }
        }

        if (reason.isEmpty()) {
            reason = (text != null && !text.isBlank()) ? text.trim() : "Job posting evaluated successfully.";
        }

        logger.info("Parsed AI Results -> riskScore={}, riskLevel={}, confidence={}, employerStatus={}, scamPattern={}, redFlags={}, actions={}",
                riskScore, riskLevel, confidence, employerStatus, scamPattern, redFlags.size(), actions.size());

        AiAnalysisResult result = new AiAnalysisResult(riskScore, riskLevel, reason);
        result.setConfidenceScore(confidence);
        result.setEmployerStatus(employerStatus);
        result.setScamPattern(scamPattern);
        result.setRedFlags(redFlags);
        result.setRecommendedActions(actions);
        return result;
    }

    private AiAnalysisResult defaultSafeResult(String reason) {
        AiAnalysisResult result = new AiAnalysisResult(30, "LOW", reason);
        result.setConfidenceScore(75);
        result.setEmployerStatus("LIKELY_REAL");
        result.setScamPattern("NONE");
        result.setRedFlags(new ArrayList<>());
        result.setRecommendedActions(List.of("Verify employer identity independently", "Never send money or personal credentials"));
        return result;
    }
}