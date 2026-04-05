/**
 * @file components/SEOPanel.tsx
 * @description SEO analysis panel for the Volqan SEO extension.
 *
 * Displays a live SEO score, actionable issues, and inline editors for
 * meta title, meta description, and OG image. Intended for embedding
 * inside the content edit page sidebar.
 */

import React, { useState, useCallback, type ChangeEvent } from 'react';
import { analyzeSEO, autoMetaDescription } from '../analyzer.js';
import type { SeoAnalysis, SeoIssue, SeoMeta, SeoContent } from '../analyzer.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SEOPanelProps {
  /** Current page/post content used for analysis. */
  content: SeoContent;
  /** Current SEO meta values. */
  meta: SeoMeta;
  /** Called whenever the user edits a SEO meta field. */
  onMetaChange: (meta: SeoMeta) => void;
  /** Whether the panel is collapsed by default. */
  defaultCollapsed?: boolean;
}

// ---------------------------------------------------------------------------
// Score ring component
// ---------------------------------------------------------------------------

interface ScoreRingProps {
  score: number;
  grade: SeoAnalysis['grade'];
}

function ScoreRing({ score, grade }: ScoreRingProps): JSX.Element {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    grade === 'green' ? '#10B981' : grade === 'orange' ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        {/* Track */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: '0.625rem', color: '#6B7280', marginTop: 2 }}>
          / 100
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Issue item
// ---------------------------------------------------------------------------

interface IssueItemProps {
  issue: SeoIssue;
}

