# 🎬 Cinephile Archive (Final Project)

A full-stack Node.js + Express + MongoDB application for discovering movies (via TMDB), saving a curated local collection, managing a personal "Top 5" favorites list, and listening to soundtrack previews via external APIs.

## ✨ Features

- **🔐 Authentication:** Secure registration and login using JWT and bcrypt for password hashing.
- **👤 User Profile:** Private profile management (update username, email, avatar).
- **⭐ Favorites (Top 5):** Add/remove movies from both local DB and TMDB to a snapshot-based favorites list.
- **💾 Movies Resource:** Full CRUD functionality for a local movie database (MongoDB).
- **🌍 External APIs:**
  - **TMDB:** Search, detailed views, and "Now Playing" feed.
  - **iTunes:** Soundtrack previews for any movie title.
- **🎨 Modern UI:** Built with HTML and Tailwind CSS.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, bcrypt |
| **Validation** | Joi |
| **Frontend** | HTML, Tailwind CSS (CLI), Axios |

---

## 🚀 Project Setup

### 1. Prerequisites
- Node.js (LTS recommended)
- MongoDB (Local or Atlas)
- TMDB API Key

### 2. Clone & Install
```bash
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_FOLDER>
npm install

### 3. Environment Variables
Create a `.env` file in the root directory with the following:
``` env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
``` 
### 4. Build Command
```
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

### 5. Start Command
```bash
npm start
```

Open: http://localhost:3000/index.html

## Folder Structure:
```
├── controllers/
├── models/
├── routes/
├── middleware/
├── src/
│   ├── input.css
│   ├── output.css
│   ├── index.html
│   ├── profile.html
│   ├── login.html
│   ├── signup.html
│   └── movie.html
├── server.js
└── README.md
``` 

## API Documentation
Base URL: `http://localhost:3000`

- **🔓 Authentication (Public)**
  - `POST /api/auth/register` - Register a new user.
  - `POST /api/auth/login` - Authenticate and receive a JWT.

- **👤 User Routes (Private)**
Header: Authorization: Bearer <token>
  - `GET /api/user/profile` - Retrieve user's profile data.
  - `PUT /api/user/profile` - Update user's profile data.
  - `PUT /api/user/favorites` - Update user's favorites list.
  - `DELETE /api/user/favorites/:source/:movieId` - Remove a movie from favorites.

- **🎬 Movies (Second Resource)**
Public Read:
  - `GET /api/movies/public` - Get all movies in local DB.
  - `GET /api/movies/public/:id` - Get a single movie by ID.
Private CRUD:
  - `POST /api/movies` - Create a new movie.
  - `PUT /api/movies/:id` - Update a movie by ID.
  - `DELETE /api/movies/:id` - Delete a movie by ID.

- **🌍 External APIs: (Public)**
  - `GET /api/movies/search?q=query` - Search TMDB for movies.
  - `GET /api/movies/tmdb/:id` - Get detailed movie info from TMDB.
  - `GET /api/movies/now-playing` - Get now playing movies from TMDB.
  - `GET /api/movies/soundtrack?title=...&year=...` - Get soundtrack previews from iTunes.

## ✅ Validation & Security
- Input validation using Joi for all endpoints.
- Passwords hashed with bcrypt.
- JWT-based authentication for protected routes.
- CORS enabled for frontend-backend communication.

## Author
- Student: Tamerlan Yessimov