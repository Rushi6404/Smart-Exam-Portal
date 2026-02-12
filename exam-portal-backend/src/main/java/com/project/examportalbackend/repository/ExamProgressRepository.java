package com.project.examportalbackend.repository;

import com.project.examportalbackend.models.ExamProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamProgressRepository extends JpaRepository<ExamProgress, Long> {
    ExamProgress findByUserIdAndQuizId(Long userId, Long quizId);

    void deleteByUserIdAndQuizId(Long userId, Long quizId);
}
