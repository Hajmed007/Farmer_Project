package com.farmer.market.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token) {
        // Use standard frontend URL
        String verificationUrl = "http://localhost:5173/verify-email?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@farmermarket.com");
        message.setTo(to);
        message.setSubject("Verify your Farmer Market Account");
        message.setText("Thank you for registering! Please click the link below to verify your email address:\n\n" 
                        + verificationUrl + "\n\nIf you did not register, please ignore this email.");
        
        try {
            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
            System.out.println("Verification Link: " + verificationUrl);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send email to " + to);
            System.err.println("SMTP Error: " + e.getMessage());
            e.printStackTrace();
            // Fallback for easy access in logs
            System.out.println("=================================================");
            System.out.println("ACTIVATE ACCOUNT MANUALLY: " + verificationUrl);
            System.out.println("=================================================");
        }
    }
}
