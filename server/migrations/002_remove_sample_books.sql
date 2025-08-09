-- Remove sample books migration
-- This removes the placeholder books that were inserted in the initial migration

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
