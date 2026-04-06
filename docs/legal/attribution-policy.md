⚠️ LEGAL REVIEW NEEDED

# Attribution Policy

**Volqan Framework — Open Core Attribution License v1.0**
**Effective Date:** April 5, 2026
**Last Updated:** April 5, 2026

**Owner and Operator:** Sharif / ReadyPixels
**Contact:** sharif@readypixels.com
**Project URL:** https://volqan.link
**License API:** https://bazarix.link/api/v1/license

---

## 1. Purpose and Legal Basis

This Attribution Policy governs the attribution requirements applicable to all deployments of the Volqan framework ("Software"), operated under the **Open Core Attribution License v1.0** ("OCAL"). This policy applies to every person, company, organization, or other legal entity ("Licensee," "you," or "your") that installs, deploys, modifies, or distributes any version of the Software.

Attribution is not merely a courtesy or convention — it is a **legally binding condition** of the license under which the Software is made available. Failure to comply with this policy constitutes a material breach of the OCAL and the Volqan Terms of Service, exposing the violating party to legal liability under applicable copyright and contract law.

This policy should be read in conjunction with the OCAL (see `LICENSE-ATTRIBUTION.md` in the repository root), the Terms of Service, and the Refund Policy.

---

## 2. What Constitutes Valid Attribution

### 2.1 Required Attribution Text

All deployments of the Software must display the following notice in a form that is **visible, legible, unobscured, and accessible to end users**:

> **"Powered by Volqan — https://volqan.link"**

This is the complete and exact required attribution text. Abbreviations, paraphrases, alternative phrasing, or truncated versions of this notice do not satisfy the attribution requirement. The notice must be:

- Displayed in plain, readable text or as a hyperlink;
- Rendered in a typeface and color that is legible against the background;
- Not hidden behind interactive elements (e.g., collapsed menus, tooltips, or layers requiring user action to reveal);
- Not placed in HTML source code, comments, metadata, or other locations inaccessible to ordinary end users without technical inspection.

### 2.2 Acceptable Placement Locations

The Attribution Notice may be displayed in any of the following locations, provided the display requirements in Section 2.1 are satisfied:

- The footer of the administrative panel of any application powered by the Software;
- The footer of a public-facing website or application powered by the Software;
- A prominent "About" or "Powered By" page accessible from the main navigation of the application;
- A visible notice on the login or authentication screen.

The Licensee may choose the placement location that best suits their application's design, provided the notice remains reasonably visible to users of the application in ordinary course of use.

### 2.3 Acceptable Presentation Formats

The Attribution Notice may be presented as:

- **Plain text:** The literal string `Powered by Volqan — https://volqan.link`
- **Hyperlink:** The text "Powered by Volqan" linking to https://volqan.link (with the URL remaining accessible and functional)
- **Styled text:** Text rendered in the application's design system, provided it meets the legibility requirements of Section 2.1

The Attribution Notice may appear alongside other attribution notices (e.g., other open-source libraries or frameworks used in the application).

### 2.4 Invalid Attribution — Examples of Non-Compliance

The following presentations do NOT constitute valid attribution and are violations of the OCAL:

- Displaying the text in a font size smaller than 8px or in a color indistinguishable from the background;
- Removing the URL from the notice (displaying "Powered by Volqan" without the link);
- Replacing "Volqan" with an alternative name, including a forked project name, without written permission;
- Placing the notice only in application source code, package.json, or repository documentation visible only to developers;
- Displaying the notice only in development/staging environments while omitting it from production deployments;
- Using CSS, JavaScript, or any other technical means to render the notice invisible, transparent, or zero-width.

---

## 3. How to Verify License Status

### 3.1 Automatic License Verification

The Volqan framework automatically verifies license status on each server boot and periodically during operation. The framework queries the License API at:

```
GET https://bazarix.link/api/v1/license/check
Headers: X-Install-ID: [your-installation-id]
```

