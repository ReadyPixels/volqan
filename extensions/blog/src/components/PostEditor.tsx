/**
 * @file components/PostEditor.tsx
 * @description Rich post editor for the Volqan Blog extension.
 *
 * Renders the full admin editing experience for a single blog post:
 * - Title field with live slug preview
 * - Excerpt textarea
 * - Featured image picker
 * - Category and tag selectors
 * - Rich-text body editor (delegated to Volqan's built-in RichTextEditor)
 * - Publish controls (draft / schedule / publish)
 */

import React, {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostEditorPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  publishedAt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author?: { id: string; name: string } | null;
}

export interface PostEditorProps {
  /** Initial post data. Pass undefined for a new post. */
  initialPost?: Partial<PostEditorPost>;
  /** Called when the user clicks Save / Publish. */
  onSave: (post: PostEditorPost, action: 'draft' | 'publish' | 'schedule') => Promise<void>;
  /** Called when the user cancels editing. */
  onCancel?: () => void;
  /** Whether the form is in a saving/loading state. */
  isSaving?: boolean;
  /** Available categories for the select dropdown. */
  categories?: Array<{ value: string; label: string }>;
}

const DEFAULT_CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Tutorial', label: 'Tutorial' },
  { value: 'News', label: 'News' },
  { value: 'Update', label: 'Update' },
];

// ---------------------------------------------------------------------------
// Slug generation helper
// ---------------------------------------------------------------------------

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface LabelProps {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}

function Label({ htmlFor, required, children }: LabelProps): JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.375rem',
      }}
    >
      {children}
      {required && (
        <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>
      )}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function Input({ error, style, ...props }: InputProps): JSX.Element {
  return (
    <>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: `1px solid ${error ? '#EF4444' : '#D1D5DB'}`,
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
      />
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
          {error}
        </p>
      )}
    </>
  );
}

interface ImagePickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

function ImagePicker({ value, onChange }: ImagePickerProps): JSX.Element {
  return (
    <div
      style={{
        border: '2px dashed #D1D5DB',
        borderRadius: '0.5rem',
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: '#F9FAFB',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {value ? (
        <div style={{ position: 'relative' }}>
          <img
            src={value}
            alt="Featured"
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '0.375rem',
            }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              width: '1.5rem',
              height: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '2rem', color: '#9CA3AF' }}>🖼</div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
            Click to pick featured image
          </p>
          <input
            type="url"
            placeholder="Or paste image URL..."
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              e.target.value ? onChange(e.target.value) : undefined
            }
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.375rem 0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}
    </div>
  );
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({ value, onChange }: TagInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue('');
    },
    [value, onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.375rem',
        padding: '0.375rem 0.5rem',
        border: '1px solid #D1D5DB',
        borderRadius: '0.375rem',
        minHeight: '2.5rem',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.125rem 0.5rem',
            background: '#DBEAFE',
            color: '#1D4ED8',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1D4ED8',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue.trim() && addTag(inputValue)}
        placeholder={value.length === 0 ? 'Add tags (press Enter)…' : ''}
        style={{
          border: 'none',
          outline: 'none',
          flexGrow: 1,
          minWidth: '120px',
          fontSize: '0.875rem',
        }}
      />
    </div>
  );
}

interface RichTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

/**
 * Lightweight rich-text placeholder.
 * In production this would delegate to Volqan's built-in TipTap/ProseMirror editor.
 * The textarea fallback guarantees the component is always functional.
 */
