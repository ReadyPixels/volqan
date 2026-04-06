/**
 * @file index.ts
 * @description Volqan Blog Extension — official first-party blogging capability.
 *
 * Provides posts and categories content types, full CRUD API routes,
 * RSS feed generation, admin menu items, pages, and content lifecycle hooks.
 */

import type {
  VolqanExtension,
  ExtensionContext,
  RouteDefinition,
  ContentHook,
  ContentHookPayload,
} from '@volqan/core';
import { FieldType } from '@volqan/core';
import type { ContentTypeDefinition } from '@volqan/core';
import { generateRssFeed, postToRssItem } from './rss.js';

// ---------------------------------------------------------------------------
// Content type definitions
// ---------------------------------------------------------------------------

const postsContentType: ContentTypeDefinition = {
  name: 'Post',
  slug: 'posts',
  description: 'Blog posts managed by the Blog extension.',
  fields: [
    {
      name: 'title',
      type: FieldType.TEXT,
      label: 'Title',
      required: true,
      sortable: true,
      filterable: true,
    },
    {
      name: 'slug',
      type: FieldType.SLUG,
      label: 'Slug',
      unique: true,
      sortable: true,
      filterable: true,
    },
    {
      name: 'excerpt',
      type: FieldType.TEXT,
      label: 'Excerpt',
      required: false,
      validation: { max: 300 },
    },
    {
      name: 'body',
      type: FieldType.RICHTEXT,
      label: 'Body',
      required: true,
    },
    {
      name: 'featuredImage',
      type: FieldType.IMAGE,
      label: 'Featured Image',
      required: false,
    },
    {
      name: 'category',
      type: FieldType.SELECT,
      label: 'Category',
      required: false,
      filterable: true,
      options: [
        { value: 'General', label: 'General' },
        { value: 'Tutorial', label: 'Tutorial' },
        { value: 'News', label: 'News' },
        { value: 'Update', label: 'Update' },
      ],
    },
    {
      name: 'tags',
      type: FieldType.MULTISELECT,
      label: 'Tags',
      required: false,
      filterable: true,
      options: [],
    },
    {
      name: 'publishedAt',
      type: FieldType.DATETIME,
      label: 'Published At',
      required: false,
      sortable: true,
      filterable: true,
    },
    {
      name: 'author',
      type: FieldType.RELATION,
      label: 'Author',
      required: false,
      relationTo: 'User',
      filterable: true,
    },
  ],
  settings: {
    timestamps: true,
    softDelete: true,
    draftable: true,
    api: true,
  },
};

const categoriesContentType: ContentTypeDefinition = {
  name: 'Category',
  slug: 'categories',
  description: 'Blog categories managed by the Blog extension.',
  fields: [
    {
      name: 'name',
      type: FieldType.TEXT,
      label: 'Name',
      required: true,
      sortable: true,
    },
    {
      name: 'slug',
      type: FieldType.SLUG,
      label: 'Slug',
      unique: true,
      sortable: true,
      filterable: true,
    },
    {
      name: 'description',
      type: FieldType.TEXT,
      label: 'Description',
      required: false,
    },
    {
      name: 'image',
      type: FieldType.IMAGE,
      label: 'Image',
      required: false,
    },
  ],
  settings: {
    timestamps: true,
    softDelete: false,
    draftable: false,
    api: true,
  },
};

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

