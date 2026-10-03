package com.jobshield.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.jobshield.auth.entity.User;
import com.jobshield.auth.repository.UserRepository;
import com.jobshield.campaign.entity.ScamCampaign;
import com.jobshield.campaign.repository.ScamCampaignRepository;
import com.jobshield.community.CommunityReport;
import com.jobshield.community.CommunityReportRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ScamCampaignRepository scamCampaignRepository;
    private final CommunityReportRepository communityReportRepository;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ScamCampaignRepository scamCampaignRepository,
            CommunityReportRepository communityReportRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.scamCampaignRepository = scamCampaignRepository;
        this.communityReportRepository = communityReportRepository;
    }

    @Override
    public void run(String... args) {
        initAdminUser();
        initSampleCampaigns();
        initSampleReports();
    }

    private void initAdminUser() {
        final String adminEmail = "admin@jobshield.com";
        final String adminPassword = "Admin@123JobShield";

        try {
            Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
            if (existingAdmin.isEmpty()) {
                User admin = new User();
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                admin.setPhoneNumber("+18005550199");
                admin.setRole("ADMIN");
                admin.setAccountStatus("ACTIVE");
                admin.setEmailVerified(true);
                admin.setFailedLoginAttempts(0);
                admin.setLockedUntil(null);
                userRepository.save(admin);
                logger.info("Default Admin account created: {} / {}", adminEmail, adminPassword);
            } else {
                User admin = existingAdmin.get();
                boolean changed = false;
                if (!"ADMIN".equalsIgnoreCase(admin.getRole()) && !"ROLE_ADMIN".equalsIgnoreCase(admin.getRole())) {
                    admin.setRole("ADMIN");
                    changed = true;
                }
                if (!Boolean.TRUE.equals(admin.getEmailVerified())) {
                    admin.setEmailVerified(true);
                    changed = true;
                }
                if (!"ACTIVE".equalsIgnoreCase(admin.getAccountStatus())) {
                    admin.setAccountStatus("ACTIVE");
                    changed = true;
                }
                // Ensure password matches Admin@123JobShield
                if (!passwordEncoder.matches(adminPassword, admin.getPasswordHash())) {
                    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                    changed = true;
                }
                admin.setFailedLoginAttempts(0);
                admin.setLockedUntil(null);

                if (changed) {
                    userRepository.save(admin);
                    logger.info("Admin account {} refreshed with credentials: {}", adminEmail, adminPassword);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to initialize admin user: {}", e.getMessage());
        }
    }

    private void initSampleCampaigns() {
        try {
            if (scamCampaignRepository.count() == 0) {
                logger.info("Seeding initial scam campaigns...");

                ScamCampaign c1 = new ScamCampaign();
                c1.setCampaignCode("CAMP-PYRAMID-01");
                c1.setTitle("E-Commerce Rating Task Pyramid Scheme");
                c1.setDescription("Victims recruited to complete daily 30-minute product rating tasks on spoofed e-commerce domains. After initial small payouts, users are coerced into depositing crypto to unlock tier tiers.");
                c1.setSeverity("CRITICAL");
                c1.setPlatformOrigin("Telegram & WhatsApp");
                c1.setTargetedJobTitles("E-Commerce Associate, Rating Assistant, Product Tester");
                c1.setVictimCount(48);
                c1.setActive(true);
                c1.setFirstSeen(LocalDate.now().minusDays(25));
                c1.setLastSeen(LocalDate.now());
                scamCampaignRepository.save(c1);

                ScamCampaign c2 = new ScamCampaign();
                c2.setCampaignCode("CAMP-TYPIST-02");
                c2.setTitle("Telegram High-Pay Typist Advance Fee Syndicate");
                c2.setDescription("Fraudulent job postings promising $35-$50/hr for converting image files into Word docs. Victims required to pay $50 refundable ID badge security fees via USDT.");
                c2.setSeverity("CRITICAL");
                c2.setPlatformOrigin("LinkedIn & Telegram");
                c2.setTargetedJobTitles("Document Typist, Remote Copywriter, Transcriptionist");
                c2.setVictimCount(112);
                c2.setActive(true);
                c2.setFirstSeen(LocalDate.now().minusDays(40));
                c2.setLastSeen(LocalDate.now().minusDays(1));
                scamCampaignRepository.save(c2);

                ScamCampaign c3 = new ScamCampaign();
                c3.setCampaignCode("CAMP-HOTEL-03");
                c3.setTitle("Spoofed Hotel Hospitality Data Harvester");
                c3.setDescription("Fraudulent job listings using names of regional 5-star hotel chains. Directs applicants to malicious external form collecting passport scans, bank account credentials, and personal verification codes.");
                c3.setSeverity("HIGH");
                c3.setPlatformOrigin("JobStreet & Indeed");
                c3.setTargetedJobTitles("Front Desk Coordinator, Reservation Specialist, Guest Support");
                c3.setVictimCount(29);
                c3.setActive(true);
                c3.setFirstSeen(LocalDate.now().minusDays(15));
                c3.setLastSeen(LocalDate.now().minusDays(2));
                scamCampaignRepository.save(c3);

                logger.info("Successfully seeded 3 sample campaigns.");
            }
        } catch (Exception e) {
            logger.warn("Could not seed campaigns: {}", e.getMessage());
        }
    }

    private void initSampleReports() {
        try {
            if (communityReportRepository.count() == 0) {
                logger.info("Seeding initial community reports...");
                Optional<User> adminOpt = userRepository.findByEmail("admin@jobshield.com");
                if (adminOpt.isPresent()) {
                    User admin = adminOpt.get();

                    CommunityReport r1 = new CommunityReport();
                    r1.setReporter(admin);
                    r1.setCompanyName("Apex Data Transcription");
                    r1.setJobTitle("Remote Word Document Typist");
                    r1.setPlatform("Telegram");
                    r1.setJobUrl("https://t.me/apex_jobs_fake");
                    r1.setDescription("Recruiter requested RM 250 as a refundable test deposit to receive the first assignment. When asked for business registration, they immediately blocked my number and deleted the group chat.");
                    r1.setStatus("VERIFIED");
                    r1.setUpvotes(14);
                    r1.setDownvotes(0);
                    communityReportRepository.save(r1);

                    CommunityReport r2 = new CommunityReport();
                    r2.setReporter(admin);
                    r2.setCompanyName("Global Logistics Express");
                    r2.setJobTitle("Package Inspection Manager");
                    r2.setPlatform("Indeed");
                    r2.setJobUrl("https://spoofed-logistics-portal.com/careers");
                    r2.setDescription("Classic reshipping mule scam. Sent packages purchased with stolen credit cards to reship overseas. When police knocked on the door, company website vanished.");
                    r2.setStatus("VERIFIED");
                    r2.setUpvotes(32);
                    r2.setDownvotes(1);
                    communityReportRepository.save(r2);

                    logger.info("Successfully seeded 2 sample community reports.");
                }
            }
        } catch (Exception e) {
            logger.warn("Could not seed community reports: {}", e.getMessage());
        }
    }
}
