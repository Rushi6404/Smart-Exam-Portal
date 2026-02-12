package com.project.examportalbackend.models;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proctoring_logs")
public class ProctoringLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long userId;
    private Long quizId;
    private String violationType; // "NO_FACE", "MULTIPLE_FACES"
    private LocalDateTime timestamp;

    public ProctoringLog() {
    }

    public ProctoringLog(Long userId, Long quizId, String violationType, LocalDateTime timestamp) {
        this.userId = userId;
        this.quizId = quizId;
        this.violationType = violationType;
        this.timestamp = timestamp;
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

    public String getViolationType() {
        return violationType;
    }

    public void setViolationType(String violationType) {
        this.violationType = violationType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
