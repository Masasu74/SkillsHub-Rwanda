# SkillsHub Rwanda – Learning Platform MVP

SkillsHub Rwanda helps young people in Rwanda discover practical, job-ready skills.  
The current MVP delivers a streamlined learning experience with a modern landing page, featured course carousel, onboarding flow, and basic learner dashboard.

---

## Tech Stack

- **Frontend** – React 18, Vite, Tailwind CSS, React Router, React Toastify  
- **Backend** – Node.js, Express, Mongoose, JSON Web Tokens  
- **Database** – MongoDB  

---

## Features

### Public Site
- Animated hero with platform metrics, testimonials, and contact form
- Featured course carousel pulling live data (top five published courses)
- Smooth scrolling sections highlighting video walkthrough, fun facts, and partner CTA

### Authenticated Experience
- JWT-based authentication for students, instructors, and admins
- Course catalog with search/filter, enrollment, and module progress tracking
- Learning interface with video player, module checklist, and progress updates

### API Highlights
| Area        | Endpoint                    | Notes                                   |
|-------------|-----------------------------|-----------------------------------------|
| Auth        | `POST /api/auth/register`   | Create a learner account                |
|             | `POST /api/auth/login`      | Login (student, instructor, admin)      |
|             | `GET /api/auth/me`          | Current user profile                     |
| Courses     | `GET /api/courses`          | Filterable list of published courses     |
|             | `GET /api/courses/:id`      | Course detail (auth required for drafts) |
|             | `POST /api/courses`         | Create course (instructor/admin)         |
| Enrollments | `POST /api/enrollments`     | Join a course                            |
|             | `GET /api/enrollments/my-courses` | Learner enrollments               |
| Progress    | `PUT /api/enrollments/progress` | Update course + module progress     |

All authenticated routes expect an `Authorization: Bearer <token>` header.

---

## Quick Start

### 1. Install dependencies
```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 2. Configure environment variables
Create `backend/.env` (example):
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/skillshub_rwanda
JWT_SECRET=super-secure-secret
CLOUDINARY_URL=cloudinary://<your_api_key>:OlqTmYvGe0wDz_47yBsecluGZzI@ddlrwdiu9
```

Optionally create `frontend/.env` when pointing to a non-default API:
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Seed demo data
```bash
cd backend
npm run seed
```
Creates:
- Admin: `admin@skillshub.rw` / `Admin123!`
- Instructors: Aline, Julien, Chloe (`Teach123!`)
- Student: Emmanuel (`Student123!`)
- Ten published courses with modules, hands-on exercises, activities, and quizzes
- Sample enrollments for the learner dashboard
- Default Cloudinary folder for uploads: `skillshub/videos`

### 4. Run the stack
```bash
# backend
cd backend
npm run dev    # nodemon server on http://localhost:4000

# frontend
cd ../frontend
npm run dev    # Vite on http://localhost:5173
```

Login with the seeded accounts or create a new learner profile from the landing page.

---

## Repository Layout

```
skillshub-rwanda/
├── backend/
│   ├── config/            # Database connection
│   ├── controllers/       # Auth, course, enrollment, progress handlers
│   ├── middleware/        # Auth + role-based access helpers
│   ├── models/            # User, Course, Enrollment, Progress schemas
│   ├── routes/            # API endpoints
│   ├── scripts/           # createInitialData.js seeder
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/    # Landing sections, cards, nav, etc.
│       ├── context/       # Global app/system settings providers
│       ├── layout/        # Authenticated layout
│       ├── pages/         # Landing, Dashboard, CourseCatalog, Learn, Login
│       └── index.css      # Tailwind + custom animations
└── README.md
```

---

## Deployment Notes

- Backend is a lightweight Express server – deploy via Render, Railway, Fly.io, etc.
- Frontend is a static Vite build – deploy via Netlify, Vercel, or any static host.
- Remember to configure environment variables for production (`MONGO_URI`, `JWT_SECRET`, `VITE_API_URL`).

---

## Next Steps

- Build instructor dashboards (course analytics, learner progress exports)
- Add mentor booking / live session scheduling
- Enable notifications (email/SMS) for learning nudges
- Integrate payments for premium courses and cohorts

---

Made with purpose in Rwanda 🇷🇼  
Let’s grow skills, careers, and communities together.