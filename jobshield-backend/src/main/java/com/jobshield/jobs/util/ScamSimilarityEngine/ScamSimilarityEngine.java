package com.jobshield.jobs.util.ScamSimilarityEngine;



import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class ScamSimilarityEngine {

    public double calculateSimilarity(String p1, String p2) {

        if (p1 == null || p2 == null)
            return 0;

        Set<String> first =
                new HashSet<>(Arrays.asList(p1.split("\\|")));

        Set<String> second =
                new HashSet<>(Arrays.asList(p2.split("\\|")));

        Set<String> common = new HashSet<>(first);

        common.retainAll(second);

        Set<String> total = new HashSet<>(first);

        total.addAll(second);

        if (total.isEmpty())
            return 0;

        return (common.size() * 100.0) / total.size();
    }

}