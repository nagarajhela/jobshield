package com.jobshield.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:support@jobshield.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String firstName, String token) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify your JobShield account";

        logger.info("==================================================================");
        logger.info("📧 EMAIL VERIFICATION LINK FOR {}:", toEmail);
        logger.info("🔗 >>> {} <<<", verifyUrl);
        logger.info("==================================================================");

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 30px auto; background-color: #111827; border-radius: 12px; border: 1px solid #1f2937; overflow: hidden; }
                .header { background: linear-gradient(135deg, #1e3a8a 0%%, #3b82f6 100%%); padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 26px; color: #ffffff; letter-spacing: 1px; }
                .content { padding: 30px 25px; line-height: 1.6; font-size: 15px; color: #d1d5db; }
                .btn { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
                .footer { border-top: 1px solid #1f2937; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #0d131f; }
                .note { background-color: #1f2937; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🛡️ JobShield Security</h1>
                </div>
                <div class="content">
                  <h2>Hello, %s!</h2>
                  <p>Welcome to JobShield. To activate your account and start protecting your career search against scam job postings, please verify your email address.</p>
                  <p style="text-align: center;">
                    <a href="%s" class="btn">Verify Account</a>
                  </p>
                  <div class="note">
                    <p style="margin: 0;"><strong>Notice:</strong> This verification link will expire in <strong>24 hours</strong>.</p>
                  </div>
                  <p style="font-size: 13px; color: #9ca3af;">If the button above does not work, copy and paste this link into your browser:<br>
                  <a href="%s" style="color: #60a5fa; word-break: break-all;">%s</a></p>
                </div>
                <div class="footer">
                  <p>&copy; 2026 JobShield Security. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName != null ? firstName : "there", verifyUrl, verifyUrl, verifyUrl);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendPasswordResetEmail(String toEmail, String firstName, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "Reset your JobShield password";

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 30px auto; background-color: #111827; border-radius: 12px; border: 1px solid #1f2937; overflow: hidden; }
                .header { background: linear-gradient(135deg, #7c2d12 0%%, #ea580c 100%%); padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 26px; color: #ffffff; letter-spacing: 1px; }
                .content { padding: 30px 25px; line-height: 1.6; font-size: 15px; color: #d1d5db; }
                .btn { display: inline-block; padding: 14px 28px; background-color: #ea580c; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
                .footer { border-top: 1px solid #1f2937; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #0d131f; }
                .note { background-color: #1f2937; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🛡️ JobShield Password Reset</h1>
                </div>
                <div class="content">
                  <h2>Hello, %s</h2>
                  <p>We received a request to reset the password for your JobShield account. Click the button below to choose a new password:</p>
                  <p style="text-align: center;">
                    <a href="%s" class="btn">Reset Password</a>
                  </p>
                  <div class="note">
                    <p style="margin: 0;"><strong>Security Notice:</strong> This password reset link expires in <strong>1 hour</strong>.</p>
                  </div>
                  <p>If you did not make this request, you can safely ignore this email; your current password will remain active and unchanged.</p>
                  <p style="font-size: 13px; color: #9ca3af;">Link:<br>
                  <a href="%s" style="color: #fb923c; word-break: break-all;">%s</a></p>
                </div>
                <div class="footer">
                  <p>&copy; 2026 JobShield Security. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName != null ? firstName : "there", resetUrl, resetUrl, resetUrl);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendPasswordChangedEmail(String toEmail, String firstName) {
        String subject = "Your JobShield password was changed";

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 30px auto; background-color: #111827; border-radius: 12px; border: 1px solid #1f2937; overflow: hidden; }
                .header { background: linear-gradient(135deg, #065f46 0%%, #10b981 100%%); padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 26px; color: #ffffff; letter-spacing: 1px; }
                .content { padding: 30px 25px; line-height: 1.6; font-size: 15px; color: #d1d5db; }
                .footer { border-top: 1px solid #1f2937; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #0d131f; }
                .alert { background-color: #1c1917; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin: 15px 0; color: #fca5a5; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🛡️ Password Updated</h1>
                </div>
                <div class="content">
                  <h2>Hello, %s</h2>
                  <p>This is a confirmation that the password for your JobShield account (<strong>%s</strong>) was recently changed.</p>
                  <p>You can now log in using your new credentials.</p>
                  <div class="alert">
                    <p style="margin: 0;"><strong>Security Warning:</strong> If you did NOT initiate this password change, please contact JobShield Support immediately to secure your account.</p>
                  </div>
                </div>
                <div class="footer">
                  <p>&copy; 2026 JobShield Security. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(firstName != null ? firstName : "there", toEmail);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail.contains("@") ? fromEmail : "noreply@jobshield.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email sent successfully to {} with subject '{}'", to, subject);
        } catch (MessagingException e) {
            logger.error("MessagingException while sending email to {}: {}", to, e.getMessage());
        } catch (Exception e) {
            // Handled gracefully so local dev with placeholder credentials doesn't crash user operations
            logger.warn("Could not dispatch email to {} (SMTP may be unconfigured or using placeholder credentials): {}", to, e.getMessage());
        }
    }
}
