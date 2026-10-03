package com.jobshield.jobs;

import java.time.LocalDateTime;
import java.util.List;

import com.jobshield.dto.JobAnalysisDetailDTO;
import com.jobshield.dto.JobHistoryDTO;
import com.jobshield.dto.PagedResponseDTO;
import com.jobshield.saved.SavedJob;

public interface JobHistoryService {

    PagedResponseDTO<JobHistoryDTO> getHistory(
            Long userId,
            int page,
            int size,
            String riskLevel,
            String search,
            String sortBy,
            String sortDir,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    JobAnalysisDetailDTO getAnalysisById(Long analysisId, Long userId);

    void softDeleteAnalysis(Long analysisId, Long userId);

    byte[] exportCsv(Long userId);

    SavedJob saveJob(Long analysisId, Long userId);

    void unsaveJob(Long analysisId, Long userId);

    List<JobAnalysisDetailDTO> getSavedJobs(Long userId);
}
