import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';
import { audit } from '@/lib/audit';
import { fireWebhooks } from '@/lib/webhook';
import { cacheFlush } from '@/lib/cache';

/**
 * Content workflow transitions:
 *   DRAFT → submit_for_review → DRAFT (status unchanged, adds review flag)
 *   DRAFT → publish            → PUBLISHED   (ADMIN/SUPER_ADMIN only)
 *   PUBLISHED → unpublish      → DRAFT
 *   PUBLISHED → archive        → ARCHIVED
 *   ARCHIVED → restore         → DRAFT
 *
 * Workflow state is tracked via the `data._workflow` JSON field on the entry.
 */

type Transition = 'submit_for_review' | 'approve' | 'reject' | 'publish' | 'unpublish' | 'archive' | 'restore';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { type, id } = await params;

  let body: { transition: Transition; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const { transition, note } = body;
  const validTransitions: Transition[] = ['submit_for_review', 'approve', 'reject', 'publish', 'unpublish', 'archive', 'restore'];
  if (!validTransitions.includes(transition)) {
    return badRequest(`Invalid transition. Must be one of: ${validTransitions.join(', ')}`);
  }

  const adminOnly: Transition[] = ['approve', 'reject', 'publish', 'archive'];
  if (adminOnly.includes(transition) && !ADMIN_ROLES.has(user.role)) {
    return json({ error: 'Only admins can perform this transition.' }, 403);
  }

  try {
    const entry = await db.contentEntry.findUnique({ where: { id } });
    if (!entry) return notFound('Entry not found.');

    if (user.role === 'EDITOR' && (entry as any).authorId !== user.id) {
      return json({ error: 'Forbidden' }, 403);
    }

    const currentData = (entry.data as Record<string, unknown>) ?? {};
    const workflow: Record<string, unknown> = (currentData._workflow as Record<string, unknown>) ?? {};

    let newStatus = entry.status;
    let newWorkflow = { ...workflow };
    const historyEntry = { transition, by: user.id, at: new Date().toISOString(), note: note ?? null };

    switch (transition) {
      case 'submit_for_review':
        newWorkflow.pendingReview = true;
        newWorkflow.submittedAt = new Date().toISOString();
        newWorkflow.submittedBy = user.id;
        break;
      case 'approve':
        newWorkflow.pendingReview = false;
        newWorkflow.approvedAt = new Date().toISOString();
        newWorkflow.approvedBy = user.id;
        break;
      case 'reject':
        newWorkflow.pendingReview = false;
        newWorkflow.rejectedAt = new Date().toISOString();
        newWorkflow.rejectedBy = user.id;
        newWorkflow.rejectionNote = note ?? null;
        break;
      case 'publish':
        newStatus = 'PUBLISHED';
        newWorkflow.pendingReview = false;
        break;
      case 'unpublish':
        newStatus = 'DRAFT';
        break;
      case 'archive':
        newStatus = 'ARCHIVED';
        break;
      case 'restore':
        newStatus = 'DRAFT';
        break;
    }

    const history = Array.isArray(workflow.history) ? [...workflow.history, historyEntry] : [historyEntry];
    newWorkflow.history = history;

    const updated = await db.contentEntry.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: newStatus === 'PUBLISHED' ? new Date() : entry.publishedAt,
        data: { ...currentData, _workflow: newWorkflow } as unknown as import('@prisma/client').InputJsonValue,
      },
    });

    const eventName = newStatus === 'PUBLISHED' ? 'content.published' : `content.${transition}`;
    await cacheFlush(`content:${type}:`);
    await audit({ userId: user.id, action: eventName, resource: type, resourceId: id, details: { transition, note } });
    await fireWebhooks(eventName, { id, type, transition, status: newStatus }).catch(() => {});

    return json({ data: updated });
  } catch (err) {
    console.error(`[content workflow POST]`, err);
    return internalError();
  }
}

/** GET returns the workflow state for an entry */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  try {
    const entry = await db.contentEntry.findUnique({ where: { id } });
    if (!entry) return notFound('Entry not found.');

    const currentData = (entry.data as Record<string, unknown>) ?? {};
    const workflow = (currentData._workflow as Record<string, unknown>) ?? {};

    return json({
      data: {
        id,
        status: entry.status,
        workflow: {
          pendingReview: workflow.pendingReview ?? false,
          submittedAt: workflow.submittedAt ?? null,
          approvedAt: workflow.approvedAt ?? null,
          rejectedAt: workflow.rejectedAt ?? null,
          history: workflow.history ?? [],
        },
      },
    });
  } catch (err) {
    console.error('[content workflow GET]', err);
    return internalError();
  }
}