**Response:**
```json
{
  "valid": true,
  "productId": "string",
  "installationId": "string",
  "plan": "yearly" | "monthly",
  "expiresAt": "ISO 8601 datetime | null",
  "features": ["attribution_removal", ...]
}
```

If `features` includes `"attribution_removal"` and the subscription is active (`valid: true` and `expiresAt` is in the future), the Attribution Notice is automatically suppressed by the framework's `AttributionFooter` component.

License check results are cached for 24 hours. If the API is unavailable, the framework defaults to displaying the Attribution Notice (fail-safe default).

### 3.2 Manual License Verification

You may verify your license status at any time by:

1. Navigating to your Volqan admin panel;
2. Accessing **Settings > License**;
3. Viewing your Installation ID and current license status;
4. Using the "Check License Now" action to force an immediate license validation.

### 3.3 Verifying Your Installation ID

Your Installation ID is a unique identifier generated at installation time. It is:

- Displayed in **Settings > License** in the admin panel;
- Stored in your deployment's environment or database;
- Required when contacting support or submitting license-related requests.

Your Installation ID is in the format: `[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}` (UUID v4 format).

### 3.4 Third-Party Verification

ReadyPixels may verify attribution compliance on publicly accessible deployments of the Software through automated or manual inspection. ReadyPixels does not collect personal data in the course of such compliance monitoring beyond what is described in the Privacy Policy.

---

## 4. How to Purchase Attribution Removal

### 4.1 Attribution Removal Through Support Plans

The right to suppress the Attribution Notice is available **exclusively** to installations holding an active Support Plan subscription. Attribution removal is a benefit of the Support Plan and is not available for separate purchase.

To purchase a Support Plan and enable attribution removal:

1. Navigate to https://volqan.link/pricing;
2. Select either the **Yearly Support Plan** or **Monthly Support Plan**;
3. Complete the checkout process. A Platform Service Fee applies (see the Fee Disclosure Policy);
4. Upon successful payment, your Stripe Customer ID is linked to your Installation ID;
5. The License API is updated within minutes of payment confirmation;
6. Your Volqan installation will suppress the Attribution Notice on its next license check (within 24 hours, or at next server restart).

### 4.2 Plan Options

| Plan | Billing | Attribution Removal |
|---|---|---|
| Support Plan — Yearly | Billed annually | Yes — active for full subscription term |
| Support Plan — Monthly | Billed monthly | Yes — active for current billing period |

Attribution removal remains active only for the duration of an active, paid subscription. Cancellation, expiration, lapse in payment, or refund of the subscription immediately reinstates the Attribution Notice requirement.

### 4.3 Multiple Installations

Each Support Plan subscription covers attribution removal for a **single Installation ID**. If you operate multiple deployments of the Software (e.g., staging and production environments, or multiple client sites), each deployment's Installation ID must be covered by its own active Support Plan, or you must obtain written permission from ReadyPixels for multi-installation coverage under a single subscription.

If you require coverage for multiple installations, please contact sharif@readypixels.com to discuss enterprise or bulk licensing arrangements.

### 4.4 Effect of Non-Payment

If a recurring Support Plan payment fails:

(a) ReadyPixels will notify you at your registered email address;

(b) A payment grace period of up to seven (7) days may be extended, during which the Attribution Notice may remain suppressed;

(c) If payment is not received within the grace period, attribution removal is revoked and the Attribution Notice is restored;

(d) Successful payment during or after the grace period restores attribution removal entitlement immediately.

---

## 5. Legal Consequences of Unauthorized Attribution Removal

### 5.1 Material Breach of License

Removal, suppression, concealment, modification, or obstruction of the Attribution Notice by any installation that does not hold an active Support Plan subscription is a **material breach of the Open Core Attribution License v1.0** and the Terms of Service. The OCAL is a copyright license; breach of a copyright license constitutes copyright infringement.

### 5.2 Automatic License Termination

Upon breach of the attribution requirement:

(a) **The OCAL license granted to the violating party terminates automatically and without notice;**

(b) All rights to use, copy, modify, merge, publish, distribute, sublicense, or deploy the Software immediately cease;

