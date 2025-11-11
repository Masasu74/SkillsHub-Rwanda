import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
    
    res.json({
    status: dbReady ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
    database: dbReady ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime())
    });
});

export default router;
