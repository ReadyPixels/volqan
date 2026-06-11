import { db } from '@volqan/core';

interface AuditParams {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/** Write an audit log entry. Non-throwing — logs errors to console. */
export async function audit(params: AuditParams): Promise<void> {
  await db.auditLog.create({ data: params }).catch((err) => {
    console.error('[audit] failed to write log entry:', err);
  });
}