(c) The violating party becomes liable for use of the Software as an unlicensed infringer.

### 5.3 Copyright Infringement Liability

Unauthorized removal of the Attribution Notice constitutes copyright infringement under the United States Copyright Act (17 U.S.C. § 101 et seq.) and applicable international copyright law. ReadyPixels may pursue all available legal remedies, which may include:

- **Injunctive relief:** A court order requiring the immediate restoration of the Attribution Notice and cessation of infringing use;
- **Statutory damages:** Under 17 U.S.C. § 504(c), statutory damages of up to $30,000 per work infringed (or up to $150,000 for willful infringement) may be awarded by a court, in addition to or in lieu of actual damages;
- **Actual damages and disgorgement of profits:** Recovery of ReadyPixels' actual damages and any profits attributable to the infringement;
- **Attorneys' fees and costs:** Recovery of legal fees under 17 U.S.C. § 505 where ReadyPixels is the prevailing party.

### 5.4 Contractual Damages

In addition to copyright remedies, unauthorized attribution removal constitutes a breach of the Terms of Service, for which ReadyPixels may seek:

- Liquidated damages in an amount not less than the value of the Support Plan subscription(s) that would have been required to authorize the removal for the relevant period;
- Any consequential or special damages arising from the breach, to the extent not disclaimed by applicable law.

### 5.5 Remediation Process

ReadyPixels encourages good-faith compliance. If you have inadvertently removed or failed to display the Attribution Notice:

1. Immediately restore the required notice (`"Powered by Volqan — https://volqan.link"`) to all affected deployments;

2. Contact ReadyPixels at sharif@readypixels.com to notify us of the violation and its remediation;

3. If the violation was inadvertent and promptly remediated, ReadyPixels, at its sole discretion, may choose not to pursue further legal action. No waiver of ReadyPixels' rights is implied by a decision not to pursue legal action in any particular instance.

### 5.6 Reporting Violations

If you are aware of a deployment of the Software that is removing the Attribution Notice without a valid Support Plan, you may report it to ReadyPixels at sharif@readypixels.com (Subject: "Attribution Violation Report"). ReadyPixels will investigate all credible reports.

---

## 6. Attribution in Forks and Derivative Works

If you fork the Volqan repository and create a derivative work:

(a) You must retain all existing copyright notices and the LICENSE-ATTRIBUTION.md file in your fork;

(b) If you deploy your fork publicly, the Attribution Notice requirement applies to your deployment;

(c) If you rename the product in your fork, the required notice must still reference the original: e.g., "Powered by [Your Fork Name], based on Volqan — https://volqan.link";

(d) You may not remove, modify, or obscure the original copyright notice of ReadyPixels / Sharif;

(e) Commercial redistribution of a fork of the core Software requires prior written permission from ReadyPixels.

---

## 7. Attribution in Themes and Extensions

Themes and extensions built for the Volqan framework using the Extension SDK or Theme SDK:

(a) Are **not** themselves subject to the Attribution Notice requirement described in this policy — only deployments of the core Software are;

(b) Must not include code that suppresses, removes, overrides, or interferes with the Attribution Notice in the host application unless the host application holds a valid Support Plan;

(c) Must not represent to end users that use of the extension eliminates the attribution requirement.

Any extension or theme found to include functionality that circumvents the attribution requirement will be removed from the Bazarix Marketplace immediately and the seller's account will be subject to termination.

---

## 8. Contact and Compliance Inquiries

For questions about attribution compliance, license verification, or to report a violation:

**ReadyPixels / Sharif**
**Email:** sharif@readypixels.com
**Subject Line:** Attribution — [Compliance / Inquiry / Violation Report]
**License API:** https://bazarix.link/api/v1/license
**Support Plans:** https://volqan.link/pricing

---

*This Attribution Policy is effective as of April 5, 2026.*
*Governing Law: Wyoming, USA*
*© 2026 ReadyPixels / Sharif. All rights reserved.*
