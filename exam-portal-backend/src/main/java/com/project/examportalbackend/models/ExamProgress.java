package com.project.examportalbackend.models;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "exam_progress")
public class ExamProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long quizId;
    private Long remainingSeconds;

    @ElementCollection
    @CollectionTable(name = "progress_answers", joinColumns = @JoinColumn(name = "progress_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "selected_option")
    private Map<Long, String> selectedOptions = new HashMap<>();

    public ExamProgress() {
    }

    public ExamProgress(Long userId, Long quizId, Long remainingSeconds, Map<Long, String> selectedOptions) {
        this.userId = userId;
        this.quizId = quizId;
        this.remainingSeconds = remainingSeconds;
        this.selectedOptions = selectedOptions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(Long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public Map<Long, String> getSelectedOptions() {
        return selectedOptions;
    }

    public void setSelectedOptions(Map<Long, String> selectedOptions) {
        this.selectedOptions = selectedOptions;
    }
}
