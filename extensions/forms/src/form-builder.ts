/**
 * @file form-builder.ts
 * @description Form definition types and submission validation logic
 * for the Volqan Forms extension.
 */

// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

export type FormFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'date'
  | 'phone'
  | 'url'
  | 'hidden';

// ---------------------------------------------------------------------------
// Field validation rules
// ---------------------------------------------------------------------------

export interface FormFieldValidation {
  /** Minimum numeric value or minimum string length. */
  min?: number;
  /** Maximum numeric value or maximum string length. */
  max?: number;
  /** Regex pattern the value must match. */
  pattern?: string;
  /** Error message shown when the pattern doesn't match. */
  patternMessage?: string;
  /** Allowed MIME types for file fields (e.g. ["image/jpeg", "image/png"]). */
  accept?: string[];
  /** Maximum file size in bytes for file fields. */
  maxFileSize?: number;
}

// ---------------------------------------------------------------------------
// Form field definition
// ---------------------------------------------------------------------------

export interface FormFieldOption {
  /** Stored value. */
  value: string;
  /** Display label. */
  label: string;
}

export interface FormField {
  /**
   * Field type — determines the rendered input and validation rules.
   */
  type: FormFieldType;

  /**
   * Internal field identifier (used as the key in submission data).
   * Must be unique within the form. camelCase recommended.
   */
  name: string;

  /** Human-readable field label. */
  label: string;

  /** Placeholder text for text-like inputs. */
  placeholder?: string;

  /** Whether the field must be filled before the form can be submitted. */
  required?: boolean;

  /** Validation constraints applied to the field value. */
  validation?: FormFieldValidation;

  /**
   * Allowed options for select, radio, and checkbox-group fields.
   * Ignored for other field types.
   */
  options?: FormFieldOption[];

  /** Default value pre-filled in the input. */
  defaultValue?: string | boolean | number;

  /** Optional help text rendered below the input. */
  helpText?: string;

  /** CSS width hint: full | half | third | quarter. Default: full. */
  width?: 'full' | 'half' | 'third' | 'quarter';

  /** Whether this field is hidden from the rendered form output. */
  hidden?: boolean;

  /**
   * Conditional display: only show this field when another field matches a value.
   * @example { field: 'country', value: 'US' }
   */
  showIf?: {
    field: string;
    value: string | boolean | number;
  };
}

// ---------------------------------------------------------------------------
// Form settings
// ---------------------------------------------------------------------------

export interface EmailNotificationSettings {
  /** Whether to send email notifications on new submissions. */
  enabled: boolean;
  /** Comma-separated list of recipient addresses. */
  to: string;
  /** Email subject line. Supports {{fieldName}} tokens. */
  subject: string;
  /** Optional reply-to address sourced from a form field name. */
  replyToField?: string;
}

export interface FormSettings {
  /**
   * URL to redirect the user to after a successful submission.
   * If omitted, the success message is shown in-place.
   */
  redirectUrl?: string;

  /**
   * Message displayed to the user after a successful submission.
   * Supports basic HTML.
   */
  successMessage: string;

  /** Email notification configuration. */
  emailNotification?: EmailNotificationSettings;

  /**
   * Honeypot field name for basic bot detection.
   * A hidden input with this name is added to the form; submissions that
   * include a non-empty value for it are rejected silently.
   * @default 'website_url'
   */
  honeypot?: string;

  /** Rate limiting applied to the public submission endpoint. */
  rateLimit?: {
    /** Maximum submissions allowed per IP per window. */
    maxSubmissions: number;
    /** Time window in seconds. */
    windowSeconds: number;
  };

  /** Whether to store submission data in the database. Default: true. */
  storeSubmissions?: boolean;

  /** Whether to allow file uploads. Default: false. */
  allowFileUploads?: boolean;
}

// ---------------------------------------------------------------------------
// Full form definition
// ---------------------------------------------------------------------------

export interface FormDefinition {
  /** Human-readable form name shown in the admin. */
  name: string;

  /** Optional description shown to admins. */
  description?: string;

  /** Ordered list of fields to render. */
  fields: FormField[];

  /** Behavioural settings for the form. */
  settings: FormSettings;
}

// ---------------------------------------------------------------------------
// Submission validation
// ---------------------------------------------------------------------------

export interface FieldError {
  /** Field name that failed validation. */
  field: string;
  /** Human-readable error message. */
  message: string;
}

export interface ValidationResult {
  /** Whether the submission is valid. */
  valid: boolean;
  /** List of field-level errors (empty when valid). */
  errors: FieldError[];
}

/**
 * Validates a raw form submission against a FormDefinition.
 *
 * Checks:
 * - Required fields are present and non-empty.
 * - Email fields pass basic RFC 5322 format check.
 * - URL fields have a valid protocol.
 * - Number fields are within min/max bounds.
 * - Text/textarea fields respect min/max length constraints.
 * - Pattern validation if provided.
 * - Honeypot field is empty (bot detection).
 * - Select/radio values exist in the allowed options list.
 *
 * @param form - The FormDefinition to validate against.
 * @param data - Raw submission data keyed by field name.
 * @returns A ValidationResult with valid flag and array of field errors.
 */
