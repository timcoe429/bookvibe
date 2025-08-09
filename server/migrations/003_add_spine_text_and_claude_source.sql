-- Add spine_text column to books table and update source enum
-- This adds support for Claude vision detection data

-- Add spine_text column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS spine_text TEXT;

-- Update the book_source enum to include claude_vision
-- First check if the type exists, then update it
DO $$
BEGIN
    -- Add claude_vision to the enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'claude_vision' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'book_source'
        )
    ) THEN
        ALTER TYPE book_source ADD VALUE 'claude_vision';
    END IF;
END$$;

-- Remove sample books (in case they still exist)
DELETE FROM user_books WHERE book_id IN (
  SELECT id FROM books WHERE 
  title IN (
    'The Seven Husbands of Evelyn Hugo',
    'Circe',
    'The Invisible Life of Addie LaRue',
    'Mexican Gothic',
    'The Midnight Library',
    'Beach Read',
    'The Song of Achilles',
    'Where the Crawdads Sing',
    'The Thursday Murder Club',
    'Gone Girl'
  )
);

DELETE FROM books WHERE title IN (
  'The Seven Husbands of Evelyn Hugo',
  'Circe',
  'The Invisible Life of Addie LaRue',
  'Mexican Gothic',
  'The Midnight Library',
  'Beach Read',
  'The Song of Achilles',
  'Where the Crawdads Sing',
  'The Thursday Murder Club',
  'Gone Girl'
);
