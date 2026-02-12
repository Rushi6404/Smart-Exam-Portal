package com.project.examportalbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("examportal30@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        javaMailSender.send(message);
    }

    // Helper for Welcome Email
    public void sendWelcomeEmail(String to, String username) {
        String subject = "Welcome to Exam Portal!";
        String text = "Hello " + username + ",\n\n" +
                      "Welcome to Exam Portal! Your registration was successful.\n" +
                      "We are excited to have you on board.\n\n" +
                      "Best Regards,\n" +
                      "Exam Portal Team";
        sendEmail(to, subject, text);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Password Reset Request";
        String text = "Your password reset token is: " + token + "\n\n" +
                      "Please use this token to reset your password.\n" +
                      "If you did not request a password reset, please ignore this email.";
        sendEmail(to, subject, text);
    }
}
