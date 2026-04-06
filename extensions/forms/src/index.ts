/**
 * @file index.ts
 * @description Volqan Forms Extension — official first-party form builder.
 *
 * Adds drag-and-drop form creation, submission handling, honeypot spam
 * protection, email notifications, and a submissions dashboard to Volqan.
 */

import type {
  VolqanExtension,
  ExtensionContext,
  ExtensionResponse,
  RouteDefinition,
  Widget,
} from '@volqan/core';
import { FieldType } from '@volqan/core';
import type { ContentTypeDefinition } from '@volqan/core';
import { validateSubmission, deserializeForm } from './form-builder.js';

// ---------------------------------------------------------------------------
// Content type definitions
// ---------------------------------------------------------------------------

const formsContentType: ContentTypeDefinition = {
  name: 'Form',
  slug: 'forms',
  description: 'Form definitions managed by the Forms extension.',
  fields: [
    {
      name: 'name',
      type: FieldType.TEXT,
      label: 'Form Name',
      required: true,
      sortable: true,
      filterable: true,
    },
    {
      name: 'fields',
      type: FieldType.JSON,
      label: 'Fields (JSON)',
      required: true,
      hidden: false,
    },
    {
      name: 'settings',
      type: FieldType.JSON,
      label: 'Settings (JSON)',
      required: true,
      hidden: false,
    },
    {
      name: 'submissionsCount',
      type: FieldType.NUMBER,
      label: 'Submissions Count',
      required: false,
      default: 0,
      sortable: true,
    },
  ],
  settings: {
    timestamps: true,
    softDelete: false,
    draftable: false,
    api: false, // Forms are managed through extension API only.
  },
};

