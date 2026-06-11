'use client';

/**
 * @file components/ui/form-field.tsx
 * @description Dynamic form field renderer based on FieldType.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

// ---------------------------------------------------------------------------
// FieldType enum (mirrors core FieldType)
// ---------------------------------------------------------------------------

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'image'
  | 'file'
  | 'url'
  | 'email'
  | 'password'
  | 'color'
  | 'json'
  | 'relation';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface FormFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  defaultValue?: unknown;
  min?: number;
  max?: number;
}

export interface FormFieldProps {
  field: FormFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// FormField renderer
// ---------------------------------------------------------------------------

export function FormField({ field, value, onChange, error, disabled }: FormFieldProps) {
  const baseProps = {
    id: field.key,
    label: field.label,
    required: field.required,
    error,
    disabled,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
      return (
        <Input
          {...baseProps}
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          hint={field.description}
        />
      );

    case 'password':
      return (
        <Input
          {...baseProps}
          type="password"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          hint={field.description}
        />
      );

    case 'number':
      return (
        <Input
          {...baseProps}
          type="number"
          value={(value as number) ?? ''}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          hint={field.description}
          min={field.min}
          max={field.max}
        />
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          {field.label && (
            <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))]">
              {field.label}
              {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
            </label>
          )}
          <textarea
            id={field.key}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            rows={4}
            className={cn(
              'w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]',
              'px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
              'disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[80px]',
              error && 'border-[hsl(var(--destructive))]',
            )}
          />
          {error && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
          {field.description && !error && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
          )}
        </div>
      );

    case 'richtext':
      return (
        <div className="space-y-1.5">
          <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {field.label}
            {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
          </label>
          <div className={cn(
            'rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]',
            error && 'border-[hsl(var(--destructive))]',
          )}>
            {/* Rich text toolbar placeholder */}
            <div className="flex gap-1 p-2 border-b border-[hsl(var(--border))] flex-wrap">
              {[
                { label: 'B', title: 'Bold' }, { label: 'I', title: 'Italic' }, { label: 'U', title: 'Underline' },
                { label: 'H1', title: 'Heading 1' }, { label: 'H2', title: 'Heading 2' },
                { label: 'UL', title: 'Unordered list' }, { label: 'OL', title: 'Ordered list' }, { label: 'Link', title: 'Insert link' },
              ].map(({ label, title }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={title}
                  title={title}
                  className="px-2 py-0.5 text-xs rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              id={field.key}
              value={(value as string) ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder ?? 'Enter rich text content...'}
              disabled={disabled}
              rows={8}
              className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none resize-y"
            />
          </div>
          {error && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
          {field.description && !error && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-start gap-3">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id={field.key}
              type="checkbox"
              checked={(value as boolean) ?? false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
            />
          </div>
          <div>
            <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))] cursor-pointer">
              {field.label}
              {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
            </label>
            {field.description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{field.description}</p>
            )}
          </div>
        </div>
      );

    case 'date':
    case 'datetime':
      return (
        <Input
          {...baseProps}
          type={field.type === 'datetime' ? 'datetime-local' : 'date'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          hint={field.description}
        />
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {field.label}
            {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
          </label>
          <select
            id={field.key}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'w-full h-9 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]',
              'px-3 text-sm text-[hsl(var(--foreground))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-[hsl(var(--destructive))]',
            )}
          >
            <option value="">{field.placeholder ?? 'Select an option...'}</option>
            {field.options?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
          {field.description && !error && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
          )}
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            {field.label}
            {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt) => {
              const selected = Array.isArray(value) && (value as string[]).includes(String(opt.value));
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    const current = Array.isArray(value) ? (value as string[]) : [];
                    if (selected) {
                      onChange(current.filter((v) => v !== String(opt.value)));
                    } else {
                      onChange([...current, String(opt.value)]);
                    }
                  }}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    selected
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {error && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
          {field.description && !error && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
          )}
        </div>
      );

    case 'image':
    case 'file':
      return (
        <div className="space-y-1.5">
          <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {field.label}
            {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
          </label>
          <label
            htmlFor={field.key}
            className={cn(
              'border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-6',
              'block text-center cursor-pointer hover:border-[hsl(var(--primary))] transition-colors',
              error && 'border-[hsl(var(--destructive))]',
            )}
          >
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {field.type === 'image' ? 'Drop an image or click to upload' : 'Drop a file or click to upload'}
            </span>
            <input
              id={field.key}
              type="file"
              accept={field.type === 'image' ? 'image/*' : undefined}
              className="sr-only"
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {error && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
          {field.description && !error && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{field.description}</p>
          )}
        </div>
      );

    case 'color':
      return (
        <div className="space-y-1.5">
          <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {field.label}
          </label>
          <div className="flex items-center gap-2">
            <input
              id={field.key}
              type="color"
              value={(value as string) ?? '#000000'}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-9 h-9 rounded cursor-pointer border border-[hsl(var(--border))] p-0.5 bg-transparent"
            />
            <Input
              value={(value as string) ?? '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1"
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
        </div>
      );

    case 'json':
      return (
        <div className="space-y-1.5">
          <label htmlFor={field.key} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {field.label}
            {field.required && <span className="text-[hsl(var(--destructive))] ml-1" aria-hidden="true">*</span>}{field.required && <span className="sr-only">(required)</span>}
          </label>
          <textarea
            id={field.key}
            value={typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
            rows={6}
            className={cn(
              'w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]',
              'px-3 py-2 text-sm font-mono placeholder:text-[hsl(var(--muted-foreground))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
              'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
              error && 'border-[hsl(var(--destructive))]',
            )}
          />
          {error && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
        </div>
      );

    default:
      return (
        <Input
          {...baseProps}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          hint={field.description}
        />
      );
  }
}
