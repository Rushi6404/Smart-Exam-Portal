package com.project.examportalbackend.services;

import com.project.examportalbackend.models.ExamProgress;

public interface ExamProgressService {
    ExamProgress saveProgress(ExamProgress examProgress);

    ExamProgress getProgress(Long userId, Long quizId);

    void deleteProgress(Long userId, Long quizId);
}
