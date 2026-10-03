package com.jobshield.jobs;

import com.jobshield.jobs.dto.ExtractedJobDTO;

public interface UrlAnalyzerService {

    ExtractedJobDTO extractJobFromUrl(String url);

}
