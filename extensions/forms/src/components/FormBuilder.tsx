/**
 * @file components/FormBuilder.tsx
 * @description Visual drag-and-drop form builder for the Volqan Forms extension.
 *
 * Allows admins to:
 * - Drag field types from a palette onto the canvas
 * - Reorder fields via drag handles
 * - Configure labels, placeholders, validation, and options
 * - Preview the rendered form
 * - Test form submission
 */

import React, { useState, useCallback, useRef, type DragEvent } from 'react';
import {
  type FormDefinition,
  type FormField,
  type FormFieldType,
  type FormFieldOption,
  createEmptyField,
  createEmptyForm,
  validateSubmission,
} from '../form-builder.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormBuilderProps {
  /** Initial form definition. Defaults to an empty form. */
  initialForm?: FormDefinition;
  /** Called whenever the form definition changes. */
  onChange?: (form: FormDefinition) => void;
  /** Called when the user saves the form. */
  onSave?: (form: FormDefinition) => Promise<void>;
  /** Whether the form is being saved. */
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Field palette items
// ---------------------------------------------------------------------------

const PALETTE_FIELDS: Array<{ type: FormFieldType; label: string; icon: string }> = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'email', label: 'Email', icon: '✉️' },
  { type: 'phone', label: 'Phone', icon: '📱' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'url', label: 'URL', icon: '🔗' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'textarea', label: 'Textarea', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '▼' },
  { type: 'radio', label: 'Radio', icon: '🔘' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'hidden', label: 'Hidden', icon: '👁' },
];

// ---------------------------------------------------------------------------
// Inline helpers
// ---------------------------------------------------------------------------

