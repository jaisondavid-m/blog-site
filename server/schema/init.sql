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
ALTER TABLE users ADD COLUMN is_guest BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_users_is_guest ON users(is_guest);

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

CREATE TABLE blog_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    author_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    tag VARCHAR(100),
    cover_image VARCHAR(255),
    status ENUM(
        'draft',
        'published',
        'archived'
    ) DEFAULT 'draft',
    views_count INT UNSIGNED DEFAULT 0,
    likes_count INT UNSIGNED DEFAULT 0,
    comments_count INT UNSIGNED DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_blog_author
ON blog_posts(author_id);

CREATE INDEX idx_blog_status
ON blog_posts(status);

CREATE INDEX idx_blog_published
ON blog_posts(published_at);

CREATE TABLE blog_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_comment_id BIGINT UNSIGNED NULL,
    comment_text TEXT NOT NULL,
    likes_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (post_id)
        REFERENCES blog_posts(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (parent_comment_id)
        REFERENCES blog_comments(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_comment_post
ON blog_comments(post_id);

CREATE INDEX idx_comment_user
ON blog_comments(user_id);

CREATE INDEX idx_comment_parent
ON blog_comments(parent_comment_id);

CREATE TABLE blog_likes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_post_like (
        post_id,
        user_id
    ),

    FOREIGN KEY (post_id)
        REFERENCES blog_posts(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
ALTER TABLE blog_likes ADD CONSTRAINT unqi_post_user UNIQUE (post_id, user_id);

CREATE INDEX idx_like_post
ON blog_likes(post_id);

CREATE INDEX idx_like_user
ON blog_likes(user_id);

CREATE TABLE blog_bookmarks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_bookmark (
        post_id,
        user_id
    )

    FOREIGN KEY (post_id)
        REFERENCES blog_posts(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_bookmark_post ON blog_bookmarks(post_id);
CREATE INDEX idx_bookmark_user ON blog_bookmarks(post_id);

CREATE TABLE blog_posts_views (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_view_user (post_id, user_id),
    UNIQUE KEY uq_view_ip (post_id, ip_address),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)


CREATE TABLE blog_comment_likes (

    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_comment_like (comment_id, user_id),

    FOREIGN KEY (comment_id)
        REFERENCES blog_comments(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);

CREATE INDEX idx_comment_likes_commnet ON blog_comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON blog_comment_likes(user_id);


CREATE TABLE notifications (

    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    recipient_id BIGINT UNSIGNED NOT NULL,
    actor_id BIGINT UNSIGNED NOT NULL,
    type ENUM('mention_post', 'mention_comment') NOT NULL,
    post_id BIGINT UNSIGNED NULL,
    comment_id BIGINT UNSIGNED NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE

);

CREATE INDEX idx_notif_recipient ON notifications(recipient_id, is_read)

CREATE TABLE blog_post_reports (

    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    post_id BIGINT UNSIGNED NOT NULL,
    reporter_id BIGINT UNSIGNED NOT NULL,
    reason ENUM(
        'span',
        'harassment',
        'hate_speech',
        'misinformation'
    ) NOT NULL,
    description TEXT,
    status ENUM(
        'pending',
        'reviewed',
        'dismissed'
    ) DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_report_post_reporter (post_id, reporter_id),

    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL

);

-- UPDATE blog_post_reports SET reason = 'spam' WHERE reason = 'span' AND id > 0;
ALTER TABLE blog_post_reports
MODIFY COLUMN reason ENUM(
    'spam',
    'harassment',
    'hate_speech',
    'misinformation',
    'nudity',
    'violence',
    'other'
) NOT NULL;

CREATE INDEX idx_report_post ON blog_post_reports(post_id);
CREATE INDEX idx_report_status ON blog_post_reports(status);
CREATE INDEX idx_report_reporter ON blog_post_reports(reporter_id);