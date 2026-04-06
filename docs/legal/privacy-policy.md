⚠️ LEGAL REVIEW NEEDED

# Privacy Policy

**Volqan Framework**
**Effective Date:** April 5, 2026
**Last Updated:** April 5, 2026

**Data Controller:** Sharif / ReadyPixels
**Contact:** sharif@readypixels.com
**Project URL:** https://volqan.link

---

## 1. Introduction and Scope

ReadyPixels ("Company," "we," "us," or "our"), operator of the Volqan framework (https://volqan.link) and the Bazarix marketplace (https://bazarix.link), is committed to protecting the privacy of individuals who use our Platform. This Privacy Policy explains how we collect, use, disclose, retain, and protect personal information in connection with your use of:

- The Volqan framework and all `@volqan/*` npm packages;
- The Bazarix marketplace and its associated services;
- The Volqan documentation site hosted at https://volqan.link;
- The License API at https://bazarix.link/api/v1/license;
- Any other services operated by ReadyPixels (collectively, the "Platform").

This Privacy Policy is incorporated into and forms part of our Terms of Service. By using the Platform, you agree to the collection and use of information in accordance with this Privacy Policy.

---

## 2. Data Controller and Contact

The entity responsible for the processing of your personal data under this Privacy Policy is:

**ReadyPixels / Sharif**
**Email:** sharif@readypixels.com
**Data Subject Requests:** sharif@readypixels.com (Subject line: "Privacy Request")

For questions, concerns, or requests related to this Privacy Policy or your personal data, please contact us at the email address above.

---

## 3. Information We Collect

We collect information in the following categories:

### 3.1 Account and Identity Information

When you create an account on the Platform, we collect:

- **Email address** — used for account authentication, transactional communications, support, and marketing (with consent);
- **Name** — provided at registration, used for account identification and communications;
- **Username** — chosen at registration, used as a public identifier on the Marketplace.

### 3.2 Installation and License Data

When you install and operate the Volqan framework:

- **Installation ID** — a unique identifier generated automatically upon installation of the Software. This identifier is pseudonymous and is used to associate your installation with your license status, validate Support Plan subscriptions via the License API, and perform telemetry. The Installation ID is stored locally in your deployment and transmitted to the License API only during license validation checks.
- **License Key** — if you have purchased extensions or themes from the Marketplace, the associated license key in the format `MKT-[PRODUCT_ID]-[INSTALL_ID]-[EXPIRY_HASH]` is stored and transmitted to the License API for validation.
- **Framework version** — the version of Volqan installed, used for compatibility validation and analytics.

### 3.3 Payment and Billing Information

When you make a purchase or subscribe to a Support Plan:

- **Stripe Customer ID** — a unique identifier assigned to you by our payment processor, Stripe, Inc. We store this identifier to associate your account with your Stripe records, manage subscriptions, and process refunds. We do **not** store your full credit card number, CVV, or bank account details — all payment card information is transmitted directly to and stored by Stripe.
- **Transaction history** — records of your purchases and subscription payments, including amounts, dates, and Platform Service Fees paid;
- **Billing address** — if provided at checkout, used for tax and invoicing purposes.

### 3.4 Usage Analytics

We collect pseudonymous analytics data to improve the Platform:

- **Framework telemetry** — aggregated, non-personally identifiable data about feature usage patterns, extension activations, error rates, and performance metrics. Telemetry is tied to the Installation ID and is not linked to your email or identity without your separate consent;
- **Website analytics** — standard web server logs, page views, referral sources, browser type, operating system, and general geographic location (country/region level). We do not use invasive cross-site tracking or behavioral advertising technologies;
- **API usage** — request timestamps, endpoints accessed, and response codes for the License API, used for security monitoring and capacity planning.

### 3.5 Marketplace Seller Information

If you apply to become a seller on the Bazarix Marketplace, we additionally collect:

- **Stripe Connect account information** — required to facilitate seller payouts via Stripe Connect;
- **Identity verification data** — collected and processed by Stripe as required by Stripe's KYC and AML obligations. ReadyPixels does not directly store government-issued identity documents;
- **Seller profile information** — your display name, bio, website URL, and portfolio materials you choose to publish on the Marketplace.

### 3.6 Support and Communications

When you contact us for support:

- **Support correspondence** — including emails, messages, and any attachments you provide;
- **Diagnostic information** — logs, configuration data, or error reports you voluntarily share to facilitate troubleshooting.

### 3.7 Automatically Collected Technical Data

- **Log data** — IP addresses, access times, browser user agents, referring URLs, and pages visited, retained in server logs;
- **Cookies and local storage** — session cookies for authentication and preference storage. We do not use third-party advertising cookies.

---

## 4. How We Use Your Information

We process your personal data for the following purposes and under the following legal bases:

| Purpose | Categories of Data | Legal Basis (GDPR) |
|---|---|---|
| Account creation and authentication | Email, name, username | Performance of contract |
| License validation and Attribution Notice control | Installation ID, Stripe Customer ID, License Key | Performance of contract, Legitimate interests |
| Processing payments and subscriptions | Stripe Customer ID, transaction history, billing address | Performance of contract |
| Delivering purchased products and services | Email, Installation ID, License Key | Performance of contract |
| Sending transactional emails (receipts, renewal notices) | Email | Performance of contract |
| Responding to support requests | Email, support correspondence | Legitimate interests |
| Platform analytics and product improvement | Installation ID, usage analytics, log data | Legitimate interests |
| Security monitoring and fraud prevention | IP addresses, log data, API usage | Legitimate interests, Legal obligation |
| Compliance with legal obligations | All applicable categories | Legal obligation |
| Sending marketing communications (with consent) | Email | Consent |

---

## 5. Sharing and Disclosure of Information

We do **not sell** your personal information. We do not share your personal data with third parties for their independent marketing or advertising purposes. We disclose personal data only in the following limited circumstances:

### 5.1 Service Providers

We share personal data with third-party service providers who process data on our behalf and under our instructions:

| Provider | Purpose | Data Shared |
|---|---|---|
| **Stripe, Inc.** | Payment processing, subscription management, Stripe Connect payouts | Email, Stripe Customer ID, transaction data |
| **Supabase** | Database hosting (Marketplace) | Account data, transaction records |
| **Vercel** | Platform hosting and deployment | Web server logs, request data |
| **Cloudflare** | Content delivery, R2 file storage | Files, request data |
| **Algolia** | Marketplace search indexing | Listing metadata, search queries |
| **Resend** | Transactional email delivery | Email address, email content |

All service providers are contractually required to process data only as instructed by us and to maintain appropriate security standards.

### 5.2 Legal Requirements

We may disclose personal data when required to do so by law, subpoena, court order, or governmental authority, or when we reasonably believe disclosure is necessary to protect the rights, property, or safety of ReadyPixels, our users, or the public.

### 5.3 Business Transfers

In the event of a merger, acquisition, asset sale, or other business transfer involving ReadyPixels, personal data may be transferred as part of the transaction. We will notify you before your personal data is transferred and becomes subject to a different privacy policy.

### 5.4 Protection of Rights

We may disclose personal data to enforce our Terms of Service, investigate potential violations, and protect against fraud, including disclosure of information about individuals who have removed the Attribution Notice without a valid Support Plan.

---

## 6. Data Retention

We retain personal data for the following periods:

| Category | Retention Period |
|---|---|
| Account data (email, name, username) | Duration of account + 3 years after account deletion |
| Installation ID and license records | Duration of active license + 3 years |
| Stripe Customer ID and transaction records | 7 years from transaction date (tax and legal compliance) |
| Payment receipts and invoices | 7 years (tax compliance under applicable law) |
| Support correspondence | 3 years from last communication |
| Web server logs | 90 days |
| License API logs | 180 days |
| Usage analytics (pseudonymous) | 2 years, then aggregated or deleted |
| Marketing consent records | Duration of consent + 5 years |

After applicable retention periods expire, personal data is securely deleted or irreversibly anonymized. We may retain data for longer periods where required by applicable law or where necessary to resolve disputes or enforce agreements.

---

## 7. Your Privacy Rights

### 7.1 Rights Under GDPR (European Economic Area, United Kingdom, Switzerland)

If you are located in the European Economic Area, the United Kingdom, or Switzerland, you have the following rights under the General Data Protection Regulation ("GDPR") and applicable national implementing legislation:

- **Right of Access (Art. 15 GDPR):** You may request a copy of the personal data we hold about you.
- **Right to Rectification (Art. 16 GDPR):** You may request correction of inaccurate or incomplete personal data.
- **Right to Erasure (Art. 17 GDPR):** You may request deletion of your personal data where it is no longer necessary for the purposes for which it was collected, where you have withdrawn consent (if processing was based on consent), or where processing is otherwise unlawful. Note that certain data may be retained to comply with legal obligations.
- **Right to Restriction of Processing (Art. 18 GDPR):** You may request that we restrict processing of your personal data in certain circumstances.
- **Right to Data Portability (Art. 20 GDPR):** Where processing is based on consent or contract and carried out by automated means, you may request receipt of your personal data in a structured, commonly used, machine-readable format.
- **Right to Object (Art. 21 GDPR):** You may object to processing of your personal data based on legitimate interests. We will cease such processing unless we demonstrate compelling legitimate grounds.
- **Right to Withdraw Consent:** Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of processing prior to withdrawal.
- **Right to Lodge a Complaint:** You have the right to lodge a complaint with your local data protection supervisory authority.

### 7.2 Rights Under CCPA/CPRA (California Residents)

If you are a California resident, the California Consumer Privacy Act ("CCPA") as amended by the California Privacy Rights Act ("CPRA") grants you the following rights:

- **Right to Know:** You have the right to know what personal information we collect, use, disclose, or sell (we do not sell personal information).
- **Right to Delete:** You have the right to request deletion of personal information we have collected from you, subject to certain exceptions.
- **Right to Correct:** You have the right to request correction of inaccurate personal information.
- **Right to Opt-Out of Sale/Sharing:** We do not sell or share personal information for cross-context behavioral advertising. No opt-out mechanism is required, but you may contact us to confirm our practices.
- **Right to Non-Discrimination:** We will not discriminate against you for exercising any of your CCPA rights.
- **Shine the Light:** California Civil Code § 1798.83 permits California residents to request information about disclosure of personal information to third parties for their direct marketing purposes. We do not disclose personal information for such purposes.

**Categories of personal information collected (CCPA categories):**
- Identifiers (email, username, IP address, Installation ID)
- Commercial information (purchase history, subscription records)
- Internet or other electronic network activity information (usage analytics, log data)
- Inferences drawn from the above (license status, subscription tier)

### 7.3 How to Submit a Privacy Request

To exercise any of the rights described in this Section 7, please submit a request by:

- **Email:** sharif@readypixels.com (Subject line: "Privacy Request — [Right Requested]")

We will respond to verified requests within:
- **GDPR:** 30 days of receipt (extendable by a further 60 days where necessary, with notice)
- **CCPA:** 45 days of receipt (extendable by a further 45 days where necessary, with notice)

We may require you to verify your identity before processing your request. We will not charge a fee for reasonable requests but may charge a reasonable fee or decline to act on requests that are manifestly unfounded or excessive.

---

## 8. No Sale of Personal Data

**ReadyPixels does not sell, rent, trade, or otherwise transfer your personal information to third parties for monetary or other consideration.** We do not share your personal data with advertisers, data brokers, or any entity for the purpose of profiling, targeted advertising, or commercial exploitation of your information.

---

## 9. Data Security

We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, and destruction, including:

- Encryption of data in transit using TLS 1.2 or higher;
- Encryption of sensitive data at rest;
- Access controls limiting data access to authorized personnel with a need to know;
- Regular security assessments and vulnerability monitoring;
- Incident response procedures for detecting and responding to data breaches.

No method of transmission over the Internet or method of electronic storage is 100% secure. While we use commercially reasonable measures to protect your data, we cannot guarantee absolute security.

---

## 10. Data Breach Notification

In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will:

- **GDPR:** Notify the relevant supervisory authority within 72 hours of becoming aware of the breach, and notify affected data subjects without undue delay where the breach is likely to result in high risk to their rights and freedoms;
- **CCPA/US law:** Notify affected California residents of a breach of their unencrypted personal information in accordance with California Civil Code § 1798.82 and applicable breach notification laws.

---

## 11. International Data Transfers

ReadyPixels is operated from the United States. If you are accessing the Platform from outside the United States, your personal data may be transferred to, stored in, and processed in the United States, where data protection laws may differ from those in your jurisdiction.

For transfers of personal data from the European Economic Area, United Kingdom, or Switzerland to the United States, we rely on applicable transfer mechanisms, which may include Standard Contractual Clauses approved by the European Commission, where required. We contractually require our service providers to maintain appropriate safeguards for international data transfers.

---

## 12. Children's Privacy

The Platform is not directed to individuals under the age of sixteen (16). We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16 without verified parental consent, we will take steps to delete such information. If you believe we have inadvertently collected information from a minor, please contact us at sharif@readypixels.com.

---

## 13. Cookies and Tracking Technologies

We use the following types of cookies and similar technologies:

| Type | Purpose | Retention |
|---|---|---|
| Strictly Necessary Cookies | Session management, authentication state, CSRF protection | Session duration |
| Preference Cookies | Language and display preferences | 1 year |
| Analytics Cookies (first-party) | Understanding usage patterns for product improvement | 2 years |

We do not use third-party advertising cookies, cross-site tracking pixels, or behavioral advertising technologies. You may disable cookies through your browser settings, though this may impair the functionality of the Platform.

---

## 14. Links to Third-Party Services

The Platform may contain links to third-party websites, services, or resources. This Privacy Policy does not apply to those third-party services. We encourage you to review the privacy policies of any third-party services you access through the Platform.

---

## 15. Changes to This Privacy Policy

We reserve the right to modify this Privacy Policy at any time. We will notify you of material changes by posting the updated policy on the Platform and, where required by law, by sending notice to your registered email address. The "Last Updated" date at the top of this policy reflects the date of the most recent revision. Your continued use of the Platform following the effective date of the revised policy constitutes acceptance of the changes.

---

## 16. Contact Information

For all privacy-related inquiries, requests, or complaints, please contact:

**ReadyPixels / Sharif**
**Email:** sharif@readypixels.com
**Subject Line:** Privacy Request
**Project URL:** https://volqan.link

We will endeavor to respond to all legitimate privacy inquiries within the timeframes specified in Section 7.3.

---

*This Privacy Policy is effective as of April 5, 2026.*
*Governing Law: Wyoming, USA*
*© 2026 ReadyPixels / Sharif. All rights reserved.*
