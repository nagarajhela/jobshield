package com.jobshield.saved;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobshield.auth.entity.User;
import com.jobshield.jobs.entity.JobAnalysis;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    List<SavedJob> findByUserOrderBySavedAtDesc(User user);

    Optional<SavedJob> findByUserAndJobAnalysis(User user, JobAnalysis jobAnalysis);

    boolean existsByUserAndJobAnalysis(User user, JobAnalysis jobAnalysis);

    void deleteByUserAndJobAnalysis(User user, JobAnalysis jobAnalysis);
}
