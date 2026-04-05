'use client';

/**
 * @file components/page-builder/BlockSettings.tsx
 * @description Right panel settings editor for selected blocks.
 * Renders fields dynamically based on the block's schema.
 */

import * as React from 'react';
import type { Block, BlockField, BlockStyleProps } from '@/types/page-builder';
import { getBlockDefinition } from './blocks/index';
import { cn } from '@/lib/utils';
import { X, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

interface BlockSettingsProps {
  block: Block;
  onUpdate: (updated: Block) => void;
  onDelete: (blockId: string) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Field renderers
// ---------------------------------------------------------------------------

interface FieldInputProps {
  field: BlockField;
  value: unknown;
  onChange: (val: unknown) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const inputClass =
    'w-full border border-[hsl(var(--border))] rounded-md px-2.5 py-1.5 text-sm bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]';

  switch (field.type) {
    case 'text':
    case 'url':
    case 'image':
      return (
        <input
          type="text"
          className={inputClass}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'textarea':
    case 'richtext':
    case 'code':
      return (
        <textarea
          className={cn(inputClass, 'h-24 resize-y')}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className={inputClass}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === true || value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
          />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Enabled</span>
        </label>
      );

    case 'select':
      return (
        <select
          className={inputClass}
          value={String(value ?? field.defaultValue ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={String(value ?? '#000000')}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded border border-[hsl(var(--border))] cursor-pointer p-0.5"
          />
          <input
            type="text"
            className={cn(inputClass, 'flex-1')}
            value={String(value ?? '')}
            placeholder="#000000"
            onChange={(e) => onChange(e.target.value)}
          />
          {value ? (
            <button
              onClick={() => onChange('')}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      );

    default:
      return (
        <input
          type="text"
          className={inputClass}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function SettingsSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(var(--border))] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Style props editor
// ---------------------------------------------------------------------------

const STYLE_FIELDS: Array<{ key: keyof BlockStyleProps; label: string; type: 'text' | 'color' }> = [
  { key: 'paddingTop', label: 'Padding Top', type: 'text' },
  { key: 'paddingBottom', label: 'Padding Bottom', type: 'text' },
  { key: 'paddingLeft', label: 'Padding Left', type: 'text' },
  { key: 'paddingRight', label: 'Padding Right', type: 'text' },
  { key: 'marginTop', label: 'Margin Top', type: 'text' },
  { key: 'marginBottom', label: 'Margin Bottom', type: 'text' },
  { key: 'backgroundColor', label: 'Background Color', type: 'color' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'borderRadius', label: 'Border Radius', type: 'text' },
  { key: 'border', label: 'Border', type: 'text' },
];

// ---------------------------------------------------------------------------
// BlockSettings main component
// ---------------------------------------------------------------------------

export function BlockSettings({ block, onUpdate, onDelete, onClose }: BlockSettingsProps) {
  const definition = getBlockDefinition(block.type);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  function updateProp(key: string, value: unknown) {
    onUpdate({ ...block, props: { ...block.props, [key]: value } });
  }

  function updateStyle(key: keyof BlockStyleProps, value: string) {
    onUpdate({ ...block, style: { ...block.style, [key]: value } });
  }

  function updateAdvanced(key: string, value: unknown) {
    onUpdate({ ...block, advanced: { ...block.advanced, [key]: value } });
  }

  const contentFields = definition?.schema.fields.filter(
    (f: any) => !f.group || f.group === 'content',
  ) ?? [];
  const styleFieldsSchema = definition?.schema.fields.filter((f: any) => f.group === 'style') ?? [];
  const advancedFieldsSchema = definition?.schema.fields.filter((f: any) => f.group === 'advanced') ?? [];

  return (
    <aside className="flex flex-col h-full bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {definition?.label ?? block.type}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{block.id.slice(0, 8)}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable settings */}
      <div className="flex-1 overflow-y-auto">
        {/* Content fields */}
        {contentFields.length > 0 && (
          <SettingsSection title="Content" defaultOpen>
            {contentFields.map((field: any) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{field.description}</p>
                )}
                <FieldInput
                  field={field}
                  value={block.props[field.key]}
                  onChange={(v: any) => updateProp(field.key, v)}
                />
              </div>
            ))}
          </SettingsSection>
        )}

        {/* Style: schema fields + base style props */}
        <SettingsSection title="Style" defaultOpen={false}>
          {styleFieldsSchema.map((field: any) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">
                {field.label}
              </label>
              <FieldInput
                field={field}
                value={block.props[field.key] ?? block.style[field.key as keyof BlockStyleProps]}
                onChange={(v: any) => updateProp(field.key, v)}
              />
            </div>
          ))}
          {STYLE_FIELDS.map((sf: any) => (
            <div key={String(sf.key)}>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">
                {sf.label}
              </label>
              <FieldInput
                field={{ key: sf.key, label: sf.label, type: sf.type }}
                value={(block.style as any)[sf.key]}
                onChange={(v) => updateStyle(sf.key, String(v))}
              />
            </div>
          ))}
        </SettingsSection>

        {/* Advanced */}
        <SettingsSection title="Advanced" defaultOpen={false}>
          {advancedFieldsSchema.map((field: any) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">
                {field.label}
              </label>
              <FieldInput
                field={field}
                value={block.props[field.key]}
                onChange={(v: any) => updateProp(field.key, v)}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">HTML ID</label>
            <input
              type="text"
              className="w-full border border-[hsl(var(--border))] rounded-md px-2.5 py-1.5 text-sm bg-[hsl(var(--background))]"
              value={block.advanced?.id ?? ''}
              placeholder="element-id"
              onChange={(e) => updateAdvanced('id', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">CSS Classes</label>
            <input
              type="text"
              className="w-full border border-[hsl(var(--border))] rounded-md px-2.5 py-1.5 text-sm bg-[hsl(var(--background))]"
              value={block.advanced?.className ?? ''}
              placeholder="my-class another-class"
              onChange={(e) => updateAdvanced('className', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[hsl(var(--foreground))]">Visibility</label>
            {(
              [
                ['hideOnMobile', 'Hide on Mobile'],
                ['hideOnTablet', 'Hide on Tablet'],
                ['hideOnDesktop', 'Hide on Desktop'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(block.advanced?.[key])}
                  onChange={(e) => updateAdvanced(key, e.target.checked)}
                  className="w-4 h-4 rounded accent-[hsl(var(--primary))]"
                />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
              </label>
            ))}
          </div>
        </SettingsSection>
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        {confirmDelete ? (
          <div className="space-y-2">
            <p className="text-xs text-red-600 font-medium">Delete this block?</p>
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(block.id)}
                className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-[hsl(var(--border))] text-xs py-1.5 rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Block
          </button>
        )}
      </div>
    </aside>
  );
}