export function validateSubmission(
  form: FormDefinition,
  data: Record<string, unknown>,
): ValidationResult {
  const errors: FieldError[] = [];

  // Honeypot check — silently reject submissions with a filled honeypot field.
  const honeypotField = form.settings.honeypot ?? 'website_url';
  const honeypotValue = data[honeypotField];
  if (honeypotValue !== undefined && honeypotValue !== '' && honeypotValue !== null) {
    // Return as valid to not reveal the spam detection to bots.
    return { valid: true, errors: [] };
  }

  for (const field of form.fields) {
    if (field.hidden) continue; // Skip hidden fields from validation.

    const rawValue = data[field.name];
    const value = rawValue ?? field.defaultValue ?? '';
    const strValue = String(value).trim();

    // Check conditional display — skip validation if field isn't visible.
    if (field.showIf) {
      const conditionValue = data[field.showIf.field];
      if (String(conditionValue) !== String(field.showIf.value)) {
        continue; // Field is not displayed, skip validation.
      }
    }

    // Required check.
    if (field.required) {
      const isEmpty =
        rawValue === undefined ||
        rawValue === null ||
        strValue === '' ||
        (Array.isArray(rawValue) && rawValue.length === 0);

      if (isEmpty) {
        errors.push({
          field: field.name,
          message: `${field.label} is required.`,
        });
        continue; // No point running further checks on an empty required field.
      }
    } else if (strValue === '') {
      continue; // Optional empty field — skip further validation.
    }

    // Type-specific validation.
    switch (field.type) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid email address.`,
          });
        }
        break;
      }

      case 'url': {
        try {
          const url = new URL(strValue);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push({
              field: field.name,
              message: `${field.label} must be a valid URL (http or https).`,
            });
          }
        } catch {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid URL.`,
          });
        }
        break;
      }

      case 'phone': {
        // Permissive E.164-ish check: optional +, then 6-15 digits with optional spaces/dashes.
        const phoneRegex = /^\+?[\d\s\-().]{6,20}$/;
        if (!phoneRegex.test(strValue)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid phone number.`,
          });
        }
        break;
      }

      case 'number': {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a number.`,
          });
          break;
        }
        if (field.validation?.min !== undefined && num < field.validation.min) {
          errors.push({
            field: field.name,
            message: `${field.label} must be at least ${field.validation.min}.`,
          });
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          errors.push({
            field: field.name,
            message: `${field.label} must be at most ${field.validation.max}.`,
          });
        }
        break;
      }

      case 'date': {
        const d = new Date(strValue);
        if (isNaN(d.getTime())) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid date.`,
          });
        }
        break;
      }

      case 'select':
      case 'radio': {
        const allowedValues = (field.options ?? []).map((o) => o.value);
        if (allowedValues.length > 0 && !allowedValues.includes(strValue)) {
          errors.push({
            field: field.name,
            message: `${field.label} contains an invalid selection.`,
          });
        }
        break;
      }

      case 'text':
      case 'textarea': {
        if (field.validation?.min !== undefined && strValue.length < field.validation.min) {
          errors.push({
            field: field.name,
            message:
              field.validation.message ??
              `${field.label} must be at least ${field.validation.min} characters.`,
          });
        }
        if (field.validation?.max !== undefined && strValue.length > field.validation.max) {
          errors.push({
            field: field.name,
            message:
              field.validation.message ??
              `${field.label} must be at most ${field.validation.max} characters.`,
          });
        }
        break;
      }

      default:
        break;
    }

    // Pattern validation (all text-like fields).
    if (field.validation?.pattern && strValue) {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(strValue)) {
          errors.push({
            field: field.name,
            message:
              field.validation.patternMessage ??
              `${field.label} format is invalid.`,
          });
        }
      } catch {
        // Ignore invalid regex patterns.
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Form builder utilities
// ---------------------------------------------------------------------------

/**
 * Creates a new empty FormDefinition with sensible defaults.
 */
export function createEmptyForm(name = 'New Form'): FormDefinition {
  return {
    name,
    fields: [],
    settings: {
      successMessage: 'Thank you! Your submission has been received.',
      honeypot: 'website_url',
      rateLimit: { maxSubmissions: 5, windowSeconds: 3600 },
      storeSubmissions: true,
      allowFileUploads: false,
    },
  };
}

/**
 * Creates a blank FormField with the given type.
 * Useful as a starting point when the user drags a new field onto the builder.
 */
export function createEmptyField(type: FormFieldType, name: string): FormField {
  const labelMap: Record<FormFieldType, string> = {
    text: 'Text Field',
    email: 'Email',
    number: 'Number',
    textarea: 'Message',
    select: 'Dropdown',
    checkbox: 'Checkbox',
    radio: 'Radio Group',
    file: 'File Upload',
    date: 'Date',
    phone: 'Phone',
    url: 'URL',
    hidden: 'Hidden Field',
  };

  return {
    type,
    name,
    label: labelMap[type],
    required: type !== 'hidden',
    width: 'full',
  };
}

/**
 * Serialises a FormDefinition to a plain JSON-safe object (for storage in the
 * `fields` and `settings` JSON columns of the `forms` content type).
 */
export function serializeForm(form: FormDefinition): {
  fields: string;
  settings: string;
} {
  return {
    fields: JSON.stringify(form.fields),
    settings: JSON.stringify(form.settings),
  };
}

/**
 * Deserialises a stored form record back into a FormDefinition.
 */
export function deserializeForm(record: {
  name: string;
  description?: string;
  fields: string | FormField[];
  settings: string | FormSettings;
}): FormDefinition {
  return {
    name: record.name,
    description: record.description,
    fields:
      typeof record.fields === 'string'
        ? (JSON.parse(record.fields) as FormField[])
        : record.fields,
    settings:
      typeof record.settings === 'string'
        ? (JSON.parse(record.settings) as FormSettings)
        : record.settings,
  };
}
