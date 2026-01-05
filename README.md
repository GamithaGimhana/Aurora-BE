<div align="center">

# 🎓 Aurora Learning Management System - Backend API

### Robust, Type-Safe REST API for Enhanced Learning Experience

[![Live Demo](https://img.shields.io/badge/Live-API-success?style=for-the-badge)](https://aurora-be.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-13aa52?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure-FF6B6B?logo=json-web-tokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📖 Table of Contents

- [Project Title & Description](#-project-title--description)
- [Technologies & Tools](#-technologies--tools)
- [Setup Instructions](#-setup-instructions)
- [Deployed URLs](#-deployed-urls)
- [Features & API Endpoints](#-features--api-endpoints)

---

## 🌟 Project Title & Description

**Aurora Backend API** is a comprehensive, production-ready REST API that powers the Aurora Learning Management System. Built with **Node.js**, **Express.js**, and **TypeScript**, this backend provides secure, scalable endpoints for managing quizzes, flashcards, notes, quiz rooms, and real-time student interactions.

The API enforces strict role-based access control (RBAC) for three user roles—**Admin**, **Lecturer**, and **Student**—ensuring data integrity and security across all operations. With JWT-based authentication, MongoDB persistence, and comprehensive error handling, Aurora Backend is engineered for reliability and performance.

### Why Aurora Backend?

- **Type-Safe**: Built entirely in TypeScript for compile-time error detection and better developer experience
- **Secure by Default**: JWT authentication, bcryptjs password hashing, CORS protection, and HTTP-only cookies
- **Role-Based Architecture**: Fine-grained access control with middleware-enforced permissions
- **RESTful Design**: Clean, intuitive API endpoints following REST conventions
- **Real-Time Capable**: Foundation for WebSocket integration and live quiz rooms
- **PDF Generation**: Built-in support for generating attempt reports as PDF documents
- **Scalable**: Modular architecture with separation of concerns (controllers, services, models)

---

## 🛠️ Technologies & Tools

### Backend Stack

| Technology     | Version | Purpose                                        |
| -------------- | ------- | ---------------------------------------------- |
| **Node.js**    | 18.x+   | JavaScript runtime for server-side code        |
| **Express.js** | 4.x     | Minimal and flexible web application framework |
| **TypeScript** | 5.x     | Type-safe JavaScript for robust code           |
| **MongoDB**    | 5.0+    | NoSQL database for flexible data storage       |
| **Mongoose**   | Latest  | MongoDB object modeling for Node.js            |
| **JWT**        | Latest  | Secure token-based authentication              |
| **bcryptjs**   | Latest  | Password hashing and encryption                |
| **CORS**       | Latest  | Cross-origin resource sharing                  |
| **PDFKit**     | Latest  | PDF document generation                        |

### Development Tools

| Tool              | Purpose                          |
| ----------------- | -------------------------------- |
| **Git**           | Version control                  |
| **npm**           | Package manager                  |
| **ts-node**       | TypeScript execution for Node.js |
| **Vercel**        | Cloud deployment platform        |
| **MongoDB Atlas** | Cloud database hosting           |

---

## ⚡ Setup Instructions

### Backend Setup

#### Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (bundled with Node.js)
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud instance)
- **Git** ([Download](https://git-scm.com/))

#### Backend Installation & Run

1. **Clone the Backend Repository**

   ```bash
   git clone <backend-repository-url>
   cd aurora-be
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the backend root directory:

   ```env
   SERVER_PORT=5000
   MONGO_URI=mongodb://localhost:27017/aurora
   JWT_ACCESS_SECRET=your-access-token-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
   DEFAULT_ADMIN_EMAIL=admin@aurora.com
   DEFAULT_ADMIN_PASSWORD=your-strong-password-here
   ```

4. **Start the Backend Server**

   ```bash
   npm run dev
   ```

   You should see:

   ```
   Server running on http://localhost:5000
   Database connected successfully
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

### Frontend Setup

For complete setup instructions for the frontend application, refer to the [Frontend Repository](https://github.com/your-org/aurora-fe).

Quick start:

```bash
# Terminal 1 - Backend
cd aurora-be
npm install
npm run dev
# Backend will run on http://localhost:5000

# Terminal 2 - Frontend
cd aurora-fe
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🌐 Deployed URLs

Experience Aurora live:

- **Backend API**: [https://aurora-be.vercel.app/](https://aurora-be.vercel.app/)
- **Frontend Application**: [https://aurora-fe-eight.vercel.app/](https://aurora-fe-eight.vercel.app/)

> **Note**: The live application is deployed on Vercel. The backend API serves all requests for the frontend application.

---

## 📚 Features & API Endpoints

### Core API Features

#### 🔐 Authentication & Authorization

- **User Registration**: Create new user accounts with role selection
- **Secure Login**: JWT-based authentication with access & refresh tokens
- **Token Refresh**: Maintain sessions with refresh token rotation
- **Role-Based Access Control (RBAC)**: Admin, Lecturer, and Student role enforcement
- **HTTP-Only Cookies**: Secure token storage preventing XSS attacks
- **Password Security**: Bcryptjs hashing with salt rounds for maximum security

#### 📝 Quiz Management

- **Quiz CRUD Operations**: Create, read, update, delete quizzes
- **Question Management**: Full question bank with multiple question types
- **Quiz Publishing**: Control quiz visibility and accessibility
- **Attempt Tracking**: Record and analyze student quiz attempts
- **Performance Analytics**: Detailed metrics on student performance

#### 📚 Flashcard System

- **Deck Creation**: Organize flashcards into study decks
- **Card Management**: Add, edit, delete flashcards
- **Study Sessions**: Track study progress and spaced repetition
- **Performance Metrics**: Monitor flashcard mastery levels

#### 📓 Notes Management

- **Note CRUD Operations**: Full note-taking functionality
- **Organization**: Categorize and tag notes for easy retrieval
- **Search Functionality**: Find notes quickly with text search
- **Sharing Capabilities**: Share notes with classmates (students only)

#### 🏠 Quiz Rooms (Real-Time Features)

- **Room Creation**: Lecturers can create live quiz sessions
- **Room Management**: Control access, monitor participants, manage quiz flow
- **Student Participation**: Students join rooms using access codes
- **Real-Time Leaderboards**: Live ranking during quiz sessions
- **Attempt Recording**: Automatic capture of student responses and timing

#### 📊 Admin Features

- **User Management**: Complete CRUD for all users
- **Role Assignment**: Assign and modify user roles
- **System Analytics**: Monitor platform usage and statistics
- **Default Admin Bootstrap**: Automatic creation of first admin on startup

#### 📄 Report Generation

- **PDF Attempt Reports**: Generate detailed attempt reports as PDF documents
- **Performance Summaries**: Export student performance data
- **Customizable Branding**: Reports include Aurora branding and styling

### API Endpoint Structure

```
Base URL: /api/v1

Authentication:
  POST   /auth/register          - Register new user
  POST   /auth/login             - Login user
  POST   /auth/logout            - Logout user
  POST   /auth/refresh           - Refresh access token

Quizzes:
  GET    /quizzes                - Get all quizzes (paginated)
  GET    /quizzes/:id            - Get specific quiz
  POST   /quizzes                - Create new quiz (Lecturer/Admin)
  PUT    /quizzes/:id            - Update quiz (Lecturer/Admin)
  DELETE /quizzes/:id            - Delete quiz (Lecturer/Admin)

Questions:
  GET    /questions              - Get all questions
  POST   /questions              - Create question (Lecturer/Admin)
  PUT    /questions/:id          - Update question (Lecturer/Admin)
  DELETE /questions/:id          - Delete question (Lecturer/Admin)

Flashcards:
  GET    /flashcards             - Get user's flashcards
  POST   /flashcards             - Create flashcard
  PUT    /flashcards/:id         - Update flashcard
  DELETE /flashcards/:id         - Delete flashcard

Notes:
  GET    /notes                  - Get user's notes
  POST   /notes                  - Create note
  PUT    /notes/:id              - Update note
  DELETE /notes/:id              - Delete note

Attempts:
  GET    /attempts               - Get user's attempts
  GET    /attempts/:id           - Get specific attempt
  POST   /attempts               - Start new attempt
  PUT    /attempts/:id           - Submit attempt
  GET    /attempts/:id/report    - Download attempt report (PDF)

Quiz Rooms:
  GET    /quiz-rooms             - Get all quiz rooms
  GET    /quiz-rooms/:id         - Get specific room
  POST   /quiz-rooms             - Create quiz room (Lecturer/Admin)
  PUT    /quiz-rooms/:id         - Update room (Lecturer/Admin)
  POST   /quiz-rooms/:id/join    - Join quiz room (Student)
  GET    /quiz-rooms/:id/leaderboard - Get live leaderboard

Admin:
  GET    /admin/users            - Get all users
  POST   /admin/users            - Create user
  PUT    /admin/users/:id        - Update user
  DELETE /admin/users/:id        - Delete user
  GET    /admin/analytics        - Get system analytics
```

### Security Features

- 🔒 **JWT Authentication**: Secure token-based authentication
- 🔐 **Password Hashing**: Bcryptjs with salt rounds for password security
- 🛡️ **CORS Protection**: Whitelist trusted origins
- ⚡ **Token Rotation**: Refresh tokens for maintaining secure sessions
- 🔄 **HTTP-Only Cookies**: Prevent XSS attacks by storing tokens securely
- 👥 **Role-Based Authorization**: Middleware-enforced access control
- ✅ **Input Validation**: Comprehensive request validation
- 🚨 **Error Handling**: Standardized error responses with meaningful messages

---

<div align="center">

**Built with ❤️ by Gamitha Gimhana using Node.js, Express.js, TypeScript, and MongoDB**

[⬆ Back to Top](#-aurora-learning-management-system---backend-api)

</div>
