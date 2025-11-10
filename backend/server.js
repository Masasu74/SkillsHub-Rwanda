import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoute.js';
import courseRouter from './routes/courseRoute.js';
import enrollmentRouter from './routes/enrollmentRoute.js';
import progressRouter from './routes/progressRoute.js';
import systemSettingsRouter from './routes/systemSettingsRoute.js';
import healthRouter from './routes/healthRoute.js';

const app = express();   
const port = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/progress', progressRouter);
app.use('/api/system-settings', systemSettingsRouter);
app.use('/api', healthRouter);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SkillsHub Rwanda API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
