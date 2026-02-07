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

