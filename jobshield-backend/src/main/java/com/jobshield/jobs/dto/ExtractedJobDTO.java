package com.jobshield.jobs.dto;

public class ExtractedJobDTO {

    private String jobTitle;
    private String companyName;
    private String description;
    private String sourceUrl;

    public ExtractedJobDTO() {
    }

    public ExtractedJobDTO(String jobTitle, String companyName, String description, String sourceUrl) {
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.description = description;
        this.sourceUrl = sourceUrl;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }
}
