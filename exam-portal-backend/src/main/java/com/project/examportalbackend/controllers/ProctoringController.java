package com.project.examportalbackend.controllers;

import com.project.examportalbackend.models.ProctoringLog;
import com.project.examportalbackend.repository.ProctoringLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proctoring")
@CrossOrigin("*")
public class ProctoringController {

    @Autowired
    private ProctoringLogRepository proctoringLogRepository;

    @PostMapping("/log")
    public ResponseEntity<?> logViolation(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long quizId = Long.valueOf(data.get("quizId").toString());
            String violationType = data.get("violationType").toString();

            ProctoringLog log = new ProctoringLog(userId, quizId, violationType, LocalDateTime.now());
            proctoringLogRepository.save(log);

            return ResponseEntity.ok("Violation logged successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error logging violation");
        }
    }

    @GetMapping("/logs/{quizId}")
    public ResponseEntity<?> getLogsByQuiz(@PathVariable Long quizId) {
        List<ProctoringLog> logs = proctoringLogRepository.findByQuizId(quizId);
        return ResponseEntity.ok(logs);
    }
}
