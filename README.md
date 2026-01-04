# Aurora Backend API

Backend REST API for quizzes, flashcards, and collaborative quiz rooms built with Node.js, Express, TypeScript, and MongoDB. Includes JWT auth, role-based access control, and real-time room support.

## Quickstart

1. Clone and install

```bash
git clone <repository-url>
cd aurora-be
npm install
```

2. Configure environment (create .env in project root)

```env
# Server
SERVER_PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/aurora

# Auth
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me

# Default admin bootstrap (created at startup if no admin exists)
DEFAULT_ADMIN_EMAIL=admin@aurora.com
DEFAULT_ADMIN_PASSWORD=replace-me
```

3. Run

```bash
# Dev with reload
npm run dev

# Production
npm run build
npm start
```

## Scripts

- Dev server with ts-node-dev: `npm run dev`
- Type-check/build to dist: `npm run build`
- Run compiled server: `npm start`

## Environment Notes

- Startup creates a default admin using DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD when no admin exists; keep these secrets strong.
- CORS origins are whitelisted in [src/index.ts](src/index.ts); update the `allowedOrigins` array to match your frontend domains.
- MongoDB must be reachable at MONGO_URI before the server starts.

## API Base

- Base URL: `http://localhost:5000/api/v1`
- Auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- Protected resources (JWT required): notes, flashcards, questions, quizzes, rooms, attempts
- Admin-only endpoints under `/api/v1/admin`

## Project Structure (src)

```
config/        DB connection, default admin bootstrap
controllers/   Route handlers
middlewares/   Auth, role, and error middleware
models/        Mongoose schemas
routes/        Express routers
utils/         Token helpers
index.ts       App entrypoint
```

## Troubleshooting

- `npm run dev` fails immediately: check .env exists and MONGO_URI is reachable.
- CORS errors from browser: add your frontend origin to `allowedOrigins` in [src/index.ts](src/index.ts).
- Default admin not created: ensure DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD are set.

## Security Checklist

- Short-lived access tokens with refresh tokens
- HTTP-only cookies for tokens
- Password hashing with bcryptjs
- Role-based authorization (Student, Lecturer, Admin)
- CORS restricted to trusted origins

## Contributing

1. Fork and branch: `git checkout -b feature/<name>`
2. Commit and push: `git commit -m "feat: ..."` then `git push origin feature/<name>`
3. Open a Pull Request

## License

ISC License

## Author

- Gamitha Gimhana

## Support

Email gamitha.gimhana99@gmail.com or open an issue.

---

Built with ❤️ using Node.js, Express, and TypeScript
