package com.project.examportalbackend.controllers;

import com.project.examportalbackend.models.Question;
import com.project.examportalbackend.models.Quiz;
import com.project.examportalbackend.services.QuestionService;
import com.project.examportalbackend.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.project.examportalbackend.services.implementation.AzureDocumentIntelligenceService;

import java.io.IOException;

import java.util.List;
import java.util.Set;

@CrossOrigin
@RestController
@RequestMapping("/api/question")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private com.project.examportalbackend.services.implementation.AiGenerationService aiService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuestions(@RequestBody java.util.Map<String, Object> request) {
        try {
            String topic = (String) request.get("topic");
            String difficulty = (String) request.get("difficulty");
            int count = (Integer) request.get("count");
            Long quizId = Long.valueOf(request.get("quizId").toString());

            Quiz quiz = quizService.getQuiz(quizId);
            if (quiz == null)
                return ResponseEntity.badRequest().body("Quiz not found");

            List<Question> generated = aiService.generateQuestions(topic, count, difficulty, quiz);

            // Save them
            for (Question q : generated) {
                questionService.addQuestion(q);
            }

            return ResponseEntity.ok(generated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/")
    public ResponseEntity<?> addQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.addQuestion(question));
    }

    @GetMapping("/")
    public ResponseEntity<?> getQuestions() {
        return ResponseEntity.ok(questionService.getQuestions());
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<?> getQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getQuestion(questionId));
    }

    @GetMapping(value = "/", params = "quizId")
    public ResponseEntity<?> getQuestionsByQuiz(@RequestParam Long quizId) {
        Quiz quiz = quizService.getQuiz(quizId);
        // Set<Question> questions = quiz.getQuestions();
        List<Question> questions = questionService.getQuestionsByQuiz(quiz);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long questionId, @RequestBody Question question) {
        if (questionService.getQuestion(questionId) != null) {
            return ResponseEntity.ok(questionService.updateQuestion(question));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Question with id : " + String.valueOf(questionId) + ", doesn't exists");
    }

    @Autowired
    private AzureDocumentIntelligenceService azureService;

    @PostMapping("/auto-generate")
    public ResponseEntity<?> autoGenerateQuestions(@RequestParam("file") MultipartFile file,
            @RequestParam("quizId") Long quizId) {
        try {
            Quiz quiz = quizService.getQuiz(quizId);
            if (quiz == null) {
                return ResponseEntity.badRequest().body("Quiz not found");
            }
            List<Question> extractedQuestions = azureService.extractQuestions(file, quiz);
            for (Question q : extractedQuestions) {
                questionService.addQuestion(q);
            }
            return ResponseEntity.ok(extractedQuestions);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok(true);
    }

    @PostMapping("/copy")
    public ResponseEntity<?> copyQuestions(@RequestBody java.util.Map<String, Object> request) {
        try {
            List<Integer> ids = (List<Integer>) request.get("questionIds");
            Long targetQuizId = Long.valueOf(request.get("targetQuizId").toString());
            List<Long> longIds = new java.util.ArrayList<>();
            for (Integer id : ids)
                longIds.add(Long.valueOf(id));

            return ResponseEntity.ok(questionService.copyQuestions(longIds, targetQuizId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error copying questions: " + e.getMessage());
        }
    }
}
