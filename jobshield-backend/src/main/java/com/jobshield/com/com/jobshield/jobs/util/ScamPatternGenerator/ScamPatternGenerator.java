package com.jobshield.jobs.util.ScamPatternGenerator;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class ScamPatternGenerator {

    public String generate(String text) {

        text = text.toLowerCase();

        List<String> patterns = new ArrayList<>();

        if (text.contains("registration fee")
                || text.contains("processing fee")
                || text.contains("pay")) {
            patterns.add("FEE");
        }

        if (text.contains("whatsapp")) {
            patterns.add("WHATSAPP");
        }

        if (text.contains("telegram")) {
            patterns.add("TELEGRAM");
        }

        if (text.contains("urgent")) {
            patterns.add("URGENT");
        }

        if (text.contains("immediately")) {
            patterns.add("IMMEDIATE");
        }

        if (text.contains("salary")) {
            patterns.add("HIGH_SALARY");
        }

        return String.join("|", patterns);
    }
}