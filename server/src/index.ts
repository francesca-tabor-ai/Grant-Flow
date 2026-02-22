import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env and .env.local from server dir (when run as node dist/index.js) or cwd
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import express, { type RequestHandler } from 'express';
import cors from 'cors';
import { ensureSchema, db } from './db/index.js';
import { HttpError } from './shared/_core/errors.js';
import authRoutes from './routes/auth.js';
import organizationRoutes from './routes/organizations.js';
import grantsRoutes from './routes/grants.js';
import applicationsRoutes from './routes/applications.js';
import proposalsRoutes from './routes/proposals.js';
import budgetsRoutes from './routes/budgets.js';
import exportRoutes from './routes/export.js';
import alertsRoutes from './routes/alerts.js';
import orchestrationRoutes from './routes/orchestration.js';

const app = express();
// In production, set CORS_ORIGIN to a comma-separated list of allowed origins, or leave unset to allow same-origin only
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

/** Wrap async route handlers so thrown errors are passed to error middleware */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/grants', grantsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api', proposalsRoutes);
app.use('/api', budgetsRoutes);
app.use('/api', exportRoutes);
app.use('/api', alertsRoutes);
app.use('/api', orchestrationRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await db.get('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (e) {
    console.error('Health check DB error:', e);
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

/** Handle HttpError from shared; send status + JSON body. Must be after routes. */
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  next(err);
});

/** Final error handler: log and return 500. Never leak stack in production. */
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: isProd ? 'Internal server error' : (err instanceof Error ? err.message : 'Unknown error'),
  });
});

const port = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

async function start() {
  if (isProd && !process.env.JWT_SECRET) {
    console.error('Fatal: JWT_SECRET must be set in production.');
    process.exit(1);
  }
  await ensureSchema();
  app.listen(port, () =>
    console.log(`Server listening on http://localhost:${port} (NODE_ENV=${process.env.NODE_ENV ?? 'development'})`)
  );
}
start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
