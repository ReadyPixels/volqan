/**
 * @file license/api.ts
 * @description Server-side License API handlers for https://bazarix.link/api/v1/license
 *
 * These handlers power the license check endpoint that the Volqan framework
 * calls to determine whether attribution removal is active for a given
 * installation.
 *
 * Endpoints:
 *   GET  /api/v1/license/check?installationId=<id>
 *   POST /api/v1/license/activate   { installationId, licenseKey }
 *   POST /api/v1/license/deactivate { installationId }
 *
 * Response shape:
 *   {
 *     valid: boolean,
 *     plan: string,
 *     expiresAt: string,          // ISO 8601
 *     attributionRemoved: boolean,
 *     features: string[]
 *   }
 */

import { SUPPORT_PLAN_FEATURES } from './api-constants.js';
import type { InstallationStore } from './installation.js';
import { validateInstallation } from './installation.js';

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

/**
 * Standard license check API response.
 */
export interface LicenseCheckResponse {
  /** Whether the license is valid and active. */
  valid: boolean;

  /** Active plan name (e.g. "support-yearly"). Empty string if no active plan. */
  plan: string;

  /** ISO 8601 timestamp when the license expires. Empty string for no expiry. */
  expiresAt: string;

  /** Whether the installation is permitted to hide the attribution footer. */
  attributionRemoved: boolean;

  /** List of features enabled by the active plan. */
  features: string[];
}

/**
 * Standard API error response.
 */
export interface LicenseApiError {
  error: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Subscription resolver interface
// ---------------------------------------------------------------------------

/**
 * Abstraction for resolving subscription state from the database.
 * Implement against your ORM.
 */
export interface LicenseSubscriptionResolver {
  /**
   * Get the active subscription linked to an installation.
   * Returns null if no active subscription is found.
   */
  getActiveSubscriptionForInstallation(
    installationId: string,
  ): Promise<{
    planId: string;
    status: string;
    currentPeriodEnd: Date;
    stripeSubscriptionId: string;
  } | null>;

  /**
   * Link an installation to a subscription by license key.
   * The license key is the Stripe subscription ID or a derived token.
   * Returns null if the license key is invalid.
   */
  linkByLicenseKey(
    installationId: string,
    licenseKey: string,
  ): Promise<{ subscriptionId: string } | null>;

  /**
   * Unlink an installation from its subscription.
   */
  unlink(installationId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// License check handler
// ---------------------------------------------------------------------------

/**
 * Handle a license check request for an installation.
 *
 * Called by the framework on each server start (and cached for 24h).
 * Determines whether attribution removal is currently active.
 *
 * @param installationId    - The installation's unique ID.
 * @param installationStore - Installation persistence layer.
 * @param resolver          - Subscription resolver.
 * @returns A LicenseCheckResponse.
 */
export async function handleLicenseCheck(
  installationId: string,
  installationStore: InstallationStore,
  resolver: LicenseSubscriptionResolver,
): Promise<LicenseCheckResponse> {
  // Validate the installation ID format
  if (!installationId || typeof installationId !== 'string') {
    return buildUnlicensedResponse();
  }

  // Validate installation existence
  const isValid = await validateInstallation(
    installationStore,
    installationId,
  );

  if (!isValid) {
    // Unknown installation — return unlicensed (not an error, just no license)
    return buildUnlicensedResponse();
  }

  // Get the active subscription
  const subscription =
    await resolver.getActiveSubscriptionForInstallation(installationId);

  if (!subscription) {
    return buildUnlicensedResponse();
  }

  // Check if the subscription is in a state that permits attribution removal
  const attributionRemoved = isAttributionAllowed(subscription.status);

  return {
    valid: true,
    plan: subscription.planId,
    expiresAt: subscription.currentPeriodEnd.toISOString(),
    attributionRemoved,
    features: attributionRemoved ? SUPPORT_PLAN_FEATURES : [],
  };
}

// ---------------------------------------------------------------------------
// License activate handler
// ---------------------------------------------------------------------------

/**
 * Handle a license activation request.
 *
 * Links an installation to a subscription using the provided license key.
 * The license key is the Stripe subscription ID (or a derived token the
 * owner copies from their Volqan admin billing page).
 *
 * @param installationId    - The installation's unique ID.
 * @param licenseKey        - The license key (Stripe subscription ID or token).
 * @param installationStore - Installation persistence layer.
 * @param resolver          - Subscription resolver.
 * @returns A LicenseCheckResponse with the activated license state.
 * @throws {Error} if the license key is invalid or already in use.
 */
export async function handleLicenseActivate(
  installationId: string,
  licenseKey: string,
  installationStore: InstallationStore,
  resolver: LicenseSubscriptionResolver,
): Promise<LicenseCheckResponse> {
  if (!installationId || !licenseKey) {
    throw new Error('installationId and licenseKey are required');
  }

  const result = await resolver.linkByLicenseKey(installationId, licenseKey);

  if (!result) {
    throw new Error(
      `Invalid license key "${licenseKey}". ` +
        'Ensure you are using the correct key from your Volqan admin billing page.',
    );
  }

  console.info(
    `[volqan/license] Installation ${installationId} activated with subscription ${result.subscriptionId}`,
  );

  // Return the updated license status
  return handleLicenseCheck(installationId, installationStore, resolver);
}

// ---------------------------------------------------------------------------
// License deactivate handler
// ---------------------------------------------------------------------------

/**
 * Handle a license deactivation request.
 *
 * Unlinks an installation from its subscription.
 * After deactivation, the installation will revert to showing the attribution
 * footer on the next license check.
 *
 * @param installationId    - The installation's unique ID.
 * @param installationStore - Installation persistence layer.
 * @param resolver          - Subscription resolver.
 * @returns The unlicensed response shape.
 */
export async function handleLicenseDeactivate(
  installationId: string,
  installationStore: InstallationStore,
  resolver: LicenseSubscriptionResolver,
): Promise<LicenseCheckResponse> {
  if (!installationId) {
    throw new Error('installationId is required');
  }

  await resolver.unlink(installationId);

  console.info(
    `[volqan/license] Installation ${installationId} deactivated`,
  );

  return buildUnlicensedResponse();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the response for an unlicensed installation.
 */
function buildUnlicensedResponse(): LicenseCheckResponse {
  return {
    valid: false,
    plan: '',
    expiresAt: '',
    attributionRemoved: false,
    features: [],
  };
}

/**
 * Determine if attribution removal is allowed based on subscription status.
 *
 * Attribution is permitted when the subscription is:
 *   - active
 *   - trialing
 *   - past_due (grace period — 7 days from payment failure)
 */
function isAttributionAllowed(status: string): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due';
}
