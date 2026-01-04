# 🎬 VidTube – Video Sharing Platform API

VidTube is a scalable backend for a video-sharing platform, inspired by modern video streaming applications. It is built with **Node.js**, **Express.js**, and **MongoDB**, and provides secure authentication, media uploads, and rich social features.

---

## 🚀 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT (Access & Refresh Tokens)
* **Media Storage:** Cloudinary
* **File Uploads:** Multer
* **Other Tools:** CORS, dotenv, custom middleware

---

## ✨ Features

### 🔐 Authentication & User Management

* User registration and login
* Secure authentication with JWT & refresh tokens
* Logout and password change
* User profile updates
* Channel profile endpoints

### 📹 Video Management

* Upload videos with Multer + Cloudinary
* Automatic media cleanup on failure
* Video listing with pagination
* Watch history aggregation
* Video metadata handling

### 💬 Social Interactions

* Comments on videos
* Likes system (videos & comments)
* Playlists (create, update, delete)
* Channel subscriptions
* Tweets / short posts support

### 🧠 Backend Architecture

* Scalable RESTful API design
* Reusable async wrappers
* Global error handling
* Standardized API response utilities
* MongoDB schemas with relational referencing
* Aggregation pipelines for advanced queries

### ⚙️ System & Middleware

* Configured CORS support
* Centralized middleware pipeline
* Health-check routes for monitoring

---

## 📁 Project Structure

```
vidTube/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── app.js
├── package.json
├── .env.sample
└── README.md
```

---

## 🛠️ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sulakshyana/vidTube.git
cd vidTube
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

```bash
cp .env.sample .env
```

Edit the `.env` file and add values for:

* `PORT`
* `MONGODB_URI`
* `JWT_SECRET`
* `JWT_REFRESH_SECRET`
* `CLOUDINARY_CLOUD_NAME`
* `CLOUDINARY_API_KEY`
* `CLOUDINARY_API_SECRET`

### 4️⃣ Run the Server

**Development**

```bash
npm run dev
```

**Production**

```bash
npm start
```

---

## 📌 API Capabilities Overview

* `/api/auth` – authentication & authorization
* `/api/users` – user & channel profiles
* `/api/videos` – video upload, fetch, history
* `/api/comments` – comments CRUD
* `/api/likes` – likes management
* `/api/playlists` – playlist operations
* `/api/subscriptions` – channel subscriptions
* `/api/health` – health check

---

## 🔮 Future Enhancements

* Video processing with FFmpeg
* Thumbnails & previews
* Advanced search & recommendations
* Frontend integration
* Real-time notifications

---

## 👤 Maintainer

**Sulakshyana**
GitHub: [https://github.com/Sulakshyana](https://github.com/Sulakshyana)