const formSubmissionsContentType: ContentTypeDefinition = {
  name: 'Form Submission',
  slug: 'form_submissions',
  description: 'Submission records for all forms.',
  fields: [
    {
      name: 'formId',
      type: FieldType.RELATION,
      label: 'Form',
      required: true,
      relationTo: 'forms',
      filterable: true,
      sortable: false,
    },
    {
      name: 'data',
      type: FieldType.JSON,
      label: 'Submission Data',
      required: true,
      hidden: false,
    },
    {
      name: 'ipAddress',
      type: FieldType.TEXT,
      label: 'IP Address',
      required: false,
      hidden: true, // Hidden from public API responses.
    },
    {
      name: 'userAgent',
      type: FieldType.TEXT,
      label: 'User Agent',
      required: false,
      hidden: true,
    },
    {
      name: 'status',
      type: FieldType.SELECT,
      label: 'Status',
      required: false,
      default: 'new',
      filterable: true,
      sortable: true,
      options: [
        { value: 'new', label: 'New' },
        { value: 'read', label: 'Read' },
        { value: 'spam', label: 'Spam' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      name: 'createdAt',
      type: FieldType.DATETIME,
      label: 'Submitted At',
      required: false,
      sortable: true,
      filterable: true,
    },
  ],
  settings: {
    timestamps: true,
    softDelete: false,
    draftable: false,
    api: false, // Submissions are managed through extension API only.
  },
};

// ---------------------------------------------------------------------------
// Rate-limit state (per-IP in-memory store for the runtime)
// In production this would use Redis or a database-backed store.
// ---------------------------------------------------------------------------

const ipSubmissionTimestamps = new Map<string, number[]>();

function checkRateLimit(
  ip: string,
  maxSubmissions: number,
  windowSeconds: number,
): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const times = (ipSubmissionTimestamps.get(ip) ?? []).filter(
    (t) => now - t < windowMs,
  );

  if (times.length >= maxSubmissions) {
    return false; // Rate limited.
  }

  times.push(now);
  ipSubmissionTimestamps.set(ip, times);
  return true; // Allowed.
}

// ---------------------------------------------------------------------------
// Admin widgets
// ---------------------------------------------------------------------------

const adminWidgets: Widget[] = [
  {
    id: 'volqan-forms-recent-submissions',
    name: 'Recent Form Submissions',
    defaultColSpan: 6,
    defaultRowSpan: 3,
    component: '@volqan/extension-forms/widgets/RecentSubmissions',
  },
];

// ---------------------------------------------------------------------------
// API route builder
// ---------------------------------------------------------------------------

function buildApiRoutes(ctx: ExtensionContext): RouteDefinition[] {
  return [
    // GET /api/forms/:formId/submissions — list submissions for a form (admin)
    {
      method: 'GET',
      path: '/api/forms/:formId/submissions',
      public: false,
      async handler(req) {
        try {
          const { formId } = req.params;
          const page = Number(req.query['page'] ?? '1');
          const perPage = Math.min(Number(req.query['perPage'] ?? '20'), 100);
          const status = req.query['status'] as string | undefined;

          ctx.logger.debug('Forms: listing submissions', { formId, page, perPage, status });

          // In production: query form_submissions content type.
          return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
              data: [],
              meta: { total: 0, page, perPage, totalPages: 0 },
            },
          };
        } catch (err) {
          ctx.logger.error('Forms: failed to list submissions', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // GET /api/forms/:formId/submissions/:submissionId — single submission (admin)
    {
      method: 'GET',
      path: '/api/forms/:formId/submissions/:submissionId',
      public: false,
      async handler(req) {
        try {
          const { formId, submissionId } = req.params;
          ctx.logger.debug('Forms: fetching submission', { formId, submissionId });
          return { status: 404, body: { error: 'Submission not found' } };
        } catch (err) {
          ctx.logger.error('Forms: failed to fetch submission', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // POST /api/forms/:formId/submit — public submission endpoint
    {
      method: 'POST',
      path: '/api/forms/:formId/submit',
      public: true,
      rateLimit: { maxRequests: 10, windowSeconds: 60 },
      async handler(req): Promise<ExtensionResponse> {
        try {
          const { formId } = req.params;
          const body = req.body as Record<string, unknown>;
          const ip = String(req.headers['x-forwarded-for'] ?? req.headers['x-real-ip'] ?? 'unknown');
          const userAgent = String(req.headers['user-agent'] ?? '');

          ctx.logger.debug('Forms: receiving submission', { formId, ip });

          // In production: load the form definition from the content service.
          // For now, return a 404 if no form is found.
          // The real implementation would:
          // 1. Fetch the form record by formId
          // 2. Deserialise the fields and settings
          // 3. Run validateSubmission
          // 4. Store the submission
          // 5. Send email notifications if configured

          // Minimal demo path — log and acknowledge.
          if (!body || Object.keys(body).length === 0) {
            return {
              status: 400,
              body: { error: 'No submission data provided' },
            };
          }

          // Stub: check rate limit using form defaults.
          const allowed = checkRateLimit(ip, 5, 3600);
          if (!allowed) {
            return {
              status: 429,
              headers: { 'Retry-After': '3600' },
              body: { error: 'Too many submissions. Please try again later.' },
            };
          }

          ctx.logger.info('Forms: submission accepted', { formId, ip });
          ctx.events.emit('forms:submission', { formId, data: body, ip, userAgent });

          return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
              success: true,
              message: 'Your submission has been received.',
            },
          };
        } catch (err) {
          ctx.logger.error('Forms: submission handler error', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // GET /api/forms — list all forms (admin)
    {
      method: 'GET',
      path: '/api/forms',
      public: false,
      async handler(req) {
        try {
          const page = Number(req.query['page'] ?? '1');
          const perPage = Math.min(Number(req.query['perPage'] ?? '20'), 100);
          ctx.logger.debug('Forms: listing forms', { page, perPage });
          return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { data: [], meta: { total: 0, page, perPage, totalPages: 0 } },
          };
        } catch (err) {
          ctx.logger.error('Forms: failed to list forms', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // POST /api/forms — create a new form (admin)
    {
      method: 'POST',
      path: '/api/forms',
      public: false,
      async handler(req) {
        try {
          const data = req.body as Record<string, unknown>;
          if (!data['name']) {
            return { status: 400, body: { error: 'Form name is required' } };
          }
          ctx.logger.info('Forms: creating form', { name: data['name'] });
          return {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
            body: { data, message: 'Form created' },
          };
        } catch (err) {
          ctx.logger.error('Forms: failed to create form', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // PUT /api/forms/:formId — update a form (admin)
    {
      method: 'PUT',
      path: '/api/forms/:formId',
      public: false,
      async handler(req) {
        try {
          const { formId } = req.params;
          const data = req.body as Record<string, unknown>;
          ctx.logger.info('Forms: updating form', { formId });
          return {
            status: 200,
            body: { data, message: 'Form updated' },
          };
        } catch (err) {
          ctx.logger.error('Forms: failed to update form', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // DELETE /api/forms/:formId — delete a form (admin)
    {
      method: 'DELETE',
      path: '/api/forms/:formId',
      public: false,
      async handler(req) {
        try {
          const { formId } = req.params;
          ctx.logger.warn('Forms: deleting form', { formId });
          return { status: 200, body: { message: 'Form deleted' } };
        } catch (err) {
          ctx.logger.error('Forms: failed to delete form', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Extension object
// ---------------------------------------------------------------------------

let _registeredRoutes: RouteDefinition[] = [];

const formsExtension: VolqanExtension = {
  id: 'volqan/forms',
  version: '0.1.0',
  name: 'Forms',
  description:
    'Official Volqan Forms extension. Drag-and-drop form builder with submission management, honeypot spam protection, email notifications, and a public API.',
  author: {
    name: 'Volqan',
    url: 'https://volqan.link',
  },

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  async onInstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Forms: installing — creating content types');

    ctx.events.emit('content:registerType', formsContentType);
    ctx.events.emit('content:registerType', formSubmissionsContentType);

    await ctx.config.set('forms.emailNotificationsEnabled', false);
    await ctx.config.set('forms.defaultSuccessMessage', 'Thank you! Your submission has been received.');

    ctx.logger.info('Forms: installation complete');
  },

  async onUninstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.warn('Forms: uninstalling — removing content types');
    ctx.events.emit('content:unregisterType', { slug: 'forms' });
    ctx.events.emit('content:unregisterType', { slug: 'form_submissions' });
  },

  async onEnable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Forms: enabling — registering API routes');
    _registeredRoutes = buildApiRoutes(ctx);
    ctx.events.emit('api:registerRoutes', _registeredRoutes);
  },

  async onDisable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Forms: disabling — removing API routes');
    ctx.events.emit('api:unregisterRoutes', _registeredRoutes);
    _registeredRoutes = [];
  },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Forms: booting');
    _registeredRoutes = buildApiRoutes(ctx);
    ctx.events.emit('api:registerRoutes', _registeredRoutes);

    // Listen for submission events to trigger email notifications.
    ctx.events.on('forms:submission', async (payload) => {
      const { formId, data } = payload as { formId: string; data: Record<string, unknown> };
      const emailEnabled = ctx.config.get<boolean>('forms.emailNotificationsEnabled') ?? false;
      if (emailEnabled) {
        ctx.logger.info('Forms: sending email notification', { formId });
        // In production: send email via the Volqan mailer service.
        ctx.events.emit('mail:send', {
          to: ctx.config.get<string>('forms.notificationEmail'),
          subject: `New form submission for form #${formId}`,
          body: JSON.stringify(data, null, 2),
        });
      }
    });
  },

  // -------------------------------------------------------------------------
  // Admin UI
  // -------------------------------------------------------------------------

  adminMenuItems: [
    {
      key: 'forms',
      label: 'Forms',
      icon: 'document-check',
      href: '/admin/forms',
      requiredRole: 'editor',
      children: [
        {
          key: 'forms-all',
          label: 'All Forms',
          icon: 'list-bullet',
          href: '/admin/forms',
          requiredRole: 'editor',
        },
        {
          key: 'forms-submissions',
          label: 'Submissions',
          icon: 'inbox',
          href: '/admin/forms/submissions',
          requiredRole: 'editor',
        },
        {
          key: 'forms-new',
          label: 'New Form',
          icon: 'plus-circle',
          href: '/admin/forms/new',
          requiredRole: 'editor',
        },
      ],
    },
  ],

  adminPages: [
    {
      path: 'forms',
      title: 'All Forms',
      component: '@volqan/extension-forms/components/FormsList',
      layout: 'default',
    },
    {
      path: 'forms/new',
      title: 'New Form',
      component: '@volqan/extension-forms/components/FormBuilder',
      layout: 'default',
    },
    {
      path: 'forms/:formId/edit',
      title: 'Edit Form',
      component: '@volqan/extension-forms/components/FormBuilder',
      layout: 'default',
    },
    {
      path: 'forms/submissions',
      title: 'All Submissions',
      component: '@volqan/extension-forms/components/SubmissionsList',
      layout: 'default',
    },
    {
      path: 'forms/:formId/submissions',
      title: 'Form Submissions',
      component: '@volqan/extension-forms/components/SubmissionsList',
      layout: 'default',
    },
    {
      path: 'forms/:formId/submissions/:submissionId',
      title: 'Submission Detail',
      component: '@volqan/extension-forms/components/SubmissionDetail',
      layout: 'default',
    },
  ],

  adminWidgets,

  // -------------------------------------------------------------------------
  // Routes (populated at boot)
  // -------------------------------------------------------------------------

  apiRoutes: [],

  // -------------------------------------------------------------------------
  // Marketplace metadata
  // -------------------------------------------------------------------------

  marketplace: {
    category: 'forms',
    tags: ['forms', 'contact', 'submissions', 'builder', 'honeypot', 'spam-protection'],
    screenshotUrls: [],
    demoUrl: 'https://demo.volqan.link/admin/forms',
  },
};

export default formsExtension;

// Named re-exports
export {
  validateSubmission,
  createEmptyForm,
  createEmptyField,
  serializeForm,
  deserializeForm,
} from './form-builder.js';
export type {
  FormDefinition,
  FormField,
  FormFieldType,
  FormFieldOption,
  FormFieldValidation,
  FormSettings,
  EmailNotificationSettings,
  ValidationResult,
  FieldError,
} from './form-builder.js';
export { FormBuilder } from './components/FormBuilder.js';
export type { FormBuilderProps } from './components/FormBuilder.js';
export { FormRenderer } from './components/FormRenderer.js';
export type { FormRendererProps } from './components/FormRenderer.js';
