-- Add password field to users table for login functionality
-- This migration adds a proper password_hash column to the users table

ALTER TABLE users 
ADD COLUMN password_hash VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX idx_users_password_hash ON users(password_hash);

-- Comments
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for login';

-- Update CarlyFries with her password (hash for "SamGusLegos")
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE goodreads_user_id = 'CarlyFries';
