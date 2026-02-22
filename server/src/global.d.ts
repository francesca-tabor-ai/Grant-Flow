/**
 * Ambient declarations for packages that may not have @types or when type
 * resolution differs by environment. Express/cors use @types/express and @types/cors.
 */
declare module 'jsonwebtoken';
declare module 'pg';
declare module 'pdfkit';
declare module 'docx';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email?: string; role: string };
    }
  }
}
export {};