function generateFieldName(type: FormFieldType, existingFields: FormField[]): string {
  const base = type.replace(/[^a-z]/g, '');
  let count = 1;
  let name = `${base}${count}`;
  while (existingFields.some((f) => f.name === name)) {
    count++;
    name = `${base}${count}`;
  }
  return name;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PaletteItemProps {
  type: FormFieldType;
  label: string;
  icon: string;
  onDragStart: (type: FormFieldType) => void;
  onAdd: (type: FormFieldType) => void;
}

function PaletteItem({ type, label, icon, onDragStart, onAdd }: PaletteItemProps): JSX.Element {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(type)}
      onClick={() => onAdd(type)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.5rem 0.625rem',
        border: '1px solid #E5E7EB',
        borderRadius: '0.375rem',
        cursor: 'grab',
        backgroundColor: '#fff',
        fontSize: '0.8125rem',
        userSelect: 'none',
        transition: 'background-color 0.1s, border-color 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#EFF6FF';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#93C5FD';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fff';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB';
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

interface FieldEditorProps {
  field: FormField;
  index: number;
  total: number;
  onUpdate: (index: number, field: FormField) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDragStart: (index: number) => void;
  onDrop: (dropIndex: number) => void;
}

function FieldEditor({
  field,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDrop,
}: FieldEditorProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [optionInput, setOptionInput] = useState('');

  function update<K extends keyof FormField>(key: K, value: FormField[K]): void {
    onUpdate(index, { ...field, [key]: value });
  }

  function addOption(): void {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    const newOption: FormFieldOption = { value: trimmed.toLowerCase().replace(/\s+/g, '-'), label: trimmed };
    update('options', [...(field.options ?? []), newOption]);
    setOptionInput('');
  }

  function removeOption(optionValue: string): void {
    update('options', (field.options ?? []).filter((o) => o.value !== optionValue));
  }

  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '0.5rem',
        backgroundColor: '#fff',
        overflow: 'hidden',
        marginBottom: '0.5rem',
      }}
    >
      {/* Field header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          backgroundColor: '#F9FAFB',
          borderBottom: expanded ? '1px solid #E5E7EB' : 'none',
        }}
      >
        <span style={{ cursor: 'grab', color: '#9CA3AF', fontSize: '1rem' }}>⠿</span>
        <span
          style={{
            padding: '0.125rem 0.375rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            backgroundColor: '#DBEAFE',
            color: '#1D4ED8',
            borderRadius: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {field.type}
        </span>
        <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111827', flex: 1 }}>
          {field.label || '(untitled)'}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0}
            style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: '#6B7280', fontSize: '0.75rem', padding: '0.125rem 0.25rem' }}>▲</button>
          <button type="button" onClick={() => onMoveDown(index)} disabled={index === total - 1}
            style={{ background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: '#6B7280', fontSize: '0.75rem', padding: '0.125rem 0.25rem' }}>▼</button>
          <button type="button" onClick={() => setExpanded((e) => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '0.75rem', padding: '0.125rem 0.25rem' }}>
            {expanded ? '▲ Less' : '▼ Edit'}
          </button>
          <button type="button" onClick={() => onRemove(index)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.75rem', padding: '0.125rem 0.25rem' }}>✕</button>
        </div>
      </div>

      {/* Field edit form */}
      {expanded && (
        <div style={{ padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
              Label
            </label>
            <input type="text" value={field.label} onChange={(e) => update('label', e.target.value)}
              style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
              Name (key)
            </label>
            <input type="text" value={field.name} onChange={(e) => update('name', e.target.value.replace(/\s+/g, '_'))}
              style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.8125rem', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
              Placeholder
            </label>
            <input type="text" value={field.placeholder ?? ''} onChange={(e) => update('placeholder', e.target.value || undefined)}
              style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
              Width
            </label>
            <select value={field.width ?? 'full'} onChange={(e) => update('width', e.target.value as FormField['width'])}
              style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.8125rem', boxSizing: 'border-box' }}>
              <option value="full">Full</option>
              <option value="half">Half</option>
              <option value="third">Third</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={field.required ?? false} onChange={(e) => update('required', e.target.checked)} />
              Required
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={field.hidden ?? false} onChange={(e) => update('hidden', e.target.checked)} />
              Hidden
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
              Help text
            </label>
            <input type="text" value={field.helpText ?? ''} onChange={(e) => update('helpText', e.target.value || undefined)}
              placeholder="Shown below the input…"
              style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
          </div>

          {/* Options editor for select/radio/checkbox */}
          {hasOptions && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Options
              </label>
              {(field.options ?? []).map((opt) => (
                <div key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                  <span style={{ flex: 1, fontSize: '0.8125rem', padding: '0.25rem 0.5rem', backgroundColor: '#F9FAFB', borderRadius: '0.25rem', border: '1px solid #E5E7EB' }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>{opt.value}</span>
                  <button type="button" onClick={() => removeOption(opt.value)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.125rem' }}>✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
                <input type="text" value={optionInput} onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  placeholder="Add option…"
                  style={{ flex: 1, padding: '0.375rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem', fontSize: '0.8125rem' }} />
                <button type="button" onClick={addOption}
                  style={{ padding: '0.375rem 0.75rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormBuilder
// ---------------------------------------------------------------------------

export function FormBuilder({
  initialForm,
  onChange,
  onSave,
  isSaving = false,
}: FormBuilderProps): JSX.Element {
  const [form, setForm] = useState<FormDefinition>(initialForm ?? createEmptyForm());
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'preview'>('build');
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const dragFieldType = useRef<FormFieldType | null>(null);
  const dragIndex = useRef<number | null>(null);

  const updateForm = useCallback(
    (updater: (f: FormDefinition) => FormDefinition) => {
      setForm((current) => {
        const next = updater(current);
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  // Palette drag start (adding new field)
  function handlePaletteDragStart(type: FormFieldType): void {
    dragFieldType.current = type;
    dragIndex.current = null;
  }

  // Canvas field drag start (reordering)
  function handleFieldDragStart(index: number): void {
    dragIndex.current = index;
    dragFieldType.current = null;
  }

  function handleCanvasDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    if (dragFieldType.current) {
      addField(dragFieldType.current);
      dragFieldType.current = null;
    }
  }

  function addField(type: FormFieldType): void {
    updateForm((f) => {
      const name = generateFieldName(type, f.fields);
      const newField = createEmptyField(type, name);
      return { ...f, fields: [...f.fields, newField] };
    });
  }

  function updateField(index: number, updated: FormField): void {
    updateForm((f) => {
      const fields = [...f.fields];
      fields[index] = updated;
      return { ...f, fields };
    });
  }

  function removeField(index: number): void {
    updateForm((f) => ({
      ...f,
      fields: f.fields.filter((_, i) => i !== index),
    }));
  }

  function moveField(index: number, direction: 'up' | 'down'): void {
    updateForm((f) => {
      const fields = [...f.fields];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= fields.length) return f;
      [fields[index], fields[swapIndex]] = [fields[swapIndex]!, fields[index]!];
      return { ...f, fields };
    });
  }

  function handleFieldDrop(dropIndex: number): void {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const from = dragIndex.current;
    updateForm((f) => {
      const fields = [...f.fields];
      const [moved] = fields.splice(from, 1);
      if (moved) fields.splice(dropIndex, 0, moved);
      return { ...f, fields };
    });
    dragIndex.current = null;
  }

  function handlePreviewSubmit(): void {
    const result = validateSubmission(form, previewData);
    if (result.valid) {
      setPreviewErrors({});
      setPreviewSubmitted(true);
    } else {
      const errs: Record<string, string> = {};
      for (const err of result.errors) {
        errs[err.field] = err.message;
      }
      setPreviewErrors(errs);
    }
  }

  const tabStyle = (tab: typeof activeTab): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#2563EB' : '#6B7280',
  });

  return (
    <div style={{ fontFamily: 'inherit', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          padding: '0 0.25rem',
        }}
      >
        <div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm((f) => ({ ...f, name: e.target.value }))}
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              border: 'none',
              borderBottom: '2px solid transparent',
              outline: 'none',
              color: '#111827',
              padding: '0.125rem 0.25rem',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = '#2563EB'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderBottomColor = 'transparent'; }}
          />
        </div>
        <button
          type="button"
          onClick={() => onSave?.(form)}
          disabled={isSaving}
          style={{
            padding: '0.5rem 1.25rem',
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
          {isSaving ? 'Saving…' : 'Save Form'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: '1rem' }}>
        <button type="button" style={tabStyle('build')} onClick={() => setActiveTab('build')}>Build</button>
        <button type="button" style={tabStyle('settings')} onClick={() => setActiveTab('settings')}>Settings</button>
        <button type="button" style={tabStyle('preview')} onClick={() => { setActiveTab('preview'); setPreviewSubmitted(false); setPreviewErrors({}); }}>Preview</button>
      </div>

      {/* Build tab */}
      {activeTab === 'build' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
          {/* Palette */}
          <div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Field Types
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {PALETTE_FIELDS.map((pf) => (
                <PaletteItem
                  key={pf.type}
                  {...pf}
                  onDragStart={handlePaletteDragStart}
                  onAdd={addField}
                />
              ))}
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
              Drag onto canvas or click to add.
            </p>
          </div>

          {/* Canvas */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
            style={{
              minHeight: '400px',
              padding: '1rem',
              border: '2px dashed #E5E7EB',
              borderRadius: '0.5rem',
              backgroundColor: '#FAFAFA',
            }}
          >
            {form.fields.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  Drag fields here or click them in the palette to build your form.
                </p>
              </div>
            ) : (
              form.fields.map((field, index) => (
                <FieldEditor
                  key={`${field.name}-${index}`}
                  field={field}
                  index={index}
                  total={form.fields.length}
                  onUpdate={updateField}
                  onRemove={removeField}
                  onMoveUp={(i) => moveField(i, 'up')}
                  onMoveDown={(i) => moveField(i, 'down')}
                  onDragStart={handleFieldDragStart}
                  onDrop={handleFieldDrop}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
              Success Message
            </label>
            <textarea
              value={form.settings.successMessage}
              onChange={(e) => updateForm((f) => ({ ...f, settings: { ...f.settings, successMessage: e.target.value } }))}
              rows={3}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
              Redirect URL (after submit)
            </label>
            <input
              type="url"
              value={form.settings.redirectUrl ?? ''}
              onChange={(e) => updateForm((f) => ({ ...f, settings: { ...f.settings, redirectUrl: e.target.value || undefined } }))}
              placeholder="https://example.com/thank-you"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.settings.storeSubmissions ?? true}
              onChange={(e) => updateForm((f) => ({ ...f, settings: { ...f.settings, storeSubmissions: e.target.checked } }))}
            />
            Store submissions in database
          </label>
        </div>
      )}

      {/* Preview tab */}
      {activeTab === 'preview' && (
        <div style={{ maxWidth: '640px' }}>
          {previewSubmitted ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F0FDF4', borderRadius: '0.5rem', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <p dangerouslySetInnerHTML={{ __html: form.settings.successMessage }} style={{ color: '#166534', margin: 0 }} />
              <button
                type="button"
                onClick={() => { setPreviewSubmitted(false); setPreviewData({}); }}
                style={{ marginTop: '1rem', padding: '0.375rem 1rem', border: '1px solid #16A34A', borderRadius: '0.375rem', background: 'none', color: '#16A34A', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Reset
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                {form.fields.filter((f) => !f.hidden).map((field) => {
                  const widthMap: Record<string, string> = { full: '100%', half: 'calc(50% - 0.5rem)', third: 'calc(33.33% - 0.5rem)', quarter: 'calc(25% - 0.5rem)' };
                  const fieldWidth = widthMap[field.width ?? 'full'] ?? '100%';

                  return (
                    <div key={field.name} style={{ width: fieldWidth }}>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>
                        {field.label}
                        {field.required && <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>}
                      </label>
                      {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'url' || field.type === 'date' || field.type === 'number') && (
                        <input
                          type={field.type === 'phone' ? 'tel' : field.type}
                          value={String(previewData[field.name] ?? field.defaultValue ?? '')}
                          onChange={(e) => setPreviewData((d) => ({ ...d, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={{ width: '100%', padding: '0.5rem', border: `1px solid ${previewErrors[field.name] ? '#EF4444' : '#D1D5DB'}`, borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }}
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          value={String(previewData[field.name] ?? field.defaultValue ?? '')}
                          onChange={(e) => setPreviewData((d) => ({ ...d, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          rows={4}
                          style={{ width: '100%', padding: '0.5rem', border: `1px solid ${previewErrors[field.name] ? '#EF4444' : '#D1D5DB'}`, borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      )}
                      {field.type === 'select' && (
                        <select
                          value={String(previewData[field.name] ?? '')}
                          onChange={(e) => setPreviewData((d) => ({ ...d, [field.name]: e.target.value }))}
                          style={{ width: '100%', padding: '0.5rem', border: `1px solid ${previewErrors[field.name] ? '#EF4444' : '#D1D5DB'}`, borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }}
                        >
                          <option value="">— Select —</option>
                          {(field.options ?? []).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'checkbox' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(previewData[field.name])}
                            onChange={(e) => setPreviewData((d) => ({ ...d, [field.name]: e.target.checked }))}
                          />
                          {field.placeholder ?? field.label}
                        </label>
                      )}
                      {field.type === 'radio' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {(field.options ?? []).map((opt) => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={field.name}
                                value={opt.value}
                                checked={previewData[field.name] === opt.value}
                                onChange={() => setPreviewData((d) => ({ ...d, [field.name]: opt.value }))}
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      )}
                      {previewErrors[field.name] && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#EF4444' }}>
                          {previewErrors[field.name]}
                        </p>
                      )}
                      {field.helpText && !previewErrors[field.name] && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>{field.helpText}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handlePreviewSubmit}
                style={{ padding: '0.625rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormBuilder;
