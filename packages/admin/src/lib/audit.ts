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
  const data = {
    userId: params.userId ?? null,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId ?? null,
    details: (params.details ?? undefined) as import('@prisma/client').Prisma.InputJsonValue | undefined,
    ipAddress: params.ipAddress ?? null,
  };
  await db.auditLog.create({ data }).catch((err) => {
    console.error('[audit] failed to write log entry:', err);
  });
}
