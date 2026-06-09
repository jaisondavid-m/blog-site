CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    role ENUM(
        'user',
        'admin',
        'moderator'
    ) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    account_status ENUM(
        'active',
        'suspended',
        'banned'
    ) DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP  NULL
);

ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT '';

CREATE TABLE otp_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose ENUM(
        'email_verification',
        'password_reset'
    ) NOT NULL,
    attempts INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ALTER TABLE otp_requests
-- ADD INDEX idx_otp_code (otp_code);

-- ALTER TABLE users
-- ADD email_verified BOOLEAN DEFAULT FALSE,
-- ADD email_verified_at TIMESTAMP NULL;

CREATE INDEX idx_otp_code
ON otp_requests(otp_code);

CREATE INDEX idx_otp_verify
ON otp_requests(
    user_id,
    otp_code,
    purpose,
    verified
);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_otp_user
ON otp_requests(user_id);

CREATE INDEX idx_otp_purpose
ON otp_requests(purpose);

CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE password_reset_tokens
ADD UNIQUE KEY uq_password_reset_user (user_id);

CREATE INDEX idx_prt_token ON password_reset_tokens(token);
CREATE INDEX idx_prt_user_id ON password_reset_tokens(user_id);