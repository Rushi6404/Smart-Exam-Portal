package com.project.examportalbackend.repository;

import com.project.examportalbackend.models.ProctoringLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProctoringLogRepository extends JpaRepository<ProctoringLog, Long> {
    List<ProctoringLog> findByUserId(Long userId);
    List<ProctoringLog> findByQuizId(Long quizId);
}
