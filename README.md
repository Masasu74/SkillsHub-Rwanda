# SkillsHub Rwanda – Learning Platform MVP.

SkillsHub Rwanda helps young people in Rwanda discover practical, job-ready skills.  
The current MVP delivers a streamlined learning experience with a modern landing page, featured course carousel, comprehensive course management, role-based access control, and automated certificate generation.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Complete Setup Guide](#complete-setup-guide)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Install Node.js and npm](#step-2-install-nodejs-and-npm)
  - [Step 3: Set Up MongoDB Atlas](#step-3-set-up-mongodb-atlas)
  - [Step 4: Set Up Cloudinary](#step-4-set-up-cloudinary)
  - [Step 5: Configure Backend Environment](#step-5-configure-backend-environment)
  - [Step 6: Install Backend Dependencies](#step-6-install-backend-dependencies)
  - [Step 7: Install Frontend Dependencies](#step-7-install-frontend-dependencies)
  - [Step 8: Seed the Database](#step-8-seed-the-database)
  - [Step 9: Start the Backend Server](#step-9-start-the-backend-server)
  - [Step 10: Start the Frontend Development Server](#step-10-start-the-frontend-development-server)
  - [Step 11: Verify Installation](#step-11-verify-installation)
- [Features](#features)
- [API Overview](#api-overview)
- [School Assignment Credentials](#school-assignment-credentials)
- [Repository Structure](#repository-structure)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js) or **yarn**
3. **Git** - [Download here](https://git-scm.com/)
4. **A code editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)
5. **A MongoDB Atlas account** (free tier is sufficient) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
6. **A Cloudinary account** (free tier is sufficient) - [Sign up here](https://cloudinary.com/users/register_free)

---

## Complete Setup Guide

Follow these steps **in order** to get the project running on your local machine.

### Step 1: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
git clone https://github.com/Masasu74/SkillsHub-Rwanda.git
cd SkillsHub-Rwanda
```

This will download the project files to your computer and navigate into the project directory.

**What this does:** Downloads all the project source code to your local machine.

---

### Step 2: Install Node.js and npm

1. Check if Node.js is installed:
   ```bash
   node --version
   ```
   You should see something like `v18.0.0` or higher.

2. Check if npm is installed:
```bash
   npm --version
   ```
   You should see something like `9.0.0` or higher.

3. **If Node.js is NOT installed:**
   - Visit [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Run the installer and follow the instructions
   - Restart your terminal after installation
   - Verify installation again with the commands above

**What this does:** Node.js allows you to run JavaScript on your computer, and npm is the package manager that installs project dependencies.

---

### Step 3: Set Up MongoDB Atlas

MongoDB Atlas is a cloud database service. We'll create a free account and set up a database cluster.

1. **Create a MongoDB Atlas Account:**
   - Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   - Click "Try Free" and sign up with your email
   - Complete the registration process

2. **Create a New Cluster:**
   - After logging in, click "Build a Database"
   - Select the **FREE** tier (M0 Sandbox)
   - Choose a cloud provider and region (choose one closest to you)
   - Click "Create Cluster" (this takes 3-5 minutes)

3. **Create a Database User:**
   - While the cluster is building, click "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter a username (e.g., `skillshub_user`)
   - Enter a password (save this securely!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access:**
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) OR add your current IP address
   - Click "Confirm"

5. **Get Your Connection String:**
   - Click "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
   - **IMPORTANT:** Replace `<password>` with the password you created in step 3
   - Replace `<dbname>` with `skillshub_rwanda` (or any database name you prefer)
   - Save this connection string - you'll need it in Step 5

**Example connection string:**
```
mongodb+srv://skillshub_user:MyPassword123@cluster0.xxxxx.mongodb.net/skillshub_rwanda?retryWrites=true&w=majority
```

**What this does:** Sets up a cloud database to store all application data (users, courses, enrollments, etc.).

---

### Step 4: Set Up Cloudinary

Cloudinary is a cloud service for storing and managing images and videos.

1. **Create a Cloudinary Account:**
   - Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
   - Sign up with your email (free account is sufficient)

2. **Get Your Cloudinary Credentials:**
   - After logging in, you'll see your **Dashboard**
   - Note down the following values (you'll see them on the dashboard):
     - **Cloud Name** (e.g., `dhxj5w0yg`)
     - **API Key** (e.g., `462383939955586`)
     - **API Secret** (click "Reveal" to see it, e.g., `sg-0j0Jpm_hjkUjCiM1ISwO6--0`)

3. **Create an Upload Preset (Optional but Recommended):**
   - Go to "Settings" → "Upload"
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Name it `skillshub_uploads` (or any name you prefer)
   - Set "Signing mode" to "Unsigned" (for easier development)
   - Set "Folder" to `skillshub` (optional, but recommended for organization)
   - Click "Save"

**What this does:** Sets up cloud storage for course thumbnails and module videos.

---

### Step 5: Configure Backend Environment

1. **Navigate to the backend folder:**
```bash
   cd backend
   ```

2. **Create the `.env` file:**
   - Create a new file named `.env` in the `backend` folder
   - **On Windows:** Right-click in the folder → New → Text Document → Rename to `.env`
   - **On Mac/Linux:** Run `touch .env` in the terminal
   - Open the `.env` file with your code editor

3. **Add the following environment variables to `.env`:**

```env
   # Server Configuration
PORT=4000
   NODE_ENV=development

   # MongoDB Connection String (from Step 3)
   # Replace with YOUR connection string from MongoDB Atlas
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/skillshub_rwanda?retryWrites=true&w=majority

   # JWT Secret (generate a random string, at least 32 characters)
   # You can use: openssl rand -base64 32 (or any random string generator)
   JWT_SECRET=your-super-secure-random-secret-key-change-this-to-something-random
JWT_EXPIRE=24h

   # Cloudinary Configuration (from Step 4)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_UPLOAD_PRESET=skillshub_uploads
   CLOUDINARY_FOLDER=skillshub
   ENABLE_CLOUDINARY=true

   # CORS Configuration (for frontend connection)
   CORS_ORIGIN=http://localhost:5173
   ```

   **IMPORTANT:** Replace the placeholder values:
   - `MONGO_URI`: Paste your MongoDB connection string from Step 3
   - `JWT_SECRET`: Generate a random string (at least 32 characters). You can use [this generator](https://randomkeygen.com/) or run `openssl rand -base64 32`
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name from Step 4
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key from Step 4
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret from Step 4
   - `CLOUDINARY_UPLOAD_PRESET`: The preset name you created (or `skillshub_uploads`)

4. **Save the `.env` file**

**What this does:** Configures the backend server with your database credentials, API keys, and settings.

---

### Step 6: Install Backend Dependencies

1. **Make sure you're in the backend folder:**
```bash
   cd backend
   ```
   (If you're not sure, run `pwd` on Mac/Linux or `cd` on Windows to see your current directory)

2. **Install all required packages:**
   ```bash
   npm install
   ```

   This will take 1-2 minutes. You'll see progress bars as packages are downloaded.

3. **Verify installation:**
   - You should see `node_modules` folder created in the `backend` directory
   - No error messages should appear

**What this does:** Downloads and installs all the JavaScript libraries the backend needs to run (Express, Mongoose, JWT, etc.).

---

### Step 7: Install Frontend Dependencies

1. **Navigate to the frontend folder:**
```bash
   cd ../frontend
```

2. **Install all required packages:**
```bash
npm install
```

   This will take 2-3 minutes. You'll see progress bars as packages are downloaded.

3. **Verify installation:**
   - You should see `node_modules` folder created in the `frontend` directory
   - No error messages should appear

4. **Optional: Create frontend `.env` file:**
   - Create a new file named `.env` in the `frontend` folder
   - Add this line (if your backend runs on a different port, change it):
     ```env
     VITE_API_URL=http://localhost:4000/api
     ```
   - This is optional - the frontend defaults to `http://localhost:4000/api` if not specified

**What this does:** Downloads and installs all the JavaScript libraries the frontend needs (React, Vite, Tailwind CSS, etc.).

---

### Step 8: Seed the Database

This step populates the database with sample data (admin account, instructors, courses, etc.).

1. **Make sure you're in the backend folder:**
```bash
   cd ../backend
```

2. **Run the seed script:**
```bash
   npm run seed
   ```

3. **Wait for the seeding to complete:**
   - You should see messages like "✅ Connected to MongoDB"
   - "✅ Created admin user"
   - "✅ Created instructor: ..."
   - "✅ Created courses"
   - "✅ Database seeded successfully"

4. **If you see errors:**
   - Check that your `MONGO_URI` in `.env` is correct
   - Make sure MongoDB Atlas network access allows your IP
   - Verify your database user credentials

**What this does:** Creates initial data in your database:
- **Admin account:** `admin@skillshub.rw` / `Admin123!`
- **3 Instructor accounts** (see credentials below)
- **1 Student account:** `emmanuel@student.skillshub.rw` / `Student123!`
- **10 Sample courses** with modules, exercises, activities, and quizzes

---

### Step 9: Start the Backend Server

1. **Make sure you're in the backend folder:**
```bash
   cd backend
```

2. **Start the development server:**
```bash
   npm run dev
   ```

3. **You should see:**
   ```
   Server listening on port 4000
   ✅ Connected to MongoDB
   ```

4. **Keep this terminal window open** - the server needs to keep running

5. **If you see errors:**
   - Make sure port 4000 is not already in use
   - Check that your `.env` file has all required variables
   - Verify MongoDB connection string is correct

**What this does:** Starts the backend API server that handles all database operations, authentication, and API requests.

---

### Step 10: Start the Frontend Development Server

**Open a NEW terminal window** (keep the backend terminal running).

1. **Navigate to the frontend folder:**
```bash
   cd path/to/SkillsHub-Rwanda/frontend
   ```
   (Replace `path/to/SkillsHub-Rwanda` with your actual project path)

2. **Start the frontend development server:**
```bash
   npm run dev
   ```

3. **You should see:**
   ```
   VITE v6.0.5  ready in 500 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

4. **The application will automatically open in your browser** at `http://localhost:5173`

5. **If it doesn't open automatically:**
   - Copy the URL from the terminal (usually `http://localhost:5173`)
   - Paste it into your web browser's address bar

**What this does:** Starts the React frontend development server that serves the user interface.

---

### Step 11: Verify Installation

1. **You should see the SkillsHub Rwanda landing page** in your browser

2. **Test login with seeded accounts:**
   - Click "Sign in" or navigate to `/login`
   - Try logging in with:
     - **Admin:** `admin@skillshub.rw` / `Admin123!`
     - **Student:** `emmanuel@student.skillshub.rw` / `Student123!`
     - **Instructor:** `aline.uwase@skillshub.rw` / `Teach123!`

3. **Verify backend is working:**
   - Open `http://localhost:4000/api/health` in your browser
   - You should see a JSON response with server status

4. **Check browser console:**
   - Press `F12` or right-click → Inspect → Console tab
   - There should be no critical errors (warnings are okay)

**What this means:** If everything works, your setup is complete! 🎉

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

## School Assignment Credentials

After running the seed script (Step 8), you can use these preloaded accounts:

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
│   ├── .env               # Environment variables (create this)
│   └── server.js          # Express server entry point
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers (App, Theme, Settings)
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Page components (Landing, Dashboard, Courses, etc.)
│   │   └── utils/         # Utility functions
│   └── .env               # Frontend environment variables (optional)
└── README.md
```

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

## Troubleshooting

### Backend won't start

**Error: "Port 4000 is already in use"**
- Solution: Kill the process using port 4000:
  - **Windows:** `netstat -ano | findstr :4000` then `taskkill /PID <PID> /F`
  - **Mac/Linux:** `lsof -ti:4000 | xargs kill -9`
- Or change `PORT=4000` to another port (e.g., `PORT=4001`) in `.env`

**Error: "Cannot find module..."**
- Solution: Run `npm install` again in the `backend` folder

**Error: "MongoServerError: Authentication failed"**
- Solution: Check your MongoDB connection string:
  - Make sure the username and password are correct
  - Ensure special characters in password are URL-encoded
  - Verify database user has correct permissions

**Error: "MongooseError: Operation timed out"**
- Solution: 
  - Check your internet connection
  - Verify MongoDB Atlas network access allows your IP
  - Check that your connection string is correct

### Frontend won't start

**Error: "Port 5173 is already in use"**
- Solution: The terminal will suggest using another port. Press `y` to accept, or manually kill the process

**Error: "Cannot find module..."**
- Solution: Run `npm install` again in the `frontend` folder

**Error: "Failed to fetch" or API errors**
- Solution: 
  - Make sure the backend is running on port 4000
  - Check that `VITE_API_URL` in `frontend/.env` matches your backend URL
  - Verify CORS is configured correctly in backend

### Database/Seeding Issues

**Error: "Database already exists" or duplicate key errors**
- Solution: The seed script is idempotent - it's safe to run multiple times. If you want to start fresh:
  - Delete your database in MongoDB Atlas
  - Create a new one
  - Run `npm run seed` again

**Error: "Cannot seed database"**
- Solution:
  - Verify your `MONGO_URI` is correct
  - Check that your MongoDB user has write permissions
  - Ensure network access is configured

### Login Issues

**Error: "Invalid credentials"**
- Solution: Make sure you ran `npm run seed` (Step 8) to create the default accounts
- Verify you're using the correct email and password from the [School Assignment Credentials](#school-assignment-credentials) section

**Error: "Token expired" or "Unauthorized"**
- Solution: Log out and log back in to get a new token

### Cloudinary Issues

**Error: "Invalid API credentials"**
- Solution:
  - Verify your Cloudinary credentials in `backend/.env`
  - Make sure there are no extra spaces in the values
  - Check that your Cloudinary account is active

**Error: "Upload failed"**
- Solution:
  - Verify `ENABLE_CLOUDINARY=true` in `.env`
  - Check that your upload preset exists in Cloudinary
  - Ensure file size is within limits (usually 100MB)

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

## Tech Stack

- **Frontend** – React 18, Vite, Tailwind CSS, React Router, React Toastify, jsPDF  
- **Backend** – Node.js, Express, Mongoose, JSON Web Tokens  
- **Database** – MongoDB Atlas  
- **File Storage** – Cloudinary (for video and image uploads)  
- **Authentication** – JWT with role-based access control (RBAC)

---

Made with purpose in Rwanda 🇷🇼  
Let's grow skills, careers, and communities together.
