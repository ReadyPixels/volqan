/**
 * @file billing/fee-calculator.ts
 * @description Platform Service Fee calculator for all transactions processed
 * through Volqan and the Bazarix marketplace.
 *
 * Fee formula (from the Volqan Fee Disclosure policy):
 *   Platform Service Fee = $0.50 flat
 *                        + 10% of the base transaction amount
 *                        + $0.50 additional only when payment method is PayPal
 *
 * Labeling rules (per Terms of Service):
 *   - "Service Fee"        — for subscription billing (Support Plans)
 *   - "Marketplace Fee"    — for extension and theme purchases on Bazarix
 *   - "Administrative Fee" — for one-time setup charges
 *   - "Technology Fee"     — for API access tiers
 *
 * Never label this fee as "processing fee", "credit card fee", or "surcharge".
 *
 * Monthly pricing uplift formula:
 *   Monthly Price = (Yearly Price ÷ 12) × 1.25
 *
 * All monetary values are in United States cents (integer) unless otherwise noted.
 */
/**
 * Calculate the Platform Service Fee for a transaction.
 *
 * Formula:
 *   fee = $0.50 flat + 10% of baseCents + $0.50 if PayPal
 *
 * All values are in cents. The result is truncated (floor) to the nearest
 * whole cent to avoid fractional-cent billing issues.
 *
 * @param baseCents  - The base transaction amount in cents (e.g. 500 for $5.00).
 *                     Must be a non-negative integer.
 * @param isPayPal   - Whether the buyer is paying with PayPal.
 *                     When true, an additional $0.50 surcharge is applied.
 * @returns The Platform Service Fee in cents.
 *
 * @throws {RangeError} if baseCents is negative or not a finite number.
 *
 * @example
 * // $10.00 base, card payment
 * calculateServiceFee(1000, false); // → 150  ($1.50)
 *
 * @example
 * // $10.00 base, PayPal payment
 * calculateServiceFee(1000, true);  // → 200  ($2.00)
 *
 * @example
 * // $5.00 minimum listing price, card
 * calculateServiceFee(500, false);  // → 100  ($1.00)
 */
export declare function calculateServiceFee(baseCents: number, isPayPal: boolean): number;
/**
 * Calculate the monthly Support Plan price from the yearly price.
 *
 * Formula:
 *   monthlyPrice = (yearlyPrice ÷ 12) × 1.25
 *
 * The 25% uplift is non-negotiable per the Volqan pricing policy. It accounts
 * for higher churn risk, cash flow variance, and per-transaction processing
 * overhead on monthly billing cycles.
 *
 * The result is rounded to the nearest cent (Math.round) for display purposes.
 *
 * @param yearlyPrice - The annual subscription price in cents
 *                      (e.g. 4800 for $48.00/year).
 *                      Must be a non-negative integer.
 * @returns The monthly price in cents.
 *
 * @throws {RangeError} if yearlyPrice is negative or not a finite number.
 *
 * @example
 * // $48.00/year → monthly price
 * calculateMonthlyPrice(4800); // → 500  ($5.00)
 *
 * @example
 * // $120.00/year
 * calculateMonthlyPrice(12000); // → 1250 ($12.50)
 */
export declare function calculateMonthlyPrice(yearlyPrice: number): number;
/**
 * Calculate the total buyer-facing price for a marketplace listing.
 *
 * Total = listingPriceCents + calculateServiceFee(listingPriceCents, isPayPal)
 *
 * @param listingPriceCents - The seller's listed price in cents.
 * @param isPayPal          - Whether the buyer is paying with PayPal.
 * @returns The total amount the buyer will be charged, in cents.
 */
export declare function calculateBuyerTotal(listingPriceCents: number, isPayPal: boolean): number;
/**
 * Calculate the seller's payout for a marketplace transaction.
 *
 * Revenue split: 70% seller / 30% platform (of the listing price only).
 * The Platform Service Fee is kept entirely by the platform.
 *
 * @param listingPriceCents - The seller's listed price in cents.
 * @returns The amount transferred to the seller's Stripe Connect account, in cents.
 */
export declare function calculateSellerPayout(listingPriceCents: number): number;
/**
 * Calculate the platform's share from a marketplace transaction.
 *
 * Platform share = 30% of listing price + 100% of Platform Service Fee.
 *
 * @param listingPriceCents - The seller's listed price in cents.
 * @param isPayPal          - Whether the buyer paid with PayPal.
 * @returns The platform's total revenue from this transaction, in cents.
 */
export declare function calculatePlatformRevenue(listingPriceCents: number, isPayPal: boolean): number;
/** Minimum allowed listing price in cents ($5.00). */
export declare const MIN_LISTING_PRICE_CENTS = 500;
/** Maximum allowed listing price in cents ($999.00). */
export declare const MAX_LISTING_PRICE_CENTS = 99900;
/**
 * Validate that a listing price is within the allowed range.
 *
 * @param priceCents - The price to validate, in cents.
 * @returns true if valid, false otherwise.
 */
export declare function isValidListingPrice(priceCents: number): boolean;
/**
 * Format a cent amount as a USD dollar string (e.g. 1050 → "$10.50").
 *
 * @param cents - Amount in cents.
 * @returns Formatted dollar string.
 */
export declare function formatUsd(cents: number): string;
/**
 * A detailed breakdown of all fee components for a transaction.
 * Use this to build invoice line items and pre-checkout fee disclosures.
 */
export interface FeeBreakdown {
    /** The seller's listed price in cents. */
    listingPriceCents: number;
    /** The fixed $0.50 flat component of the Platform Service Fee. */
    flatFeeCents: number;
    /** The 10% variable component of the Platform Service Fee. */
    variableFeeCents: number;
    /** The $0.50 PayPal surcharge (0 if not PayPal). */
    paypalSurchargeCents: number;
    /** Total Platform Service Fee = flat + variable + paypal surcharge. */
    totalServiceFeeCents: number;
    /** Total buyer-facing charge = listing price + total service fee. */
    buyerTotalCents: number;
    /** Amount transferred to the seller (70% of listing price). */
    sellerPayoutCents: number;
    /** Platform's total revenue from this transaction. */
    platformRevenueCents: number;
    /** Whether this is a PayPal transaction. */
    isPayPal: boolean;
}
/**
 * Produce a full fee breakdown for a marketplace transaction.
 *
 * @param listingPriceCents - The seller's listed price in cents.
 * @param isPayPal          - Whether the buyer is paying with PayPal.
 * @returns A complete FeeBreakdown object.
 *
 * @example
 * // $10.00 listing, card payment
 * getDetailedFeeBreakdown(1000, false);
 * // {
 * //   listingPriceCents:      1000,
 * //   flatFeeCents:             50,
 * //   variableFeeCents:        100,
 * //   paypalSurchargeCents:      0,
 * //   totalServiceFeeCents:    150,
 * //   buyerTotalCents:        1150,
 * //   sellerPayoutCents:       700,
 * //   platformRevenueCents:    450,
 * //   isPayPal:              false,
 * // }
 */
export declare function getDetailedFeeBreakdown(listingPriceCents: number, isPayPal: boolean): FeeBreakdown;
//# sourceMappingURL=fee-calculator.d.ts.map