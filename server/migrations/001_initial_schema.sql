-- BookVibe Database Schema
-- Run this migration to set up the initial database structure

-- Create ENUM types
CREATE TYPE mood_type AS ENUM ('escapist', 'intense', 'thoughtful', 'light');
CREATE TYPE book_status AS ENUM ('to-read', 'reading', 'read', 'dnf');
CREATE TYPE book_source AS ENUM ('goodreads', 'photo', 'manual');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    goodreads_user_id VARCHAR(255) UNIQUE,
    preferences JSONB DEFAULT '{
        "favoriteGenres": [],
        "readingGoal": 52,
        "preferredMoods": ["escapist"]
    }',
    stats JSONB DEFAULT '{
        "booksThisYear": 0,
        "totalBooks": 0,
        "currentStreak": 0,
        "longestStreak": 0
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500) NOT NULL,
    isbn VARCHAR(20),
    goodreads_id VARCHAR(50) UNIQUE,
    google_books_id VARCHAR(50),
    open_library_id VARCHAR(100),
    pages INTEGER,
    description TEXT,
    cover_url VARCHAR(1000),
    genre VARCHAR(200),
    mood mood_type DEFAULT 'escapist',
    average_rating DECIMAL(3,2),
    publication_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User books junction table
CREATE TABLE user_books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status book_status DEFAULT 'to-read',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_started TIMESTAMP WITH TIME ZONE,
    date_finished TIMESTAMP WITH TIME ZONE,
    source book_source DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Indexes for better performance
CREATE INDEX idx_books_title ON books USING GIN (to_tsvector('english', title));
CREATE INDEX idx_books_author ON books USING GIN (to_tsvector('english', author));
CREATE INDEX idx_books_mood ON books(mood);
CREATE INDEX idx_books_goodreads_id ON books(goodreads_id);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_rating ON books(average_rating);

CREATE INDEX idx_users_session_id ON users(session_id);
CREATE INDEX idx_users_goodreads_id ON users(goodreads_user_id);

CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_book_id ON user_books(book_id);
CREATE INDEX idx_user_books_status ON user_books(status);
CREATE INDEX idx_user_books_source ON user_books(source);
CREATE INDEX idx_user_books_date_added ON user_books(date_added);
CREATE INDEX idx_user_books_date_finished ON user_books(date_finished);

-- Full text search index
CREATE INDEX idx_books_full_text ON books USING GIN (
    to_tsvector('english', title || ' ' || author || ' ' || COALESCE(description, ''))
);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_books_updated_at BEFORE UPDATE ON user_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample books for demo purposes
INSERT INTO books (title, author, pages, mood, average_rating, publication_year, description) VALUES
('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 400, 'escapist', 4.25, 2017, 'A reclusive Hollywood icon finally tells her story to a young journalist.'),
('Circe', 'Madeline Miller', 393, 'thoughtful', 4.30, 2018, 'The story of the goddess who defied the gods and transformed Odysseus.'),
('The Invisible Life of Addie LaRue', 'V.E. Schwab', 560, 'escapist', 4.15, 2020, 'A woman cursed to be forgotten by everyone she meets.'),
('Mexican Gothic', 'Silvia Moreno-Garcia', 301, 'intense', 3.85, 2020, 'A gothic horror novel set in 1950s Mexico.'),
('The Midnight Library', 'Matt Haig', 288, 'thoughtful', 4.20, 2020, 'Between life and death is a library with infinite books and infinite regrets.'),
('Beach Read', 'Emily Henry', 352, 'light', 4.05, 2020, 'Two rival writers challenge each other to write outside their comfort zones.'),
('The Song of Achilles', 'Madeline Miller', 416, 'thoughtful', 4.35, 2011, 'The story of Achilles and Patroclus retold.'),
('Where the Crawdads Sing', 'Delia Owens', 384, 'escapist', 4.10, 2018, 'A murder mystery set in the marshlands of North Carolina.'),
('The Thursday Murder Club', 'Richard Osman', 368, 'light', 4.00, 2020, 'Four unlikely friends meet weekly to investigate cold cases.'),
('Gone Girl', 'Gillian Flynn', 432, 'intense', 4.05, 2012, 'A psychological thriller about a marriage gone terribly wrong.');

-- Function to get book recommendations based on mood
CREATE OR REPLACE FUNCTION get_book_recommendations(
    p_user_id INTEGER,
    p_mood mood_type DEFAULT 'escapist',
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    book_id INTEGER,
    title VARCHAR,
    author VARCHAR,
    pages INTEGER,
    mood mood_type,
    average_rating DECIMAL,
    cover_url VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.author,
        b.pages,
        b.mood,
        b.average_rating,
        b.cover_url
    FROM books b
    INNER JOIN user_books ub ON b.id = ub.book_id
    WHERE ub.user_id = p_user_id
    AND ub.status = 'to-read'
    AND b.mood = p_mood
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user reading stats
CREATE OR REPLACE FUNCTION calculate_user_stats(p_user_id INTEGER)
RETURNS TABLE (
    books_this_year INTEGER,
    total_books INTEGER,
    in_queue INTEGER,
    currently_reading INTEGER
) AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM user_books ub 
            WHERE ub.user_id = p_user_id 
            AND ub.status = 'read' 
            AND EXTRACT(YEAR FROM ub.date_finished) = current_year
        ), 0) as books_this_year,
        
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM user_books ub 
            WHERE ub.user_id = p_user_id 
            AND ub.status = 'read'
        ), 0) as total_books,
        
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM user_books ub 
            WHERE ub.user_id = p_user_id 
            AND ub.status = 'to-read'
        ), 0) as in_queue,
        
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM user_books ub 
            WHERE ub.user_id = p_user_id 
            AND ub.status = 'reading'
        ), 0) as currently_reading;
END;
$$ LANGUAGE plpgsql;

-- View for user book details with book information
CREATE VIEW user_books_with_details AS
SELECT 
    ub.id as user_book_id,
    ub.user_id,
    ub.status,
    ub.rating,
    ub.date_added,
    ub.date_started,
    ub.date_finished,
    ub.source,
    b.id as book_id,
    b.title,
    b.author,
    b.isbn,
    b.pages,
    b.description,
    b.cover_url,
    b.genre,
    b.mood,
    b.average_rating,
    b.publication_year,
    b.goodreads_id,
    b.google_books_id
FROM user_books ub
JOIN books b ON ub.book_id = b.id;

-- Add some constraints for data integrity
ALTER TABLE books ADD CONSTRAINT chk_pages_positive CHECK (pages > 0);
ALTER TABLE books ADD CONSTRAINT chk_publication_year CHECK (publication_year > 1000 AND publication_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 5);
ALTER TABLE books ADD CONSTRAINT chk_rating_range CHECK (average_rating >= 0 AND average_rating <= 5);

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user sessions and preferences';
COMMENT ON TABLE books IS 'Master book catalog with metadata';
COMMENT ON TABLE user_books IS 'Junction table linking users to their books with reading status';
COMMENT ON FUNCTION get_book_recommendations IS 'Returns random book recommendations for a user based on mood';
COMMENT ON FUNCTION calculate_user_stats IS 'Calculates reading statistics for a user';
COMMENT ON VIEW user_books_with_details IS 'Combines user book data with full book details for easy querying';
