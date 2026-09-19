package com.jobshield.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.jobshield.ai.dto.AiAnalysisResult;
import com.jobshield.ai.dto.GeminiResponse;

@Service
public class GeminiServiceImpl implements GeminiService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    public GeminiServiceImpl(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public AiAnalysisResult analyzeJob(String jobDescription) {

        String prompt = """
                Analyze the following job posting for scam indicators.

                Return ONLY in this format:

                Risk Score: <0-100>
                Risk Level: LOW, MEDIUM or HIGH
                Reason: <short explanation>

                Job Description:
                """ + jobDescription;

        String requestBody = """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": %s
                        }
                      ]
                    }
                  ]
                }
                """.formatted("\"" + prompt.replace("\"", "\\\"") + "\"");

        GeminiResponse response = restClient.post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent")
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(GeminiResponse.class);

        String aiText = response.getCandidates()
                .get(0)
                .getContent()
                .getParts()
                .get(0)
                .getText();

        return parseResponse(aiText);
    }

    private AiAnalysisResult parseResponse(String text) {

        int riskScore = 0;
        String riskLevel = "";
        String reason = "";

        String[] lines = text.split("\\n");

        for (String line : lines) {

            if (line.startsWith("Risk Score:")) {
                riskScore = Integer.parseInt(
                        line.replace("Risk Score:", "").trim());
            } else if (line.startsWith("Risk Level:")) {
                riskLevel = line.replace("Risk Level:", "").trim();
            } else if (line.startsWith("Reason:")) {
                reason = line.replace("Reason:", "").trim();
            }
        }

        return new AiAnalysisResult(
                riskScore,
                riskLevel,
                reason
        );
    }
}