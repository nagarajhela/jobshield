-- ==========================================================
-- V2__add_new_columns.sql
-- Alter table statements for entity extensions added in Step 1
-- ==========================================================

-- 1. Users table new columns
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(50),
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- 2. Scam campaign table new columns
ALTER TABLE scam_campaign
    ADD COLUMN IF NOT EXISTS title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS severity VARCHAR(20),
    ADD COLUMN IF NOT EXISTS victim_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS targeted_job_titles VARCHAR(500),
    ADD COLUMN IF NOT EXISTS platform_origin VARCHAR(100),
    ADD COLUMN IF NOT EXISTS first_seen DATE,
    ADD COLUMN IF NOT EXISTS last_seen DATE,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Job analysis table new columns
ALTER TABLE job_analysis
    ADD COLUMN IF NOT EXISTS red_flags TEXT,
    ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS employer_status VARCHAR(30),
    ADD COLUMN IF NOT EXISTS recommended_actions TEXT,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS source_url VARCHAR(1024),
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(30) DEFAULT 'MANUAL';
