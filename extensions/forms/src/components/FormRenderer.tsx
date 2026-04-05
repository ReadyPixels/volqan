/**
 * @file components/FormRenderer.tsx
 * @description Public-facing form renderer for the Volqan Forms extension.
 *
 * Renders a FormDefinition as a usable HTML form that:
 * - Validates fields client-side before submit
 * - Implements honeypot spam protection
 * - Applies conditional field display (showIf)
 * - Handles multi-step rate-limiting feedback
 * - Posts to the extension API endpoint
 */

import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { type FormDefinition, type FormField, validateSubmission } from '../form-builder.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormRendererProps {
  /** The form definition to render. */
  form: FormDefinition;
  /** The numeric or string form ID (used to construct the submission URL). */
  formId: string | number;
  /** Base URL for the Forms API. Defaults to '/api/forms'. */
  apiBase?: string;
  /** Override the success message from the form settings. */
  successMessage?: string;
  /** Override the redirect URL from the form settings. */
  redirectUrl?: string;
  /** Additional CSS classes on the root form element. */
  className?: string;
  /** Called after a successful submission with the raw server response. */
  onSuccess?: (response: unknown) => void;
  /** Called after a failed submission with the error. */
  onError?: (error: Error) => void;
}

type FieldValue = string | boolean | number | File | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitialData(fields: FormField[]): Record<string, FieldValue> {
  const data: Record<string, FieldValue> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue as FieldValue;
    } else if (field.type === 'checkbox') {
      data[field.name] = false;
    } else {
      data[field.name] = '';
    }
  }
  return data;
}