function RichTextArea({ value, onChange, minHeight = '400px' }: RichTextAreaProps): JSX.Element {
  return (
    <div
      style={{
        border: '1px solid #D1D5DB',
        borderRadius: '0.375rem',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.375rem 0.5rem',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          flexWrap: 'wrap',
        }}
      >
        {['B', 'I', 'U', 'H1', 'H2', 'H3', '— Quote', '{ } Code', '⛓ Link', '📷 Image'].map((btn) => (
          <button
            key={btn}
            type="button"
            style={{
              padding: '0.125rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid #D1D5DB',
              borderRadius: '0.25rem',
              background: '#fff',
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            {btn}
          </button>
        ))}
      </div>
      {/* Editor surface */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          minHeight,
          padding: '0.75rem',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
        }}
        placeholder="Write your post content here (Markdown / HTML supported)…"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Publish Controls
// ---------------------------------------------------------------------------

interface PublishControlsProps {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  isSaving: boolean;
  onDraft: () => void;
  onPublish: () => void;
  onSchedule: () => void;
}

function PublishControls({
  status,
  publishedAt,
  isSaving,
  onDraft,
  onPublish,
  onSchedule,
}: PublishControlsProps): JSX.Element {
  const isScheduled =
    publishedAt != null && new Date(publishedAt).getTime() > Date.now();

  return (
    <div
      style={{
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '0.5rem',
        padding: '1rem',
      }}
    >
      <h3
        style={{
          margin: '0 0 0.75rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        Publish Settings
      </h3>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            backgroundColor:
              status === 'PUBLISHED'
                ? '#10B981'
                : status === 'DRAFT'
                  ? '#F59E0B'
                  : '#6B7280',
          }}
        />
        <span style={{ fontSize: '0.875rem', color: '#374151' }}>
          {status === 'PUBLISHED' && !isScheduled ? 'Published' : ''}
          {status === 'DRAFT' ? 'Draft' : ''}
          {status === 'ARCHIVED' ? 'Archived' : ''}
          {isScheduled ? `Scheduled for ${new Date(publishedAt!).toLocaleString()}` : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSaving}
          style={{
            padding: '0.625rem 1rem',
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? 'Saving…' : status === 'PUBLISHED' ? 'Update Post' : 'Publish Now'}
        </button>

        <button
          type="button"
          onClick={onSchedule}
          disabled={isSaving}
          style={{
            padding: '0.625rem 1rem',
            background: '#fff',
            color: '#2563EB',
            border: '1px solid #2563EB',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          Schedule
        </button>

        <button
          type="button"
          onClick={onDraft}
          disabled={isSaving}
          style={{
            padding: '0.625rem 1rem',
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #D1D5DB',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          Save as Draft
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main PostEditor
// ---------------------------------------------------------------------------

export function PostEditor({
  initialPost,
  onSave,
  onCancel,
  isSaving = false,
  categories = DEFAULT_CATEGORIES,
}: PostEditorProps): JSX.Element {
  const [post, setPost] = useState<PostEditorPost>({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    featuredImage: null,
    category: '',
    tags: [],
    publishedAt: null,
    status: 'DRAFT',
    ...initialPost,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialPost?.slug),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title unless the user manually edited it.
  useEffect(() => {
    if (!slugManuallyEdited) {
      setPost((p) => ({ ...p, slug: titleToSlug(p.title) }));
    }
  }, [post.title, slugManuallyEdited]);

  function setField<K extends keyof PostEditorPost>(
    key: K,
    value: PostEditorPost[K],
  ): void {
    setPost((p) => ({ ...p, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!post.title.trim()) next['title'] = 'Title is required.';
    if (!post.slug.trim()) next['slug'] = 'Slug is required.';
    if (!post.body.trim()) next['body'] = 'Body content is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleAction(action: 'draft' | 'publish' | 'schedule'): Promise<void> {
    if (!validate()) return;

    const publishedAt =
      action === 'publish'
        ? (post.publishedAt ?? new Date().toISOString())
        : post.publishedAt;

    const status: PostEditorPost['status'] =
      action === 'draft' ? 'DRAFT' : 'PUBLISHED';

    await onSave({ ...post, status, publishedAt }, action);
  }

  function handleFormSubmit(e: FormEvent): void {
    e.preventDefault();
    void handleAction('publish');
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1.5rem',
        }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Main content column */}
        {/* ---------------------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title */}
          <div>
            <Label htmlFor="post-title" required>
              Title
            </Label>
            <Input
              id="post-title"
              type="text"
              value={post.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="My amazing blog post…"
              error={errors['title']}
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="post-slug" required>
              Slug
            </Label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                /blog/
              </span>
              <Input
                id="post-slug"
                type="text"
                value={post.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setField('slug', titleToSlug(e.target.value));
                }}
                placeholder="my-amazing-blog-post"
                error={errors['slug']}
              />
              {slugManuallyEdited && (
                <button
                  type="button"
                  onClick={() => {
                    setSlugManuallyEdited(false);
                    setField('slug', titleToSlug(post.title));
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                    color: '#2563EB',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <textarea
              id="post-excerpt"
              value={post.excerpt}
              onChange={(e) => setField('excerpt', e.target.value)}
              placeholder="A short summary shown in post listings and meta descriptions…"
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Body */}
          <div>
            <Label htmlFor="post-body" required>
              Content
            </Label>
            {errors['body'] && (
              <p style={{ fontSize: '0.75rem', color: '#EF4444', marginBottom: '0.25rem' }}>
                {errors['body']}
              </p>
            )}
            <RichTextArea
              value={post.body}
              onChange={(v) => setField('body', v)}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Sidebar column */}
        {/* ---------------------------------------------------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Publish controls */}
          <PublishControls
            status={post.status}
            publishedAt={post.publishedAt}
            isSaving={isSaving}
            onDraft={() => void handleAction('draft')}
            onPublish={() => void handleAction('publish')}
            onSchedule={() => void handleAction('schedule')}
          />

          {/* Featured Image */}
          <div>
            <Label htmlFor="post-image">Featured Image</Label>
            <ImagePicker
              value={post.featuredImage}
              onChange={(v) => setField('featuredImage', v)}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="post-category">Category</Label>
            <select
              id="post-category"
              value={post.category}
              onChange={(e) => setField('category', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: '#fff',
                boxSizing: 'border-box',
              }}
            >
              <option value="">— Select category —</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="post-tags">Tags</Label>
            <TagInput
              value={post.tags}
              onChange={(tags) => setField('tags', tags)}
            />
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
              Press Enter or comma to add a tag.
            </p>
          </div>

          {/* Scheduled publish date */}
          <div>
            <Label htmlFor="post-date">Publish Date</Label>
            <Input
              id="post-date"
              type="datetime-local"
              value={
                post.publishedAt
                  ? new Date(post.publishedAt).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                setField(
                  'publishedAt',
                  e.target.value ? new Date(e.target.value).toISOString() : null,
                )
              }
            />
          </div>

          {/* Cancel */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#6B7280',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export default PostEditor;
