package com.project.examportalbackend.services.implementation;

import com.project.examportalbackend.models.Question;
import com.project.examportalbackend.models.Quiz;
import com.project.examportalbackend.repository.QuestionRepository;
import com.project.examportalbackend.repository.QuizRepository;
import com.project.examportalbackend.services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    QuestionRepository questionRepository;

    @Autowired
    QuizRepository quizRepository;

    @Override
    public Question addQuestion(Question question) {
        Quiz quiz = quizRepository.findById(question.getQuiz().getQuizId()).get();

        // Use DB count source of truth (existing questions in DB)
        long existingCount = questionRepository.countByQuiz(quiz);

        quiz.setNumOfQuestions((int) existingCount + 1);

        // Update Max Marks (Assuming 5 marks per question)
        try {
            quiz.setMaxMarks(String.valueOf((existingCount + 1) * 5));
        } catch (Exception e) {
            System.out.println("Error updating max marks: " + e.getMessage());
        }

        quizRepository.save(quiz);
        return questionRepository.save(question);
    }

    @Override
    public List<Question> getQuestions() {
        return questionRepository.findAll();
    }

    @Override
    public Question getQuestion(Long quesId) {
        return questionRepository.findById(quesId).isPresent() ? questionRepository.findById(quesId).get() : null;
    }

    @Override
    public Question updateQuestion(Question question) {
        return questionRepository.save(question);
    }

    @Override
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId).orElse(null);
        if (question != null) {
            Quiz quiz = question.getQuiz();
            if (quiz != null) {
                // DB count includes the question to be deleted
                long existingCount = questionRepository.countByQuiz(quiz);
                int newCount = Math.max(0, (int) existingCount - 1);

                quiz.setNumOfQuestions(newCount);
                quiz.setMaxMarks(String.valueOf(newCount * 5));
                quizRepository.save(quiz);
            }
            questionRepository.delete(question);
        }
    }

    @Override
    public List<Question> getQuestionsByQuiz(Quiz quiz) {
        return questionRepository.findByQuiz(quiz);
    }

    @Override
    public List<Question> copyQuestions(List<Long> questionIds, Long targetQuizId) {
        Quiz targetQuiz = quizRepository.findById(targetQuizId).orElse(null);
        if (targetQuiz == null)
            return null;

        List<Question> newQuestions = new java.util.ArrayList<>();

        for (Long qId : questionIds) {
            Question original = questionRepository.findById(qId).orElse(null);
            if (original != null) {
                Question clone = new Question();
                clone.setContent(original.getContent());
                clone.setOption1(original.getOption1());
                clone.setOption2(original.getOption2());
                clone.setOption3(original.getOption3());
                clone.setOption4(original.getOption4());
                clone.setAnswer(original.getAnswer());
                clone.setImage(original.getImage());
                clone.setQuiz(targetQuiz);

                newQuestions.add(questionRepository.save(clone));
            }
        }

        // Update Quiz Stats
        if (targetQuiz.getQuestions() != null) {
            // Force refresh or just add count?
            // Since we just saved questions with setQuiz(targetQuiz), they are in DB.
            // But targetQuiz.getQuestions() might be stale cache.
            // Safest: Current count + added count
            int currentCount = targetQuiz.getQuestions().size();
            int newTotal = currentCount + newQuestions.size();
            targetQuiz.setNumOfQuestions(newTotal);
            targetQuiz.setMaxMarks(String.valueOf(newTotal * 5)); // Assuming 5 marks per question
        } else {
            targetQuiz.setNumOfQuestions(newQuestions.size());
            targetQuiz.setMaxMarks(String.valueOf(newQuestions.size() * 5));
        }
        quizRepository.save(targetQuiz);
        return newQuestions;
    }
}
