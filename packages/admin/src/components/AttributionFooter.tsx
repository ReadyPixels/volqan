/**
 * @file components/AttributionFooter.tsx
 * @description React Server Component — renders the Open Core Attribution
 * footer required by the Volqan Attribution License v1.0.
 *
 * The footer is rendered unless the installation holds a valid active
 * subscription confirmed by the Bazarix license API. On any API failure
 * or timeout, the footer is always shown (fail-safe default).
 *
 * Removing or hiding this footer without a valid license is a material
 * breach of the Open Core Attribution License v1.0.
 * See: https://volqan.link/legal/attribution-policy
 *
 * License API:  https://bazarix.link/api/v1/license
 * Project URL:  https://volqan.link
 * Project Name: Volqan
 */

// This is a React Server Component (Next.js 15 App Router).
// It must NOT include 'use client' — it runs only on the server.

import {
  checkLicenseStatus,
  PROJECT_URL,
  PROJECT_NAME,
  type LicenseStatus,
} from '@volqan/core';

// ---------------------------------------------------------------------------
// Attribution Footer (Server Component)
// ---------------------------------------------------------------------------

/**
 * AttributionFooter
 *
 * Async server component. Calls the Bazarix license API on render to determine
 * whether to display the "Powered by Volqan" attribution notice.
 *
 * Caching: the license check is cached server-side for 24 hours (in-memory)
 * with a 3-second network timeout. On API failure the footer is always shown.
 *
 * Place this component in the root admin layout:
 * ```tsx
 * // app/admin/layout.tsx
 * import { AttributionFooter } from '@/components/AttributionFooter';
 *
 * export default function AdminLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <main>{children}</main>
 *         <AttributionFooter />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export async function AttributionFooter(): Promise<React.ReactElement | null> {
  let license: LicenseStatus;

  try {
    license = await checkLicenseStatus();
  } catch {
    // Defensive fallback: if checkLicenseStatus itself throws unexpectedly,
    // always show the attribution footer.
    license = { attributionRemoved: false };
  }

  // Active subscription — attribution removal is permitted
  if (license.attributionRemoved) {
    return null;
  }

  // Attribution required — render the notice
  return (
    <footer
      className="attribution-footer"
      aria-label="Powered by Volqan"
      data-testid="attribution-footer"
    >
      <span>
        Powered by{' '}
        <a
          href={PROJECT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="attribution-footer__link"
        >
          {PROJECT_NAME}
        </a>
      </span>
    </footer>
  );
}

// Make it the default export so Next.js App Router can import it directly.
export default AttributionFooter;

// ---------------------------------------------------------------------------
// Optional: inline styles for environments without a global stylesheet
// ---------------------------------------------------------------------------

/**
 * AttributionFooterStyles
 *
 * Inject this string into a <style> tag in the document <head> if your layout
 * does not already include the Volqan admin CSS.
 *
 * The footer must remain visible, unobscured, and unaltered per the license.
 * Do not override these styles to hide or obscure the attribution notice.
 */
export const ATTRIBUTION_FOOTER_CSS = `
.attribution-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--volqan-color-text-muted, #6b7280);
  border-top: 1px solid var(--volqan-color-border, #e5e7eb);
  background-color: var(--volqan-color-surface, #ffffff);
  user-select: none;
}

.attribution-footer__link {
  color: var(--volqan-color-primary, #0ea5e9);
  text-decoration: none;
  font-weight: 500;
}

.attribution-footer__link:hover {
  text-decoration: underline;
}
`.trim();
