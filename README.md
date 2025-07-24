# 📚 BookVibe - AI-Powered Book Recommendations

BookVibe is a mobile-first web application designed for avid readers who consume 5+ books per month. Get personalized book recommendations based on your current mood, snap photos of your bookshelf to automatically add books to your library, and track your reading progress.

## ✨ Features

- **Mood-Based Recommendations**: Get book suggestions based on how you're feeling (Escapist, Intense, Thoughtful, Light & Fun)
- **Photo Book Detection**: Take a photo of your bookshelf and automatically detect and add books to your library
- **Reading Progress Tracking**: Monitor your yearly reading goals and streaks
- **Mobile-Optimized**: Beautiful, responsive design optimized for iPhone and mobile devices
- **Goodreads Integration**: Connect your Goodreads account to import your existing library (coming soon)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Google Cloud Vision API key (for photo book detection)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bookvibe.git
   cd bookvibe
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/bookvibe
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # API Keys
   GOOGLE_CLOUD_VISION_API_KEY=your_google_vision_api_key
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb bookvibe
   
   # Run migrations
   psql -d bookvibe -f server/migrations/001_initial_schema.sql
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🚢 Railway Deployment

### Automatic Deployment

1. **Connect to Railway**
   - Fork this repository
   - Connect your GitHub account to Railway
   - Create a new project and select your forked repository

2. **Add Environment Variables**
   In your Railway dashboard, add these environment variables:
   ```
   DATABASE_URL=<your-railway-postgres-url>
   NODE_ENV=production
   GOOGLE_CLOUD_VISION_API_KEY=<your-api-key>
   PORT=5000
   ```

3. **Add PostgreSQL Database**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Copy the connection string to your `DATABASE_URL` environment variable

4. **Run Database Migration**
   ```bash
   # Connect to your Railway PostgreSQL and run:
   psql $DATABASE_URL -f server/migrations/001_initial_schema.sql
   ```

5. **Deploy**
   - Railway will automatically detect and deploy both frontend and backend
   - Your app will be available at your Railway-provided domain

### Manual Railway CLI Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set GOOGLE_CLOUD_VISION_API_KEY=your_key

# Deploy
railway up
```

## 📱 API Documentation

### Books API

- `GET /api/books/recommendations?mood=escapist&limit=1` - Get book recommendations
- `GET /api/books/search?q=query` - Search books by title/author
- `POST /api/books/bulk-import` - Import multiple books

### Users API

- `GET /api/users/session/:sessionId` - Get or create user
- `GET /api/users/:sessionId/stats` - Get reading statistics
- `GET /api/users/:sessionId/books` - Get user's books
- `POST /api/users/:sessionId/books` - Add book to library
- `PUT /api/users/:sessionId/books/:bookId` - Update book status

### Photos API

- `POST /api/photos/upload` - Upload photo for book detection
- `POST /api/photos/confirm-books` - Confirm and import detected books

## 🏗️ Architecture

```
bookvibe/
├── client/                 # React frontend (Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── services/       # API client and utilities
│   │   └── App.jsx         # Main application component
│   └── public/             # Static assets
├── server/                 # Node.js/Express backend
│   ├── routes/            # API route handlers
│   ├── models/            # Sequelize database models
│   ├── services/          # Business logic services
│   ├── controllers/       # Request controllers
│   └── migrations/        # Database migrations
└── README.md
```

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Lucide React (icons)
- Axios (HTTP client)

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Multer (file uploads)

**External APIs:**
- Google Cloud Vision API (text detection)
- Google Books API (book metadata)
- Open Library API (book data)

**Deployment:**
- Railway (hosting)
- PostgreSQL (database)

## 🔧 Development

### Running Tests
```bash
# Frontend tests
cd client && npm test

# Backend tests
cd server && npm test
```

### Code Formatting
```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Database Management
```bash
# Create migration
npm run migration:create -- --name migration_name

# Run migrations
npm run migration:run

# Rollback migration
npm run migration:rollback
```

## 📸 Photo Book Detection

The app uses Google Cloud Vision API to detect text from photos of bookshelves:

1. **Text Extraction**: OCR processing to extract text from images
2. **Title Parsing**: Intelligent parsing to identify book titles from spine text
3. **Book Matching**: Match detected titles against Google Books and Open Library APIs
4. **Metadata Enrichment**: Automatically fetch book details, covers, and ratings

### Tips for Best Results:
- Take photos in good lighting
- Ensure book spines are clearly visible
- Keep the camera steady
- Avoid shadows and glare

## 🎨 Design Philosophy

BookVibe is designed with a mobile-first approach, specifically optimized for iPhone users:

- **Warm, cozy gradients** that feel inviting and book-like
- **One-handed navigation** with thumb-friendly button placement
- **Quick decision-making** with simple swipe-like interactions
- **Mood-driven experience** that adapts to how you're feeling

## 🚧 Roadmap

- [ ] Goodreads integration for importing existing libraries
- [ ] Reading challenges and achievements
- [ ] Social features (book clubs, friend recommendations)
- [ ] AI-powered reading insights and analytics
- [ ] Advanced filtering (genre, length, publication year)
- [ ] Offline mode with sync capabilities
- [ ] Dark mode support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Books API for book metadata
- Open Library for additional book data
- Tailwind CSS for the beautiful styling system
- Railway for seamless deployment

---

**Built with ❤️ for book lovers everywhere** 📚✨
