# SkillsHub Rwanda – Learning Platform MVP

SkillsHub Rwanda helps young people in Rwanda discover practical, job-ready skills.  
The current MVP delivers a streamlined learning experience with a modern landing page, featured course carousel, comprehensive course management, role-based access control, and automated certificate generation.

---

## Tech Stack

- **Frontend** – React 18, Vite, Tailwind CSS, React Router, React Toastify, jsPDF  
- **Backend** – Node.js, Express, Mongoose, JSON Web Tokens  
- **Database** – MongoDB Atlas  
- **File Storage** – Cloudinary (for video and image uploads)  
- **Authentication** – JWT with role-based access control (RBAC)

---

## Features

### Public Site
- Animated hero section with platform metrics and dynamic content
- Featured course carousel showing top 5 published courses
- Testimonials, fun facts, and contact form
- Smooth scrolling sections with embedded video walkthrough
- Responsive navigation with authentication links

### Student Experience
- JWT-based authentication and registration
- Course catalog with search/filter capabilities
- Enrollment in published courses
- Learning interface with:
  - Video player for course modules
  - Interactive exercises and activities
  - Knowledge check quizzes with scoring (70% pass threshold)
  - Real-time progress tracking
  - Module navigation and completion tracking
- Certificate generation (PDF) upon course completion
- Dashboard showing active/completed enrollments and learning momentum
- Progress overview page showing all enrolled courses

### Instructor Experience
- Course creation and management
- Upload course thumbnails and module videos to Cloudinary
- Add modules with content, exercises, activities, and quizzes
- Publish/draft course management
- View personal course analytics:
  - Total enrollments
  - Active/completed/dropped students
  - Average progress and completion rates
- View enrolled students with their individual progress
- Edit and delete own courses

### Admin Experience
- Full platform oversight and management
- Instructor account management:
  - Create, view, edit, and delete instructor accounts
  - View instructor details and their courses
- Course management (same as instructor, plus access to all courses)
- Dashboard showing platform-wide statistics
- Access to all instructor and course analytics

### Progress Tracking & Certificates
- **Comprehensive Progress Calculation**: Tracks completion of:
  - Course modules
  - Practical exercises
  - Hands-on activities
  - Knowledge check quizzes
- **Automatic Progress Recalculation**: Progress is recalculated when fetching enrollments to ensure accuracy
- **Real-time Updates**: Progress updates automatically as students complete course items
- **Certificate Generation**: 
  - Automatic certificate issuance when all course requirements are met
  - PDF certificate generation with student name and signature
  - Unique certificate IDs for verification

---

## API Overview

All authenticated routes expect an `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Create new user account | Public |
| `POST` | `/api/auth/login` | Login (student, instructor, admin) | Public |
| `GET` | `/api/auth/me` | Get current user profile | Authenticated |

### Courses
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/courses` | List published courses (filterable) | Public/Authenticated |
| `GET` | `/api/courses/:id` | Get course details | Authenticated |
| `POST` | `/api/courses` | Create new course | Instructor/Admin |
| `PUT` | `/api/courses/:id` | Update course | Instructor/Admin (owner) |
| `DELETE` | `/api/courses/:id` | Delete course | Instructor/Admin (owner) |
| `GET` | `/api/courses/my-courses` | Get instructor's courses | Instructor/Admin |
| `GET` | `/api/courses/:id/enrollments` | Get course enrollments | Instructor/Admin (owner) |
| `GET` | `/api/courses/:id/analytics` | Get course analytics | Instructor/Admin (owner) |

### Enrollments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/enrollments` | Enroll in a course | Student |
| `GET` | `/api/enrollments/my-courses` | Get student's enrollments | Student |
| `PUT` | `/api/enrollments/progress` | Update course progress | Student |

### Progress Tracking
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/progress/:courseId` | Get course progress | Student |
| `PUT` | `/api/progress/module-complete` | Mark module as complete | Student |
| `PUT` | `/api/progress/practice-complete` | Mark exercise/activity complete | Student |
| `POST` | `/api/progress/quiz` | Submit quiz attempt | Student |
| `GET` | `/api/progress/certificate/:courseId` | Get certificate status | Student |

### Instructors (Admin Only)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/auth/instructors` | List all instructors | Admin |
| `GET` | `/api/auth/instructors/:id` | Get instructor details | Admin |
| `POST` | `/api/auth/instructors` | Create instructor account | Admin |
| `PUT` | `/api/auth/instructors/:id` | Update instructor | Admin |
| `DELETE` | `/api/auth/instructors/:id` | Delete instructor | Admin |

