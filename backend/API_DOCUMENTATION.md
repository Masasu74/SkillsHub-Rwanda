# SkillsHub Rwanda API Documentation

The SkillsHub Rwanda API powers authentication, course management, enrollments, and progress tracking. This document highlights the main endpoints and usage patterns after the platform transformation.

---

## Base URL

```
http://localhost:4000/api
```

---

## Authentication

### POST `/auth/register`
Register a new student account.

| Field     | Type   | Required | Notes                               |
|-----------|--------|----------|-------------------------------------|
| `name`    | string | ✅        | Full name                           |
| `email`   | string | ✅        | Unique email                        |
| `password`| string | ✅        | Minimum 8 characters                |
| `bio`     | string | ❌        | Short profile intro                 |
| `skills`  | array  | ❌        | List of skill keywords              |
| `location`| string | ❌        | City / Province                     |

Returns `{ success, token, user }`.

### POST `/auth/login`
Authenticate a student, instructor, or admin user.

**Sample Response**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "65f...",
    "name": "Aline Uwase",
    "email": "aline.uwase@skillshub.rw",
    "role": "instructor",
    "profile": { "bio": "...", "skills": [], "location": "..." }
  }
}
```

### GET `/auth/me`
Retrieve the authenticated user. Requires `Authorization: Bearer <token>`.

---

## Courses

### GET `/courses`
List published courses. Query parameters:
- `search` – text search
- `category` – `technology|business|hospitality`
- `level` – `beginner|intermediate|advanced`
- `instructor` – instructor ObjectId
- `isPublished` – include drafts (`true|false`)

### POST `/courses` *(Instructor/Admin)*
Create a course with nested modules.

```json
{
  "title": "Hospitality Service Excellence",
  "description": "Deliver memorable experiences...",
  "category": "hospitality",
  "level": "intermediate",
  "duration": 28,
  "price": 0,
  "modules": [
    {
      "title": "Foundations of Hospitality",
      "content": "Understand service culture...",
      "videoUrl": "https://player.vimeo.com/video/85847266",
      "duration": 8,
      "resources": ["Service charter template"]
    }
  ],
  "imageUrl": "https://..."
}
```

### GET `/courses/:id`
Return course details (drafts require instructor/admin access).

### PUT `/courses/:id`
Update course metadata or modules. Only the owning instructor or an admin can update.

---

## Enrollments

### POST `/enrollments`
Enroll the current user in a course.

```json
{ "courseId": "65f1d..." }
```

Creates or returns an `Enrollment` document `{ student, course, progress, status, completedModules }`.

### GET `/enrollments/my-courses`
List the authenticated learner’s enrollments with populated course data.

### PUT `/enrollments/progress`
Update numeric progress (0–100). Useful for instructors/admin dashboards.

```json
{
  "courseId": "65f1d...",
  "progress": 75
}
```

Returns the updated enrollment.

---

## Progress Tracking

### GET `/progress/:courseId`
Return:
- `course` – full course document
- `enrollment` – learner enrollment record
- `progressEntries` – module-level status (completed, in-progress), timestamps, notes, time spent

### PUT `/progress/module-complete`
Toggle a module’s completion status and update overall enrollment progress.

```json
{
  "courseId": "65f1d...",
  "moduleId": "65f1e...",
  "completed": true,
  "timeSpentMinutes": 5,
  "notes": "Great lesson!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "progressEntry": { "...module progress..." },
    "enrollment": { "...updated enrollment..." }
  }
}
```

---

## Health & Diagnostics

- `GET /health` – server health (DB, cache, uploads, performance snapshot)
- `GET /performance/metrics` – extended metrics (development)
- `GET /performance/health` – uptime and resource usage

---

## Environment Variables

| Variable      | Description                       | Default                                      |
|---------------|-----------------------------------|----------------------------------------------|
| `PORT`        | API port                          | `4000`                                       |
| `MONGO_URI`   | MongoDB connection string         | `mongodb://127.0.0.1:27017/skillshub_rwanda` |
| `JWT_SECRET`  | JWT signing secret                | —                                            |
| `FRONTEND_URL`| Allowed CORS origin               | `http://localhost:5173`                      |

---

## Seeding Sample Data

Run the seed script to create demo users, instructors, courses, and enrollments:

```bash
cd backend
node scripts/createInitialData.js
```

Seeded credentials:
- Admin: `admin@skillshub.rw` / `Admin123!`
- Instructors: `aline.uwase@skillshub.rw`, `julien.ndoli@skillshub.rw`, `chloe.mugisha@skillshub.rw` (password `Teach123!`)
- Student: `emmanuel@student.skillshub.rw` (password `Student123!`)

---

## Testing Workflow

```bash
cd backend
npm install
npm test
npm run test:watch
npm run test:coverage
```

Tests use Jest under `backend/tests`. Configure `MONGO_URI_TEST` if required.

---

## Postman Collection

- Location: `backend/SkillsHub_Rwanda_API.postman_collection.json`
- Update the base URL to `http://localhost:4000/api`
- Use the new auth endpoints (`/auth/login`, `/auth/register`)
- Save tokens to an environment variable (e.g., `token`) for authenticated requests

---

## Changelog (Transformation Highlights)

- Replaced legacy customer/savings models with `User`, `Course`, `Enrollment`, `ProgressEntry`
- Introduced new `/api/auth`, `/api/courses`, `/api/enrollments`, `/api/progress` routes
- Added module-level progress tracking and enrollment analytics
- Seeded six sample courses across technology, business, and hospitality pillars
- Updated Tailwind theme, frontend pages, and documentation to the SkillsHub brand

For more context, refer to the root `README.md`. As new features land (mentoring, certifications, community), update this document with additional endpoints and workflows.

