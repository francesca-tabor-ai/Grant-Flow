import 'dotenv/config';
import express, { type RequestHandler } from 'express';
import cors from 'cors';
import { ensureSchema } from './db/index.js';
import { HttpError } from '../shared/_core/errors.js';
import authRoutes from './routes/auth.js';
import organizationRoutes from './routes/organizations.js';
import grantsRoutes from './routes/grants.js';
import applicationsRoutes from './routes/applications.js';
import proposalsRoutes from './routes/proposals.js';
import budgetsRoutes from './routes/budgets.js';
import exportRoutes from './routes/export.js';
import alertsRoutes from './routes/alerts.js';
import orchestrationRoutes from './routes/orchestration.js';

ensureSchema();

const app = express();
app.use(cors({ origin: true, credentials: true }));
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

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

/** Handle HttpError from shared; send status + JSON body. Must be after routes. */
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  next(err);
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