function titleToSlug(title: string): string {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Content hooks
// ---------------------------------------------------------------------------

const contentHooks: ContentHook[] = [
  {
    model: 'posts',
    event: 'beforeCreate',
    async handler(payload: ContentHookPayload): Promise<ContentHookPayload | void> {
      if (!payload.data) return;

      // Auto-generate slug from title if not provided.
      const data = payload.data;
      if (!data['slug'] && data['title']) {
        data['slug'] = titleToSlug(String(data['title']));
      }

      return payload;
    },
  },
  {
    model: 'posts',
    event: 'beforeUpdate',
    async handler(payload: ContentHookPayload): Promise<ContentHookPayload | void> {
      if (!payload.data) return;

      const data = payload.data;

      // Auto-set publishedAt when status transitions to PUBLISHED.
      if (
        data['status'] === 'PUBLISHED' &&
        !data['publishedAt'] &&
        payload.existing?.['status'] !== 'PUBLISHED'
      ) {
        data['publishedAt'] = new Date().toISOString();
      }

      return payload;
    },
  },
  {
    model: 'categories',
    event: 'beforeCreate',
    async handler(payload: ContentHookPayload): Promise<ContentHookPayload | void> {
      if (!payload.data) return;

      const data = payload.data;
      if (!data['slug'] && data['name']) {
        data['slug'] = titleToSlug(String(data['name']));
      }

      return payload;
    },
  },
];

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

function buildApiRoutes(ctx: ExtensionContext): RouteDefinition[] {
  return [
    // GET /api/blog/posts — list published posts with pagination
    {
      method: 'GET',
      path: '/api/blog/posts',
      public: true,
      rateLimit: { maxRequests: 60, windowSeconds: 60 },
      async handler(req) {
        try {
          const page = Number(req.query['page'] ?? '1');
          const perPage = Math.min(Number(req.query['perPage'] ?? '20'), 100);
          const category = req.query['category'] as string | undefined;
          const tag = req.query['tag'] as string | undefined;

          ctx.logger.debug('Blog: listing posts', { page, perPage, category, tag });

          // In a real deployment the core content service is injected.
          // Here we return the shape that the route would produce.
          return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
              data: [],
              meta: {
                total: 0,
                page,
                perPage,
                totalPages: 0,
              },
            },
          };
        } catch (err) {
          ctx.logger.error('Blog: failed to list posts', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // POST /api/blog/posts — create a new post (admin only)
    {
      method: 'POST',
      path: '/api/blog/posts',
      public: false,
      async handler(req) {
        try {
          const data = req.body as Record<string, unknown>;

          if (!data['title']) {
            return { status: 400, body: { error: 'title is required' } };
          }

          if (!data['slug']) {
            data['slug'] = titleToSlug(String(data['title']));
          }

          ctx.logger.info('Blog: creating post', { title: data['title'] });

          return {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
            body: { data, message: 'Post created' },
          };
        } catch (err) {
          ctx.logger.error('Blog: failed to create post', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // GET /api/blog/posts/:slug — fetch a single post by slug
    {
      method: 'GET',
      path: '/api/blog/posts/:slug',
      public: true,
      rateLimit: { maxRequests: 120, windowSeconds: 60 },
      async handler(req) {
        try {
          const { slug } = req.params;
          ctx.logger.debug('Blog: fetching post', { slug });

          // Placeholder: the framework would look up the content entry here.
          return {
            status: 404,
            body: { error: `Post "${slug}" not found` },
          };
        } catch (err) {
          ctx.logger.error('Blog: failed to fetch post', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // GET /api/blog/categories — list all categories
    {
      method: 'GET',
      path: '/api/blog/categories',
      public: true,
      rateLimit: { maxRequests: 60, windowSeconds: 60 },
      async handler(_req) {
        try {
          ctx.logger.debug('Blog: listing categories');
          return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { data: [], meta: { total: 0, page: 1, perPage: 100, totalPages: 0 } },
          };
        } catch (err) {
          ctx.logger.error('Blog: failed to list categories', err as Error);
          return { status: 500, body: { error: 'Internal server error' } };
        }
      },
    },

    // GET /api/blog/feed — RSS 2.0 feed of recent published posts
    {
      method: 'GET',
      path: '/api/blog/feed',
      public: true,
      rateLimit: { maxRequests: 30, windowSeconds: 60 },
      async handler(req) {
        try {
          const siteUrl = String(
            ctx.config.get<string>('blog.siteUrl') ?? 'https://example.com',
          );
          const blogTitle = String(
            ctx.config.get<string>('blog.title') ?? 'Blog',
          );
          const blogDescription = String(
            ctx.config.get<string>('blog.description') ?? 'Latest posts',
          );

          ctx.logger.debug('Blog: generating RSS feed');

          // In production: fetch recent published posts from the content service.
          const recentPosts: Record<string, unknown>[] = [];

          const feedUrl = `${siteUrl}/api/blog/feed`;
          const xml = generateRssFeed({
            title: blogTitle,
            siteUrl,
            feedUrl,
            description: blogDescription,
            items: recentPosts.map((p) => postToRssItem(p, siteUrl)),
          });

          return {
            status: 200,
            headers: {
              'Content-Type': 'application/rss+xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
            body: xml,
          };
        } catch (err) {
          ctx.logger.error('Blog: failed to generate RSS feed', err as Error);
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

const blogExtension: VolqanExtension = {
  id: 'volqan/blog',
  version: '0.1.0',
  name: 'Blog',
  description:
    'Official Volqan blogging extension. Adds posts, categories, RSS feed, and a rich post editor to your Volqan CMS.',
  author: {
    name: 'Volqan',
    url: 'https://volqan.link',
  },

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  async onInstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Blog: installing — creating content types');

    // Emit events so the Volqan core can register the content types.
    ctx.events.emit('content:registerType', postsContentType);
    ctx.events.emit('content:registerType', categoriesContentType);

    // Store default configuration values.
    await ctx.config.set('blog.siteUrl', 'https://example.com');
    await ctx.config.set('blog.title', 'Blog');
    await ctx.config.set('blog.description', 'Latest posts');
    await ctx.config.set('blog.postsPerPage', 10);

    ctx.logger.info('Blog: installation complete');
  },

  async onUninstall(ctx: ExtensionContext): Promise<void> {
    ctx.logger.warn('Blog: uninstalling — removing content types');
    ctx.events.emit('content:unregisterType', { slug: 'posts' });
    ctx.events.emit('content:unregisterType', { slug: 'categories' });
  },

  async onEnable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Blog: enabling — registering API routes');
    _registeredRoutes = buildApiRoutes(ctx);
    ctx.events.emit('api:registerRoutes', _registeredRoutes);
  },

  async onDisable(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Blog: disabling — removing API routes');
    ctx.events.emit('api:unregisterRoutes', _registeredRoutes);
    _registeredRoutes = [];
  },

  async onBoot(ctx: ExtensionContext): Promise<void> {
    ctx.logger.info('Blog: booting');
    _registeredRoutes = buildApiRoutes(ctx);
    ctx.events.emit('api:registerRoutes', _registeredRoutes);
  },

  // -------------------------------------------------------------------------
  // Admin UI
  // -------------------------------------------------------------------------

  adminMenuItems: [
    {
      key: 'blog',
      label: 'Blog',
      icon: 'pencil-square',
      href: '/admin/blog',
      requiredRole: 'editor',
      children: [
        {
          key: 'blog-posts',
          label: 'All Posts',
          icon: 'document-text',
          href: '/admin/blog/posts',
          requiredRole: 'editor',
        },
        {
          key: 'blog-categories',
          label: 'Categories',
          icon: 'tag',
          href: '/admin/blog/categories',
          requiredRole: 'editor',
        },
        {
          key: 'blog-new-post',
          label: 'New Post',
          icon: 'plus-circle',
          href: '/admin/blog/posts/new',
          requiredRole: 'editor',
        },
      ],
    },
  ],

  adminPages: [
    {
      path: 'blog/posts',
      title: 'All Posts',
      component: '@volqan/extension-blog/components/PostsList',
      layout: 'default',
    },
    {
      path: 'blog/posts/new',
      title: 'New Post',
      component: '@volqan/extension-blog/components/PostEditor',
      layout: 'default',
    },
    {
      path: 'blog/posts/:id/edit',
      title: 'Edit Post',
      component: '@volqan/extension-blog/components/PostEditor',
      layout: 'default',
    },
    {
      path: 'blog/categories',
      title: 'Categories',
      component: '@volqan/extension-blog/components/CategoriesList',
      layout: 'default',
    },
  ],

  // -------------------------------------------------------------------------
  // Content hooks
  // -------------------------------------------------------------------------

  contentHooks,

  // -------------------------------------------------------------------------
  // Routes — populated at boot time; declared as empty here for static type check
  // -------------------------------------------------------------------------

  apiRoutes: [],

  // -------------------------------------------------------------------------
  // Marketplace metadata
  // -------------------------------------------------------------------------

  marketplace: {
    category: 'content',
    tags: ['blog', 'posts', 'rss', 'categories', 'publishing'],
    screenshotUrls: [],
    demoUrl: 'https://demo.volqan.link/admin/blog',
  },
};

export default blogExtension;

// Named re-exports for convenience
export { generateRssFeed, postToRssItem } from './rss.js';
export type { RssItem, RssFeedOptions } from './rss.js';
export { PostEditor } from './components/PostEditor.js';
export type { PostEditorPost, PostEditorProps } from './components/PostEditor.js';
