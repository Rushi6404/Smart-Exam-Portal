package com.project.examportalbackend.services.implementation;

import com.project.examportalbackend.models.ExamProgress;
import com.project.examportalbackend.repository.ExamProgressRepository;
import com.project.examportalbackend.services.ExamProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class ExamProgressServiceImpl implements ExamProgressService {

    @Autowired
    private ExamProgressRepository examProgressRepository;

    @Override
    public ExamProgress saveProgress(ExamProgress examProgress) {
        ExamProgress existing = examProgressRepository.findByUserIdAndQuizId(examProgress.getUserId(),
                examProgress.getQuizId());
        if (existing != null) {
            existing.setRemainingSeconds(examProgress.getRemainingSeconds());
            existing.setSelectedOptions(examProgress.getSelectedOptions());
            return examProgressRepository.save(existing);
        } else {
            return examProgressRepository.save(examProgress);
        }
    }

    @Override
    public ExamProgress getProgress(Long userId, Long quizId) {
        return examProgressRepository.findByUserIdAndQuizId(userId, quizId);
    }

    @Override
    @Transactional
    public void deleteProgress(Long userId, Long quizId) {
        examProgressRepository.deleteByUserIdAndQuizId(userId, quizId);
    }
}
