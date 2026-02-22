/**
 * Deadline management and alerts: list applications with upcoming deadlines
 * and flag overdue or due-soon.
 */

import { db } from '../db/index.js';

export type DeadlineAlert = {
  application_id: string;
  grant_title: string;
  deadline: string | null;
  status: string;
  days_until: number | null;
  alert: 'overdue' | 'due_soon' | 'ok';
};

const DUE_SOON_DAYS = 14;

export async function getDeadlineAlerts(userId: string): Promise<DeadlineAlert[]> {
  const rows = (await db.all(
    `SELECT a.id AS application_id, a.status, a.deadline, g.title AS grant_title
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE uo.user_id = $1 AND a.status NOT IN ('submitted')
     ORDER BY a.deadline IS NULL, a.deadline ASC`,
    [userId]
  )) as Array<{ application_id: string; status: string; deadline: string | null; grant_title: string }>;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return rows.map((r) => {
    let days_until: number | null = null;
    let alert: 'overdue' | 'due_soon' | 'ok' = 'ok';
    if (r.deadline) {
      const d = new Date(r.deadline);
      d.setHours(0, 0, 0, 0);
      days_until = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days_until < 0) alert = 'overdue';
      else if (days_until <= DUE_SOON_DAYS) alert = 'due_soon';
    }
    return {
      application_id: r.application_id,
      grant_title: r.grant_title,
      deadline: r.deadline,
      status: r.status,
      days_until,
      alert,
    };
  });
}
