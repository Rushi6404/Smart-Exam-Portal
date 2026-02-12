package com.project.examportalbackend.controllers;

import com.project.examportalbackend.models.Question;
import com.project.examportalbackend.models.Quiz;
import com.project.examportalbackend.models.QuizResult;
import com.project.examportalbackend.services.QuestionService;
import com.project.examportalbackend.services.QuizResultService;
import com.project.examportalbackend.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import com.project.examportalbackend.models.User;
import com.project.examportalbackend.repository.UserRepository;
import com.project.examportalbackend.services.QuestionService;

@CrossOrigin
@RestController
@RequestMapping("/api/quizResult")
public class QuizResultController {

    @Autowired
    private QuestionService questionService;
    @Autowired
    private QuizService quizService;

    @Autowired
    private QuizResultService quizResultService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping(value = "/submit")
    public ResponseEntity<?> submitQuiz(@RequestParam(name = "userId") Long userId,
            @RequestParam(name = "quizId") Long quizId,
            @RequestBody(required = false) HashMap<String, String> answers) {
        
        System.out.println("Submit Quiz Request Received: UserId=" + userId + ", QuizId=" + quizId);

        if (answers == null) {
            answers = new HashMap<>();
        }
        System.out.println("Answers Map Size: " + answers.size());

        Quiz quiz = quizService.getQuiz(quizId);
        if (quiz == null) {
            System.out.println("Quiz not found with ID: " + quizId);
            return ResponseEntity.badRequest().body("Quiz not found");
        }

        float marksPerQuestion = 0;
        int numQuestions = quiz.getNumOfQuestions();
        if (numQuestions > 0 && quiz.getMaxMarks() != null) {
            try {
                marksPerQuestion = Float.parseFloat(quiz.getMaxMarks()) / numQuestions;
            } catch (NumberFormatException e) {
                marksPerQuestion = 0;
                System.out.println("Error parsing Max Marks: " + e.getMessage());
            }
        }
        
        System.out.println("Marks per question: " + marksPerQuestion);

        int numCorrectAnswers = 0;
        for (Map.Entry<String, String> m : answers.entrySet()) {
            if (m.getKey() == null || m.getValue() == null)
                continue;
            try {
                Question question = questionService.getQuestion(Long.valueOf(m.getKey()));
                if (question != null && question.getAnswer() != null) {
                    String correctAnswer = question.getAnswer().toLowerCase();
                    String userAnswer = m.getValue().toLowerCase();

                    boolean isCorrect = correctAnswer.equals(userAnswer);

                    // Lenient check for older data (e.g., "1" instead of "option1")
                    if (!isCorrect) {
                        if ((correctAnswer.equals("1") && userAnswer.equals("option1")) ||
                                (correctAnswer.equals("2") && userAnswer.equals("option2")) ||
                                (correctAnswer.equals("3") && userAnswer.equals("option3")) ||
                                (correctAnswer.equals("4") && userAnswer.equals("option4"))) {
                            isCorrect = true;
                        } else if ((correctAnswer.equals("option1") && userAnswer.equals("1")) ||
                                (correctAnswer.equals("option2") && userAnswer.equals("2")) ||
                                (correctAnswer.equals("option3") && userAnswer.equals("3")) ||
                                (correctAnswer.equals("option4") && userAnswer.equals("4"))) {
                            isCorrect = true;
                        }
                    }

                    if (isCorrect) {
                        numCorrectAnswers++;
                    }
                }
            } catch (NumberFormatException e) {
                // Ignore invalid question IDs
                System.out.println("Invalid Question ID format: " + m.getKey());
            } catch (Exception e) {
                System.out.println("Error processing question " + m.getKey() + ": " + e.getMessage());
            }
        }
        float totalObtainedMarks = numCorrectAnswers * marksPerQuestion;
        System.out.println("Total Obtained Marks: " + totalObtainedMarks);

        QuizResult quizResult = new QuizResult();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
             System.out.println("User not found with ID: " + userId);
             // Proceeding might cause issues depending on DB constraints, but let's log it.
        }
        
        quizResult.setUser(user);
        quizResult.setQuiz(quiz);
        quizResult.setTotalObtainedMarks(totalObtainedMarks);

        final ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        quizResult.setAttemptDatetime(now.format(formatter));

        try {
            QuizResult savedResult = quizResultService.addQuizResult(quizResult);
            System.out.println("Quiz Result Saved Successfully: ID=" + savedResult.getQuizResId());
            return ResponseEntity.ok(savedResult);
        } catch (Exception e) {
            System.out.println("Error Saving Quiz Result: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving quiz result: " + e.getMessage());
        }
    }

    @GetMapping(value = "/", params = "userId")
    public ResponseEntity<?> getQuizResults(@RequestParam Long userId) {
        List<QuizResult> quizResultsList = quizResultService.getQuizResultsByUser(userId);
        Collections.reverse(quizResultsList);
        return ResponseEntity.ok(quizResultsList);
    }

    @GetMapping(value = "/all")
    public ResponseEntity<?> getQuizResults() {
        List<QuizResult> quizResultsList = quizResultService.getQuizResults();
        Collections.reverse(quizResultsList);
        return ResponseEntity.ok(quizResultsList);
    }
}
