package com.project.examportalbackend.services.implementation;

import com.azure.ai.formrecognizer.documentanalysis.DocumentAnalysisClient;
import com.azure.ai.formrecognizer.documentanalysis.DocumentAnalysisClientBuilder;
import com.azure.ai.formrecognizer.documentanalysis.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.azure.core.util.BinaryData;
import com.project.examportalbackend.models.Question;
import com.project.examportalbackend.models.Quiz;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AzureDocumentIntelligenceService {

    @Value("${azure.document-intelligence.endpoint}")
    private String endpoint;

    @Value("${azure.document-intelligence.key}")
    private String key;

    public List<Question> extractQuestions(MultipartFile file, Quiz quiz) throws IOException {
        DocumentAnalysisClient client = new DocumentAnalysisClientBuilder()
                .credential(new AzureKeyCredential(key))
                .endpoint(endpoint)
                .buildClient();

        BinaryData data = BinaryData.fromBytes(file.getBytes());

        // Use the prebuilt-layout model to extract text and structure
        // Alternatively, use prebuilt-read for just text
        AnalyzeResult operationResult = client.beginAnalyzeDocument("prebuilt-read", data)
                .getFinalResult();

        List<Question> questions = new ArrayList<>();

        // Simple heuristic: Each line starting with a number and dot is a new question?
        // This logic will need to be refined based on the document structure.
        // For a proof of concept, we'll try to extract paragraphs that look like
        // questions and options.

        StringBuilder fullText = new StringBuilder();
        for (DocumentPage page : operationResult.getPages()) {
            for (DocumentLine line : page.getLines()) {
                fullText.append(line.getContent()).append("\n");
            }
        }

        // Extremely basic parsing logic - this is just a placeholder and will likely
        // need refinement
        // to handle specific PDF layouts provided by the user.
        String[] lines = fullText.toString().split("\n");
        Question currentQuestion = null;

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty())
                continue;

            // Pattern: "1. What is...?"
            if (line.matches("^\\d+[\\.\\)].*")) {
                if (currentQuestion != null) {
                    questions.add(currentQuestion);
                }
                currentQuestion = new Question();
                currentQuestion.setContent(line.replaceAll("^\\d+[\\.\\)]\\s*", ""));
                currentQuestion.setQuiz(quiz);
            } else if (currentQuestion != null) {
                // Heuristic for options: Lines starting with A), B), C), D) or A., B. ...
                if (line.matches("^[A-Da-d][\\.\\)].*")) {
                    String optionText = line.replaceAll("^[A-Da-d][\\.\\)]\\s*", "");
                    if (currentQuestion.getOption1() == null)
                        currentQuestion.setOption1(optionText);
                    else if (currentQuestion.getOption2() == null)
                        currentQuestion.setOption2(optionText);
                    else if (currentQuestion.getOption3() == null)
                        currentQuestion.setOption3(optionText);
                    else if (currentQuestion.getOption4() == null)
                        currentQuestion.setOption4(optionText);
                } else if (line.toLowerCase().startsWith("answer:")) {
                    String extractedAnswer = line.substring(7).trim().toLowerCase();
                    if (extractedAnswer.startsWith("a") || extractedAnswer.equals("1")) {
                        currentQuestion.setAnswer("option1");
                    } else if (extractedAnswer.startsWith("b") || extractedAnswer.equals("2")) {
                        currentQuestion.setAnswer("option2");
                    } else if (extractedAnswer.startsWith("c") || extractedAnswer.equals("3")) {
                        currentQuestion.setAnswer("option3");
                    } else if (extractedAnswer.startsWith("d") || extractedAnswer.equals("4")) {
                        currentQuestion.setAnswer("option4");
                    } else {
                        currentQuestion.setAnswer(extractedAnswer);
                    }
                } else {
                    // Append to content if it's not an option or answer
                    currentQuestion.setContent(currentQuestion.getContent() + " " + line);
                }
            }
        }

        if (currentQuestion != null) {
            questions.add(currentQuestion);
        }

        return questions;
    }
}