### File Uploads
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/uploads/signature` | Get Cloudinary upload signature | Instructor/Admin |
| `POST` | `/api/uploads/file` | Upload file to Cloudinary | Instructor/Admin |

---

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:
```env
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app_name>
JWT_SECRET=your-super-secure-secret-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_FOLDER=skillshub
ENABLE_CLOUDINARY=true
```

Optionally create `frontend/.env` for custom API URL:
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: `admin@skillshub.rw` / `Admin123!`
- **Instructors**: 
  - `aline.uwase@skillshub.rw` / `Teach123!`
  - `julien.ndoli@skillshub.rw` / `Teach123!`
  - `chloe.mugisha@skillshub.rw` / `Teach123!`
- **Student**: `emmanuel@student.skillshub.rw` / `Student123!`
- **10 Published Courses** with:
  - Multiple modules per course
  - Practical exercises and activities
  - Knowledge check quizzes
  - Sample enrollments

### 4. Run the Application

```bash
# Backend (Terminal 1)
cd backend
npm run dev    # Server on http://localhost:4000

# Frontend (Terminal 2)
cd frontend
npm run dev    # Vite dev server on http://localhost:5173
```

Login with the seeded accounts or create a new account from the landing page.

---

## School Assignment Credentials

For grading or demonstration purposes, use these preloaded accounts:

- **Admin**: `admin@skillshub.rw` / `Admin123!`
- **Instructors**: 
  - `aline.uwase@skillshub.rw` / `Teach123!`
  - `julien.ndoli@skillshub.rw` / `Teach123!`
  - `chloe.mugisha@skillshub.rw` / `Teach123!`
- **Demo Student**: `emmanuel@student.skillshub.rw` / `Student123!`

---

## Repository Structure

```
skillshub-rwanda/
├── backend/
│   ├── config/            # Database & Cloudinary configuration
│   ├── controllers/       # Auth, course, enrollment, progress, upload handlers
│   ├── middleware/        # Auth & RBAC middleware
│   ├── models/            # User, Course, Enrollment, Progress schemas
│   ├── routes/            # API route definitions
│   ├── scripts/           # Data seeding scripts
│   └── server.js          # Express server entry point
├── frontend/
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # React context providers (App, Theme, Settings)
│       ├── layout/        # Layout components
│       ├── pages/         # Page components (Landing, Dashboard, Courses, etc.)
│       └── utils/         # Utility functions
└── README.md
```

---

## Key Features Implementation

### Role-Based Access Control (RBAC)
- **Students**: Can enroll in courses, track progress, download certificates
- **Instructors**: Can create/edit courses, view analytics, manage their courses
- **Admins**: Full access including instructor management

### Progress Tracking System
- Progress is calculated based on:
  - Module completion (1 point per module)
  - Exercise completion (1 point per exercise)
  - Activity completion (1 point per activity)
  - Quiz completion (1 point per quiz, requires 70% score to pass)
- Progress automatically recalculates when fetching enrollments
- Real-time updates as students complete course items

### Certificate Generation
- Certificates are automatically issued when:
  - All modules are completed
  - All exercises are completed
  - All activities are completed
  - All quizzes are passed (70% threshold)
- PDF certificates include:
  - Student name
  - Course title
  - Issue date
  - Unique certificate ID
  - Digital signature

### File Upload System
- Course thumbnails uploaded to Cloudinary
- Module videos uploaded to Cloudinary
- Automatic resource type detection (image/video)
- File size limits and validation

---

## Deployment Notes

- **Backend**: Deploy as Node.js application (Render, Railway, Fly.io, etc.)
- **Frontend**: Deploy as static site (Netlify, Vercel, Cloudflare Pages, etc.)
- **Environment Variables**: Configure production values for:
  - `MONGO_URI` (MongoDB Atlas connection string)
  - `JWT_SECRET` (secure random string)
  - `CLOUDINARY_*` (Cloudinary credentials)
  - `VITE_API_URL` (backend API URL for frontend)
- **Database**: Use MongoDB Atlas for production database

---

## Next Steps / Future Enhancements

- [ ] Add email notifications for course completion and certificates
- [ ] Implement live session scheduling and booking
- [ ] Add discussion forums for courses
- [ ] Integrate payment processing for premium courses
- [ ] Add video transcript and subtitles support
- [ ] Implement peer-to-peer learning features
- [ ] Add mobile app (React Native)
- [ ] Integrate with learning management system (LMS) standards
- [ ] Add gamification elements (badges, achievements, leaderboards)
- [ ] Implement advanced analytics and reporting dashboard

---

## Contributing

This is a school project for SkillsHub Rwanda. For contributions, please follow the existing code patterns and ensure all features are tested.

---

Made with purpose in Rwanda 🇷🇼  
Let's grow skills, careers, and communities together.