function isFieldVisible(field: FormField, data: Record<string, FieldValue>): boolean {
  if (!field.showIf) return true;
  const condValue = data[field.showIf.field];
  return String(condValue) === String(field.showIf.value);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldProps {
  field: FormField;
  value: FieldValue;
  error?: string;
  onChange: (name: string, value: FieldValue) => void;
}

function RenderedField({ field, value, error, onChange }: FieldProps): JSX.Element {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: `1px solid ${error ? '#EF4444' : '#D1D5DB'}`,
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    backgroundColor: '#fff',
  };

  function handleFocus(e: React.FocusEvent<HTMLElement>): void {
    (e.target as HTMLElement).style.borderColor = '#2563EB';
    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
  }

  function handleBlur(e: React.FocusEvent<HTMLElement>): void {
    (e.target as HTMLElement).style.borderColor = error ? '#EF4444' : '#D1D5DB';
    (e.target as HTMLElement).style.boxShadow = 'none';
  }

  const sharedHandlers = { onFocus: handleFocus, onBlur: handleBlur };

  if (field.type === 'hidden') {
    return (
      <input type="hidden" name={field.name} value={String(value ?? field.defaultValue ?? '')} />
    );
  }

  return (
    <div>
      {/* Label */}
      {field.type !== 'checkbox' && (
        <label
          htmlFor={`field-${field.name}`}
          style={{
            display: 'block',
            fontWeight: 500,
            fontSize: '0.9375rem',
            color: '#111827',
            marginBottom: '0.375rem',
          }}
        >
          {field.label}
          {field.required && (
            <span style={{ color: '#EF4444', marginLeft: '0.25rem' }} aria-hidden>*</span>
          )}
        </label>
      )}

      {/* Input rendering */}
      {(field.type === 'text' ||
        field.type === 'email' ||
        field.type === 'phone' ||
        field.type === 'url' ||
        field.type === 'date' ||
        field.type === 'number') && (
        <input
          id={`field-${field.name}`}
          type={field.type === 'phone' ? 'tel' : field.type}
          name={field.name}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          aria-describedby={error ? `field-${field.name}-error` : field.helpText ? `field-${field.name}-help` : undefined}
          aria-invalid={Boolean(error)}
          style={inputStyle}
          {...sharedHandlers}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          id={`field-${field.name}`}
          name={field.name}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={5}
          aria-describedby={error ? `field-${field.name}-error` : field.helpText ? `field-${field.name}-help` : undefined}
          aria-invalid={Boolean(error)}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          {...sharedHandlers}
        />
      )}

      {field.type === 'select' && (
        <select
          id={`field-${field.name}`}
          name={field.name}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
          aria-invalid={Boolean(error)}
          style={inputStyle}
          {...sharedHandlers}
        >
          <option value="">— Select an option —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div role="radiogroup" aria-labelledby={`field-${field.name}-label`}>
          {(field.options ?? []).map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                color: '#374151',
              }}
            >
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={String(value) === opt.value}
                onChange={() => onChange(field.name, opt.value)}
                required={field.required}
                style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            color: '#374151',
            lineHeight: 1.5,
          }}
        >
          <input
            id={`field-${field.name}`}
            type="checkbox"
            name={field.name}
            checked={Boolean(value)}
            onChange={(e) => onChange(field.name, e.target.checked)}
            required={field.required}
            style={{ width: '1rem', height: '1rem', marginTop: '0.125rem', cursor: 'pointer', flexShrink: 0 }}
          />
          <span>
            {field.label}
            {field.required && <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>}
          </span>
        </label>
      )}

      {field.type === 'file' && (
        <input
          id={`field-${field.name}`}
          type="file"
          name={field.name}
          onChange={(e) => onChange(field.name, e.target.files?.[0] ?? null)}
          required={field.required}
          accept={field.validation?.accept?.join(',')}
          style={{ ...inputStyle, padding: '0.375rem' }}
        />
      )}

      {/* Help text */}
      {field.helpText && !error && (
        <p
          id={`field-${field.name}-help`}
          style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#6B7280' }}
        >
          {field.helpText}
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          id={`field-${field.name}-error`}
          role="alert"
          style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormRenderer
// ---------------------------------------------------------------------------

export function FormRenderer({
  form,
  formId,
  apiBase = '/api/forms',
  successMessage,
  redirectUrl,
  className,
  onSuccess,
  onError,
}: FormRendererProps): JSX.Element {
  const [data, setData] = useState<Record<string, FieldValue>>(() =>
    getInitialData(form.fields),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Rate-limit tracking (client-side guard — server enforces the real limit).
  const submissionTimes = useRef<number[]>([]);

  const honeypotName = form.settings.honeypot ?? 'website_url';

  // Update field data when the form definition changes (e.g. live preview).
  useEffect(() => {
    setData(getInitialData(form.fields));
    setErrors({});
    setSubmitted(false);
  }, [form]);

  function handleChange(name: string, value: FieldValue): void {
    setData((d) => ({ ...d, [name]: value }));
    // Clear error on user interaction.
    if (errors[name]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setServerError(null);

    // Client-side rate limit check.
    if (form.settings.rateLimit) {
      const { maxSubmissions, windowSeconds } = form.settings.rateLimit;
      const now = Date.now();
      const windowMs = windowSeconds * 1000;
      const recent = submissionTimes.current.filter((t) => now - t < windowMs);
      if (recent.length >= maxSubmissions) {
        setServerError(
          `You've submitted this form too many times. Please wait ${Math.ceil(windowSeconds / 60)} minute(s) before trying again.`,
        );
        return;
      }
    }

    // Filter only visible fields for validation.
    const visibleData: Record<string, unknown> = {};
    for (const field of form.fields) {
      if (isFieldVisible(field, data)) {
        visibleData[field.name] = data[field.name];
      }
    }

    // Add honeypot field (should be empty).
    visibleData[honeypotName] = data[honeypotName] ?? '';

    const result = validateSubmission(form, visibleData);
    if (!result.valid) {
      const errs: Record<string, string> = {};
      for (const err of result.errors) {
        errs[err.field] = err.message;
      }
      setErrors(errs);
      // Scroll to first error.
      const firstError = Object.keys(errs)[0];
      if (firstError) {
        document.getElementById(`field-${firstError}`)?.focus();
      }
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visibleData),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error(String(body['error'] ?? `Server error: ${response.status}`));
      }

      const responseData = await response.json();

      // Record submission time for client-side rate limiting.
      submissionTimes.current = [...submissionTimes.current, Date.now()];

      onSuccess?.(responseData);

      const redirect = redirectUrl ?? form.settings.redirectUrl;
      if (redirect) {
        window.location.href = redirect;
        return;
      }

      setSubmitted(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Submission failed');
      setServerError(error.message);
      onError?.(error);
    } finally {
      setSubmitting(false);
    }
  }

  // Success state.
  if (submitted) {
    const message = successMessage ?? form.settings.successMessage;
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '0.5rem',
        }}
        role="alert"
        aria-live="polite"
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <div
          dangerouslySetInnerHTML={{ __html: message }}
          style={{ color: '#15803D', fontSize: '1rem', lineHeight: 1.6 }}
        />
      </div>
    );
  }

  const widthMap: Record<string, string> = {
    full: '100%',
    half: 'calc(50% - 0.5rem)',
    third: 'calc(33.33% - 0.5rem)',
    quarter: 'calc(25% - 0.5rem)',
  };

  return (
    <form
      className={className}
      onSubmit={(e) => { void handleSubmit(e); }}
      noValidate
      aria-label={form.name}
    >
      {/* Honeypot field — visually hidden, must remain empty */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label htmlFor={`honeypot-${honeypotName}`}>
          Leave this field empty
          <input
            id={`honeypot-${honeypotName}`}
            type="text"
            name={honeypotName}
            value=""
            onChange={() => {}}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        {form.fields.map((field) => {
          if (!isFieldVisible(field, data)) return null;

          const fieldWidth = widthMap[field.width ?? 'full'] ?? '100%';

          return (
            <div key={field.name} style={{ width: fieldWidth }}>
              <RenderedField
                field={field}
                value={data[field.name] ?? ''}
                error={errors[field.name]}
                onChange={handleChange}
              />
            </div>
          );
        })}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '0.375rem',
            color: '#B91C1C',
            fontSize: '0.875rem',
          }}
        >
          {serverError}
        </div>
      )}

      {/* Submit button */}
      <div style={{ marginTop: '1.5rem' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem 2rem',
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

export default FormRenderer;