function IssueItem({ issue }: IssueItemProps): JSX.Element {
  const iconMap: Record<SeoIssue['severity'], string> = {
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
  const colorMap: Record<SeoIssue['severity'], string> = {
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  };
  const bgMap: Record<SeoIssue['severity'], string> = {
    error: '#FEF2F2',
    warning: '#FFFBEB',
    info: '#EFF6FF',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.625rem',
        padding: '0.625rem',
        borderRadius: '0.375rem',
        backgroundColor: bgMap[issue.severity],
        marginBottom: '0.375rem',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: '1.25rem',
          height: '1.25rem',
          borderRadius: '50%',
          backgroundColor: colorMap[issue.severity],
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.625rem',
          fontWeight: 700,
        }}
      >
        {iconMap[issue.severity]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#111827', lineHeight: 1.4 }}>
          {issue.message}
        </p>
        {issue.recommended && (
          <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            Recommended: {issue.recommended}
            {issue.actual !== undefined ? ` (current: ${issue.actual})` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Char counter
// ---------------------------------------------------------------------------

interface CharCounterProps {
  current: number;
  min: number;
  max: number;
}

function CharCounter({ current, min, max }: CharCounterProps): JSX.Element {
  const isGood = current >= min && current <= max;
  const isTooLong = current > max;

  return (
    <span
      style={{
        fontSize: '0.75rem',
        color: isGood ? '#10B981' : isTooLong ? '#EF4444' : '#6B7280',
        marginLeft: '0.25rem',
      }}
    >
      {current}/{max}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SEOPanel
// ---------------------------------------------------------------------------

export function SEOPanel({
  content,
  meta,
  onMetaChange,
  defaultCollapsed = false,
}: SEOPanelProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [analysis, setAnalysis] = useState<SeoAnalysis>(() =>
    analyzeSEO(content, meta),
  );

  // Re-run analysis when content or meta changes.
  const runAnalysis = useCallback(
    (updatedMeta: SeoMeta) => {
      setAnalysis(analyzeSEO(content, updatedMeta));
    },
    [content],
  );

  function handleMetaField<K extends keyof SeoMeta>(
    field: K,
    value: SeoMeta[K],
  ): void {
    const updated: SeoMeta = { ...meta, [field]: value };
    onMetaChange(updated);
    runAnalysis(updated);
  }

  function handleAutoGenerateDescription(): void {
    const generated = autoMetaDescription(content.body ?? '');
    if (generated) {
      handleMetaField('metaDescription', generated);
    }
  }

  const gradeLabel: Record<SeoAnalysis['grade'], string> = {
    green: 'Good',
    orange: 'Needs work',
    red: 'Poor',
  };

  const gradeColor: Record<SeoAnalysis['grade'], string> = {
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
  };

  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        backgroundColor: '#fff',
        fontSize: '0.875rem',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: '#F9FAFB',
          border: 'none',
          borderBottom: collapsed ? 'none' : '1px solid #E5E7EB',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>🔍</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>SEO Analysis</span>
          <span
            style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: gradeColor[analysis.grade] + '20',
              color: gradeColor[analysis.grade],
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {gradeLabel[analysis.grade]}
          </span>
        </div>
        <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>
          {collapsed ? '▼' : '▲'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Score section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '0.375rem',
            }}
          >
            <ScoreRing score={analysis.score} grade={analysis.grade} />
            <div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: gradeColor[analysis.grade],
                  marginBottom: '0.25rem',
                }}
              >
                {gradeLabel[analysis.grade]} — {analysis.score}/100
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                {analysis.counts.errors} error{analysis.counts.errors !== 1 ? 's' : ''},
                {' '}{analysis.counts.warnings} warning{analysis.counts.warnings !== 1 ? 's' : ''},
                {' '}{analysis.counts.infos} tip{analysis.counts.infos !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Issues list */}
          {analysis.issues.length > 0 && (
            <div>
              <h4
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Issues
              </h4>
              {analysis.issues.map((issue) => (
                <IssueItem key={issue.code} issue={issue} />
              ))}
            </div>
          )}

          {/* Meta title editor */}
          <div>
            <label
              htmlFor="seo-meta-title"
              style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
            >
              Meta Title
              <CharCounter
                current={(meta.metaTitle ?? '').length}
                min={50}
                max={60}
              />
            </label>
            <input
              id="seo-meta-title"
              type="text"
              value={meta.metaTitle ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleMetaField('metaTitle', e.target.value)
              }
              placeholder="Page title for search engines…"
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
              Ideal length: 50–60 characters
            </p>
          </div>

          {/* Meta description editor */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.25rem',
              }}
            >
              <label
                htmlFor="seo-meta-desc"
                style={{ fontWeight: 500, color: '#374151' }}
              >
                Meta Description
                <CharCounter
                  current={(meta.metaDescription ?? '').length}
                  min={120}
                  max={160}
                />
              </label>
              {content.body && (
                <button
                  type="button"
                  onClick={handleAutoGenerateDescription}
                  style={{
                    fontSize: '0.75rem',
                    color: '#2563EB',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Auto-generate
                </button>
              )}
            </div>
            <textarea
              id="seo-meta-desc"
              value={meta.metaDescription ?? ''}
              onChange={(e) => handleMetaField('metaDescription', e.target.value)}
              placeholder="Compelling summary for search engine results…"
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
              Ideal length: 120–160 characters
            </p>
          </div>

          {/* OG image */}
          <div>
            <label
              htmlFor="seo-og-image"
              style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
            >
              Open Graph Image
            </label>
            <input
              id="seo-og-image"
              type="url"
              value={meta.ogImage ?? ''}
              onChange={(e) => handleMetaField('ogImage', e.target.value || undefined)}
              placeholder="https://example.com/og-image.jpg"
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
            {meta.ogImage && (
              <img
                src={meta.ogImage}
                alt="OG preview"
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  borderRadius: '0.25rem',
                  border: '1px solid #E5E7EB',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Canonical URL */}
          <div>
            <label
              htmlFor="seo-canonical"
              style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
            >
              Canonical URL
            </label>
            <input
              id="seo-canonical"
              type="url"
              value={meta.canonicalUrl ?? ''}
              onChange={(e) => handleMetaField('canonicalUrl', e.target.value || undefined)}
              placeholder="https://example.com/page (leave empty to auto-detect)"
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* noIndex toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="seo-noindex"
              type="checkbox"
              checked={meta.noIndex ?? false}
              onChange={(e) => handleMetaField('noIndex', e.target.checked)}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
            />
            <label
              htmlFor="seo-noindex"
              style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}
            >
              No-index (hide from search engines)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default SEOPanel;
