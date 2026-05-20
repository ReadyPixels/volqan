'use client';

/**
 * @file components/dashboard/ContentChart.tsx
 * @description Content created over time — pure SVG chart (no external libraries).
 * Shows last 30 days of content creation activity.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Mock data: last 30 days
// ---------------------------------------------------------------------------

// Deterministic pseudo-random seeded by day index — same values on every render.
function seededCount(seed: number, isWeekend: boolean): number {
  const base = isWeekend ? 1 : 5;
  const noise = ((seed * 1103515245 + 12345) & 0x7fffffff) % 8;
  return Math.max(0, base + noise - 1);
}

function generateData(days: number) {
  const data: Array<{ date: string; count: number }> = [];
  // Anchor to a fixed reference date (May 20 2026) so totals never change.
  const anchor = new Date('2026-05-20T00:00:00');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const count = seededCount(days - i, isWeekend);
    data.push({ date: label, count });
  }
  return data;
}

// ---------------------------------------------------------------------------
// SVG bar chart
// ---------------------------------------------------------------------------

const SVG_WIDTH = 700;
const SVG_HEIGHT = 160;
const PADDING = { top: 10, right: 10, bottom: 28, left: 30 };
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

export function ContentChart() {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [data, setData] = React.useState<Array<{ date: string; count: number }>>([]);

  React.useEffect(() => {
    setData(generateData(30));
  }, []);

  const DATA = data;
  const maxCount = DATA.length > 0 ? Math.max(...DATA.map((d) => d.count), 1) : 1;
  const barWidth = DATA.length > 0 ? CHART_WIDTH / DATA.length : 0;
  const barGap = barWidth * 0.25;

  const total = DATA.reduce((s, d) => s + d.count, 0);
  const avg = DATA.length > 0 ? Math.round(total / DATA.length) : 0;

  // X-axis labels: show every 5th
  const xLabels = DATA.filter((_, i) => i % 5 === 0 || i === DATA.length - 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Content Activity</CardTitle>
            <CardDescription>Entries created over the last 30 days</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{total}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">total entries · {avg}/day avg</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full"
            style={{ height: SVG_HEIGHT }}
          >
            {/* Y-axis gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = PADDING.top + CHART_HEIGHT - ratio * CHART_HEIGHT;
              const value = Math.round(ratio * maxCount);
              return (
                <g key={ratio}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={SVG_WIDTH - PADDING.right}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                    strokeDasharray={ratio === 0 ? '0' : '3,3'}
                  />
                  <text
                    x={PADDING.left - 4}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="8"
                    fill="hsl(var(--muted-foreground))"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {DATA.map((d, i) => {
              const barHeight = (d.count / maxCount) * CHART_HEIGHT;
              const x = PADDING.left + i * barWidth + barGap / 2;
              const y = PADDING.top + CHART_HEIGHT - barHeight;
              const w = barWidth - barGap;
              const isHovered = hovered === i;

              return (
                <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  {/* Hover area */}
                  <rect
                    x={PADDING.left + i * barWidth}
                    y={PADDING.top}
                    width={barWidth}
                    height={CHART_HEIGHT}
                    fill="transparent"
                  />
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y || PADDING.top + CHART_HEIGHT - 1}
                    width={Math.max(w, 2)}
                    height={Math.max(barHeight, 1)}
                    rx="2"
                    fill={isHovered ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.5)'}
                    className="transition-all duration-100"
                  />

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={Math.min(x - 12, SVG_WIDTH - PADDING.right - 60)}
                        y={y - 28}
                        width={60}
                        height={20}
                        rx="4"
                        fill="hsl(var(--foreground))"
                        opacity="0.9"
                      />
                      <text
                        x={Math.min(x + w / 2, SVG_WIDTH - PADDING.right - 30)}
                        y={y - 14}
                        textAnchor="middle"
                        fontSize="9"
                        fill="hsl(var(--background))"
                        fontWeight="600"
                      >
                        {d.date}: {d.count}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {xLabels.map((d) => {
              const i = DATA.indexOf(d);
              const x = PADDING.left + i * barWidth + barWidth / 2;
              const y = PADDING.top + CHART_HEIGHT + 16;
              return (
                <text key={i} x={x} y={y} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
                  {d.date}
                </text>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
