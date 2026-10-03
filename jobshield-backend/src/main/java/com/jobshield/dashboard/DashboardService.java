package com.jobshield.dashboard;

import com.jobshield.dto.DashboardStatsDTO;

public interface DashboardService {
    DashboardStatsDTO getUserStats(Long userId);
    int getAnalysesThisMonth(Long userId);
}
