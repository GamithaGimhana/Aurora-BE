# Aurora Backend API

A comprehensive backend REST API for an educational quiz and flashcard management system built with Node.js, Express, TypeScript, and MongoDB. Features include user authentication, role-based access control, and real-time quiz rooms.

## 🚀 Features

### Core Functionality

- **User Authentication & Authorization**

  - JWT-based authentication with access and refresh tokens
  - Role-based access control (Student, Lecturer, Admin)
  - Secure password hashing with bcryptjs
  - Cookie-based token management

- **Note Management**

  - Create, read, update, and delete study notes

- **Flashcard System**

  - CRUD operations for flashcard management
  - Support for custom flashcard creation

- **Question Bank**

  - Multiple choice question management
  - Difficulty levels and categorization

- **Quiz Management**

  - Create and manage quizzes
  - Assign questions to quizzes
  - Quiz configuration and settings

- **Quiz Rooms**

  - Real-time quiz sessions
  - Room-based quiz attempts
  - Leaderboard functionality

- **Attempt Tracking**

  - Record and track quiz attempts
  - Score calculation and history
  - Performance analytics

- **Admin Panel**
  - User management
  - System-wide statistics
  - Content moderation

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Development:** ts-node-dev

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (v5.0 or higher)
- Git

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd aurora-be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   SERVER_PORT=5000

   # Database
   MONGO_URI=mongodb://localhost:27017/aurora

   # JWT Secrets
   JWT_ACCESS_SECRET=your_access_token_secret_key
   JWT_REFRESH_SECRET=your_refresh_token_secret_key

   # Admin Credentials (Default Admin)
   ADMIN_EMAIL=admin@aurora.com
   ADMIN_PASSWORD=your_secure_admin_password
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "STUDENT"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Logout

```http
POST /auth/logout
```

#### Refresh Token

```http
POST /auth/refresh
```

### Protected Routes

All routes below require authentication via JWT access token in cookies or Authorization header.

#### Notes

- `GET /notes` - Get all user notes
- `POST /notes` - Create a new note
- `GET /notes/:id` - Get note by ID
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

#### Flashcards

- `GET /flashcards` - Get all flashcards
- `POST /flashcards` - Create flashcard
- `PUT /flashcards/:id` - Update flashcard
- `DELETE /flashcards/:id` - Delete flashcard

#### Questions

- `GET /questions` - Get all questions
- `POST /questions` - Create question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

#### Quizzes

- `GET /quizzes` - Get all quizzes
- `POST /quizzes` - Create quiz
- `GET /quizzes/:id` - Get quiz by ID
- `PUT /quizzes/:id` - Update quiz
- `DELETE /quizzes/:id` - Delete quiz

#### Quiz Rooms

- `GET /rooms` - Get all quiz rooms
- `POST /rooms` - Create quiz room
- `GET /rooms/:id` - Get room details
- `POST /rooms/:id/join` - Join a quiz room
- `GET /rooms/:id/leaderboard` - Get room leaderboard

#### Attempts

- `GET /attempts` - Get user's quiz attempts
- `POST /attempts` - Submit quiz attempt
- `GET /attempts/:id` - Get attempt details

#### Admin Routes (Requires ADMIN role)

- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/stats` - Get system statistics

## 🗂️ Project Structure

```
aurora-be/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.ts        # Database connection
│   │   └── createAdmin.ts # Default admin creation
│   ├── controllers/      # Route controllers
│   │   ├── admin.controller.ts
│   │   ├── attempt.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── flashcard.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   ├── note.controller.ts
│   │   ├── question.controller.ts
│   │   ├── quiz.controller.ts
│   │   └── quizRoom.controller.ts
│   ├── middlewares/      # Custom middlewares
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   ├── models/           # Mongoose models
│   │   ├── Attempt.ts
│   │   ├── Flashcard.ts
│   │   ├── Note.ts
│   │   ├── Question.ts
│   │   ├── Quiz.ts
│   │   ├── QuizRoom.ts
│   │   ├── RefreshToken.ts
│   │   └── User.ts
│   ├── routes/           # Route definitions
│   │   ├── admin.routes.ts
│   │   ├── attempt.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── flashcard.routes.ts
│   │   ├── note.routes.ts
│   │   ├── question.routes.ts
│   │   ├── quiz.routes.ts
│   │   └── quizRoom.routes.ts
│   ├── utils/            # Utility functions
│   │   └── tokens.ts
│   └── index.ts          # Application entry point
├── dist/                 # Compiled JavaScript (generated)
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## 🔐 Security Features

- **JWT Authentication:** Secure token-based authentication with short-lived access tokens and long-lived refresh tokens
- **Password Hashing:** Bcrypt with salt rounds for secure password storage
- **Role-Based Access Control:** Three-tier role system (Student, Lecturer, Admin)
- **CORS Protection:** Configured CORS policy for trusted origins
- **HTTP-only Cookies:** Secure cookie storage for tokens
- **Input Validation:** Request validation and sanitization

## 🧪 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🌟 Key Highlights

- **TypeScript:** Full type safety and enhanced developer experience
- **Modular Architecture:** Clean separation of concerns with MVC pattern
- **Scalable:** Easy to extend with new features and modules
- **Document Processing:** Support for PDF and DOCX file uploads and parsing
- **Production-Ready:** Proper error handling, logging, and security measures

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Gamitha Gimhana - Owner

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- All contributors and supporters

## 📞 Support

For support, email gamitha.gimhana99@gmail.com or open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, and TypeScript**
