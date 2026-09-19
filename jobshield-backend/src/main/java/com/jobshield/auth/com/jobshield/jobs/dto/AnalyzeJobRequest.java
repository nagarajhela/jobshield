package com.jobshield.jobs.dto;

import jakarta.validation.constraints.NotBlank;

public class AnalyzeJobRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    private String jobTitle;

    private String salary;

    @NotBlank
    private String jobDescription;

    public AnalyzeJobRequest() {
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}