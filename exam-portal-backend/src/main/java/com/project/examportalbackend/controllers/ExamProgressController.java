package com.project.examportalbackend.controllers;

import com.project.examportalbackend.models.ExamProgress;
import com.project.examportalbackend.services.ExamProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin("*")
public class ExamProgressController {

    @Autowired
    private ExamProgressService examProgressService;

    @PostMapping("/")
    public ResponseEntity<ExamProgress> saveProgress(@RequestBody ExamProgress examProgress) {
        return ResponseEntity.ok(this.examProgressService.saveProgress(examProgress));
    }

    @GetMapping("/{userId}/{quizId}")
    public ResponseEntity<ExamProgress> getProgress(@PathVariable("userId") Long userId,
            @PathVariable("quizId") Long quizId) {
        return ResponseEntity.ok(this.examProgressService.getProgress(userId, quizId));
    }

    @DeleteMapping("/{userId}/{quizId}")
    public void deleteProgress(@PathVariable("userId") Long userId, @PathVariable("quizId") Long quizId) {
        this.examProgressService.deleteProgress(userId, quizId);
    }
}
