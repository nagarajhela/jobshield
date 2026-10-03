package com.jobshield.jobs;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.net.URI;

import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.jobshield.exception.BadRequestException;
import com.jobshield.exception.RequestTimeoutException;
import com.jobshield.exception.UnprocessableEntityException;
import com.jobshield.jobs.dto.ExtractedJobDTO;

@Service
public class UrlAnalyzerServiceImpl implements UrlAnalyzerService {

    private static final Logger logger = LoggerFactory.getLogger(UrlAnalyzerServiceImpl.class);
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    private static final int TIMEOUT_MS = 10000;
    private static final int MAX_DESC_CHARS = 3000;

    @Override
    public ExtractedJobDTO extractJobFromUrl(String url) {
        logger.info("Extracting job data from URL: {}", url);

        // a) Validate URL format
        if (url == null || url.trim().isEmpty()) {
            throw new BadRequestException("URL is required");
        }

        String cleanUrl = url.trim();
        URI uri;
        try {
            uri = URI.create(cleanUrl);
            if (uri.getScheme() == null || (!uri.getScheme().equalsIgnoreCase("http") && !uri.getScheme().equalsIgnoreCase("https"))) {
                throw new BadRequestException("Invalid URL format: only http and https protocols are supported");
            }
            if (uri.getHost() == null || uri.getHost().trim().isEmpty()) {
                throw new BadRequestException("Invalid URL format: missing host name");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid URL format: " + url);
        }

        // b) Connect using Jsoup
        Document doc;
        try {
            doc = Jsoup.connect(cleanUrl)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();
        } catch (SocketTimeoutException e) {
            logger.warn("Socket timeout connecting to URL {}: {}", cleanUrl, e.getMessage());
            throw new RequestTimeoutException("Request timed out connecting to URL: " + cleanUrl);
        } catch (HttpStatusException e) {
            logger.warn("HTTP error {} connecting to URL {}: {}", e.getStatusCode(), cleanUrl, e.getMessage());
            if (e.getStatusCode() == 408) {
                throw new RequestTimeoutException("Request timed out connecting to URL: " + cleanUrl);
            }
            throw new UnprocessableEntityException("Could not access that URL. Please paste the job description manually.");
        } catch (IOException e) {
            logger.warn("Failed to fetch or parse URL {}: {}", cleanUrl, e.getMessage());
            throw new UnprocessableEntityException("Could not access that URL. Please paste the job description manually.");
        }

        // c) Get page title as job title fallback
        String jobTitle = null;
        Element h1 = doc.selectFirst("h1");
        if (h1 != null && !h1.text().isBlank()) {
            jobTitle = h1.text().trim();
        }
        if (jobTitle == null || jobTitle.isBlank()) {
            jobTitle = doc.title();
        }
        if (jobTitle == null || jobTitle.isBlank()) {
            jobTitle = "Job Opening";
        }

        // d) Get meta description
        String metaDesc = "";
        Element metaTag = doc.selectFirst("meta[name=description]");
        if (metaTag == null) {
            metaTag = doc.selectFirst("meta[property=og:description]");
        }
        if (metaTag != null && metaTag.hasAttr("content")) {
            metaDesc = metaTag.attr("content").trim();
        }

        // e) Get full body text
        String bodyText = doc.body() != null ? doc.body().text().trim() : "";
        String fullDescription = !metaDesc.isEmpty() ? metaDesc + "\n\n" + bodyText : bodyText;
        if (fullDescription.isBlank()) {
            fullDescription = jobTitle;
        }

        // f) Limit extracted text to 3000 chars (prevents token overflow in AI)
        if (fullDescription.length() > MAX_DESC_CHARS) {
            fullDescription = fullDescription.substring(0, MAX_DESC_CHARS);
        }

        // g) Company name from meta or domain name
        String companyName = "";
        Element siteNameMeta = doc.selectFirst("meta[property=og:site_name]");
        if (siteNameMeta != null && siteNameMeta.hasAttr("content")) {
            companyName = siteNameMeta.attr("content").trim();
        }
        if (companyName.isEmpty() && uri.getHost() != null) {
            companyName = uri.getHost().replaceFirst("^www\\.", "");
            int dotIdx = companyName.indexOf('.');
            if (dotIdx > 0) {
                companyName = Character.toUpperCase(companyName.charAt(0)) + companyName.substring(1, dotIdx);
            }
        }
        if (companyName.isEmpty()) {
            companyName = "Unknown Employer";
        }

        logger.info("Extracted job data: title='{}', company='{}', descLength={}", jobTitle, companyName, fullDescription.length());
        return new ExtractedJobDTO(jobTitle, companyName, fullDescription, cleanUrl);
    }
}
