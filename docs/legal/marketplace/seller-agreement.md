⚠️ LEGAL REVIEW NEEDED

# Bazarix Marketplace — Seller Agreement

**Effective Date:** April 5, 2026
**Last Revised:** April 5, 2026
**Platform:** Bazarix — bazarix.link
**Operator:** ReadyPixels, sole proprietorship operated by Sharif ("ReadyPixels," "we," "us," or "Platform")
**Contact:** sharif@readypixels.com
**Governing Law:** State of Wyoming, United States of America

---

## 1. Definitions

1.1 **"Agreement"** means this Seller Agreement, together with all policies incorporated by reference, including the Acceptable Use Policy, Privacy Policy, and DMCA Policy published at bazarix.link.

1.2 **"Seller"** means any individual or legal entity that has registered and been approved to list and sell digital products through the Bazarix Marketplace.

1.3 **"Listing"** means any extension, theme, template, plugin, tool, or other digital product submitted by a Seller for sale on the Platform.

1.4 **"Buyer"** means any individual or legal entity that purchases a Listing through the Platform.

1.5 **"Platform Service Fee"** means the fee charged to Buyers on every transaction as described in Section 7 of this Agreement.

1.6 **"Listing Price"** means the price denominated in United States Dollars (USD) that the Seller sets for a Listing, subject to the minimum and maximum pricing rules in Section 9.

1.7 **"Net Proceeds"** means the Listing Price collected from a Buyer, excluding the Platform Service Fee.

1.8 **"Stripe Connect"** means the third-party payment processing service operated by Stripe, Inc., used by the Platform to facilitate payments and disbursements.

1.9 **"Extension SDK"** means the official Volqan Extension SDK (published under the `@volqan/extension-sdk` npm package) that defines the `FrameworkExtension` interface that all extensions must implement.

1.10 **"Theme SDK"** means the official Volqan Theme SDK (published under the `@volqan/theme-sdk` npm package) that defines the `FrameworkTheme` interface that all themes must implement.

1.11 **"Seller Tier"** means the classification assigned to a Seller based on sales history, ratings, and review status, as described in Section 5.

---

## 2. Eligibility and Registration

2.1 **Eligibility.** To register as a Seller, you must: (a) be at least eighteen (18) years of age or the age of majority in your jurisdiction; (b) have the legal authority to enter into binding contracts; (c) possess a valid Stripe Connect account capable of receiving international transfers; (d) not be located in a jurisdiction subject to applicable economic sanctions enforced by the United States Office of Foreign Assets Control (OFAC); and (e) not have previously been permanently banned from the Platform.

2.2 **Application Process.** Becoming a Seller requires submitting an application through the Seller registration portal at bazarix.link. Approval is at the sole discretion of ReadyPixels. The Platform may request additional verification documents, tax information, or identity verification at any time.

2.3 **Account Accuracy.** You represent and warrant that all registration information you provide is accurate, current, and complete. You agree to promptly update any information that changes. Providing false or misleading registration information is grounds for immediate account termination.

2.4 **Tax Obligations.** You are solely responsible for determining and fulfilling all tax obligations arising from your sales activity on the Platform, including income taxes, VAT, GST, sales taxes, and any other applicable levies in your jurisdiction. The Platform does not provide tax advice. Where required by applicable law, the Platform may collect and remit taxes on your behalf or request tax forms such as a W-9 (for US persons) or W-8BEN (for non-US persons) as a condition of payout.

2.5 **Stripe Connect Requirement.** You must connect a valid Stripe Connect account to your Seller profile before any Listing can be made publicly available. Payouts will not be processed to any account other than a verified Stripe Connect account.

---

## 3. Listing Submission and Approval

3.1 **Submission.** You may submit Listings for publication by completing the submission form in your Seller dashboard. Each submission must include all mandatory fields, as specified in the Quality Requirements in Section 4.

3.2 **Review Process.** Every first Listing from every Seller — regardless of Seller Tier — requires a full technical review conducted by the Platform before the Listing goes live. Subsequent Listings from Verified Sellers and above are reviewed using an expedited process. Pro Sellers receive priority queue placement. Partner Sellers receive the highest review priority.

3.3 **Review Outcome.** Following review, the Platform will notify you of one of three outcomes: (a) **Approved** — the Listing is made publicly available; (b) **Approved with Required Amendments** — the Listing will be published only after you make specified corrections; or (c) **Rejected** — the Listing does not meet quality requirements and may not be resubmitted without addressing all stated deficiencies.

3.4 **Resubmission.** A rejected Listing may be resubmitted after all deficiencies identified in the rejection notice have been fully addressed. Resubmitted Listings undergo the same review process as original submissions.

3.5 **No Guarantee of Approval.** Submission of a Listing does not guarantee approval. The Platform retains sole discretion to approve or reject any Listing for any reason, including business considerations that exceed the technical quality checklist.

3.6 **Updates and New Versions.** When you publish a new version of an approved Listing, the updated version must be submitted for review. The Platform reserves the right to require expedited or full re-review of any update, at its discretion. Previously approved versions remain publicly available until a new version is approved or until the Platform determines a version-pull is necessary for security or quality reasons.

---

## 4. Quality Requirements

4.1 **Mandatory Quality Checklist.** Every Listing submitted to the Platform must satisfy all of the following criteria before it may be approved:

- (a) **SDK Compliance.** Extensions must fully implement the `FrameworkExtension` interface defined in the official Extension SDK. Themes must fully implement the `FrameworkTheme` interface defined in the official Theme SDK. Partial implementations are not accepted.
- (b) **Automated Checks.** The Listing's source code must pass all automated TypeScript lint checks and TypeScript type-checking using the configuration specified in the Extension SDK documentation without errors or suppressed warnings.
- (c) **README Documentation.** The Listing must include a `README.md` file that contains: (i) a clear description of the Listing's functionality; (ii) step-by-step installation instructions; (iii) at least two (2) screenshots depicting the Listing in use within the framework admin panel; and (iv) a link to a working live demo or a video demonstration.
- (d) **No Obfuscated Code.** The Listing must not contain minified, obfuscated, or machine-transformed source code in any file that is not also accompanied by unobfuscated source that can be reviewed. Compiled output in `dist/` directories is acceptable when the corresponding uncompiled TypeScript source is included.
- (e) **No Undisclosed Network Calls.** Any external network requests made by the Listing must be fully disclosed in the README, including the destination URL, the purpose of the request, the data transmitted, and when the request is made. The Listing must not make any network calls not disclosed in its documentation.
- (f) **Framework Compatibility.** The Listing must be explicitly tested and confirmed compatible with the current stable release version of the Volqan framework at the time of submission.
- (g) **Accessibility.** Any user-interface components rendered in the admin panel must conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Conformance Level AA.
- (h) **Security.** The Listing must be free of known security vulnerabilities, including but not limited to SQL injection vulnerabilities, cross-site scripting (XSS) vulnerabilities, cross-site request forgery (CSRF) vulnerabilities, insecure data handling, and hardcoded credentials or API keys.
- (i) **Clear License.** The Listing must include a `LICENSE` file or clearly state in the README the license terms under which the purchased software is provided to Buyers.

4.2 **Ongoing Compliance.** Approval of a Listing at submission does not absolve the Seller of the obligation to maintain compliance with these quality requirements over time. If a previously approved Listing is found to be non-compliant — for example, due to breaking changes in a framework release, newly discovered security vulnerabilities, or discovered obfuscation — the Platform may issue a compliance notice requiring correction within thirty (30) days, or may remove the Listing from public availability pending correction.

4.3 **Platform Audit Rights.** The Platform reserves the right to conduct periodic technical audits of any approved Listing. Sellers must cooperate with any reasonable audit request and provide access to full source code upon request.

---

## 5. Seller Tiers

5.1 **Tier Overview.** Sellers are assigned to one of four tiers. Tier determines the number of active Listings a Seller may maintain simultaneously and the review priority afforded to new submissions.

| Tier | Eligibility | Active Listing Limit | Additional Benefits |
|------|-------------|----------------------|---------------------|
| New Seller | Application approved by Platform | 1 | Standard review queue |
| Verified Seller | 10+ total sales; 4.0 or higher average buyer rating | 5 | Featured listing eligibility |
| Pro Seller | 50+ total sales; 4.5 or higher average buyer rating | Unlimited | Fast-track review queue |
| Partner | Invitation by Platform owner only | Unlimited | Co-marketing, enhanced revenue share (see Section 6.2) |

5.2 **Tier Advancement.** Tier advancement to Verified and Pro is assessed automatically by the Platform system when threshold criteria are met based on verified sales and rating data. Advancement to the Partner tier is at the exclusive invitation of the Platform owner and is not achievable through automatic progression regardless of sales volume or rating.

5.3 **Tier Demotion.** The Platform reserves the right to demote a Seller's tier if: (a) sales and rating metrics fall below tier thresholds for a period exceeding ninety (90) consecutive days; (b) the Seller receives multiple sustained buyer complaints indicating a pattern of quality deterioration; or (c) the Seller is found to have engaged in rating manipulation, artificial sales inflation, or other fraudulent conduct.

5.4 **Tier Does Not Waive Review.** Seller Tier does not reduce or eliminate review requirements. All new Listings and all material updates to existing Listings require Platform review prior to publication, regardless of tier.

---

## 6. Revenue Split and Compensation

6.1 **Standard Revenue Split.** For all Sellers at the New Seller, Verified, and Pro Seller tiers, the Listing Price collected from a Buyer shall be distributed as follows:

- **Seller receives: 70% (seventy percent)** of the Listing Price.
- **Platform receives: 30% (thirty percent)** of the Listing Price.

The Platform Service Fee (Section 7) is collected separately from Buyers and is retained entirely by the Platform. The revenue split described in this Section 6.1 applies exclusively to the Listing Price.

6.2 **Partner Tier Revenue Split.** For Sellers at the Partner tier, the Listing Price collected from a Buyer shall be distributed as follows:

- **Seller receives: 65% (sixty-five percent)** of the Listing Price.
- **Platform receives: 35% (thirty-five percent)** of the Listing Price.

The increased platform share at the Partner tier reflects the co-marketing, promotional placement, and expanded business support services provided exclusively to Partner Sellers. Partner Sellers expressly acknowledge and accept this adjusted revenue split as a condition of entering the Partner tier.

6.3 **Disbursement Timing.** Payouts are processed on a monthly basis. All sales completed in a given calendar month will be aggregated and disbursed to the Seller's connected Stripe Connect account on or before the fifteenth (15th) day of the following calendar month, subject to the minimum payout threshold in Section 6.4.

6.4 **Minimum Payout Threshold.** A payout will only be processed if the Seller's accumulated unpaid balance meets or exceeds USD $20.00 (twenty United States Dollars). If the accumulated balance falls below the threshold at the time of the regular disbursement date, the balance will roll over to the following month and will be disbursed once the threshold is met.

6.5 **Chargebacks and Refunds.** In the event a Buyer initiates a chargeback or the Platform approves a refund under the Buyer Terms of Service, the corresponding seller share of that transaction will be deducted from the Seller's unpaid balance or, if insufficient, from future disbursements. The Platform will provide written notice of any deduction.

6.6 **Stripe Fees.** Standard Stripe processing fees applicable to payouts via Stripe Connect are the responsibility of the Seller and will be reflected in the net amount disbursed to the Seller's account. The Platform does not absorb Seller-side Stripe processing fees.

6.7 **Currency.** All amounts are denominated and settled in United States Dollars (USD). Currency conversion, if required, is handled through Stripe at their prevailing exchange rates, and any resulting conversion costs are the responsibility of the Seller.

6.8 **No Advance Payments.** The Platform does not provide advance payments, loans, or guarantees of future earnings to Sellers.

---

## 7. Platform Service Fee

7.1 **Fee Structure.** A Platform Service Fee is charged to the Buyer on every transaction. The fee is calculated as follows:

```
Platform Service Fee = $0.50 (flat fee)
                     + 10% of the Listing Price
                     + $0.50 additional surcharge (PayPal only)
```

The PayPal surcharge of $0.50 applies only when the Buyer selects PayPal as their payment method.

7.2 **Fee Justification.** A Platform Service Fee is applied to all transactions to cover secure global payment infrastructure, international disbursement logistics, currency conversion operations, and platform maintenance.

7.3 **Fee Is Buyer-Paid.** The Platform Service Fee is paid by the Buyer and is disclosed to the Buyer as a separate line item on the checkout page before payment confirmation. The Platform Service Fee does not reduce the Listing Price used to calculate the Seller's revenue share.

7.4 **Fee Retention.** The Platform retains one hundred percent (100%) of the Platform Service Fee collected on every transaction. The Platform Service Fee is not shared with Sellers under any tier.

7.5 **Fee Display.** The Platform will display the Platform Service Fee as "Platform Service Fee" in all checkout interfaces, email receipts, and Stripe invoices. The fee will never be labeled as a processing fee, credit card fee, surcharge, or any term other than "Platform Service Fee."

---

## 8. Intellectual Property

8.1 **Seller Retains Ownership.** All intellectual property rights in Listings submitted to the Platform remain exclusively with the Seller or the Seller's licensors. This Agreement does not transfer ownership of any intellectual property from the Seller to the Platform.

8.2 **License Grant to Platform.** By submitting a Listing, the Seller grants ReadyPixels a non-exclusive, worldwide, royalty-free license to: (a) display the Listing's name, description, screenshots, and promotional materials on the Platform for the purpose of marketing and selling the Listing; (b) deliver copies of the Listing to Buyers who have completed a purchase; (c) make copies of the Listing for backup, caching, and content delivery network purposes; and (d) use the Listing name and Seller name in press releases, marketing materials, and platform announcements describing the Platform's catalog.

8.3 **License Grant to Buyers.** Upon purchase, Buyers receive the license defined in the Buyer Terms of Service. Unless the Seller's Listing explicitly states a different license, the default license granted to Buyers is a single-installation, non-exclusive, non-transferable, non-sublicensable license for use with one (1) production instance of the Volqan framework.

8.4 **Seller Warranties Regarding IP.** You represent and warrant that: (a) you are the original author of the Listing or have obtained all rights necessary to distribute it; (b) the Listing does not infringe the copyright, patent, trademark, trade secret, or other intellectual property rights of any third party; (c) the Listing does not incorporate open-source components whose licenses are incompatible with the Listing's distribution terms; and (d) you have the full authority to grant the licenses described in Section 8.2.

8.5 **No Platform IP in Listings.** You may not submit Listings that incorporate, copy, or are substantially derived from: (a) any proprietary or closed-source code owned by ReadyPixels; (b) any extension, theme, or template previously sold through the Platform without the original seller's written consent; or (c) any third-party software in violation of that software's license.

8.6 **Feedback and Improvements.** Any feedback, bug reports, or suggestions you provide to the Platform regarding the Platform's own software, infrastructure, or services may be used by ReadyPixels without obligation, compensation, or attribution to you.

---

## 9. Pricing Rules

9.1 **Minimum Listing Price.** The minimum price for any Listing is **USD $5.00 (five United States Dollars)**.

9.2 **Maximum Listing Price.** The maximum price for any Listing is **USD $999.00 (nine hundred ninety-nine United States Dollars)**.

9.3 **Free Listings.** Free Listings (priced at $0.00) are not permitted through the paid Listing system. Sellers wishing to distribute free extensions or themes should do so through their own channels or through the open-source community. The Platform is exclusively a paid marketplace.

9.4 **Price Changes.** You may change the price of a Listing at any time. Price changes will apply to new purchases only and do not affect Buyers who have already purchased the Listing at a prior price.

9.5 **Promotions and Discounts.** Promotional pricing or limited-time discounts may be offered, subject to the minimum price floor in Section 9.1. The Platform may offer platform-wide promotional events; participation is optional for Sellers.

---

## 10. Prohibited Content and Conduct

10.1 Sellers must comply with the Bazarix Acceptable Use Policy, available at bazarix.link/legal/acceptable-use-policy, which is incorporated into this Agreement by reference.

10.2 Without limiting the Acceptable Use Policy, Sellers must not:

- (a) Submit Listings containing malware, ransomware, spyware, adware, backdoors, or any code designed to harm, exploit, surveil, or exfiltrate data from end-user systems.
- (b) Submit Listings containing obfuscated code that makes undisclosed network calls.
- (c) Submit Listings that infringe the intellectual property rights of any third party.
- (d) Artificially inflate sales counts or ratings through fake purchases, coordinated review campaigns, or any other deceptive practice.
- (e) List the same Listing under multiple accounts to circumvent tier limits.
- (f) Submit Listings that replicate core Volqan framework functionality for the purpose of enabling users to circumvent or remove the attribution license requirement.

---

## 11. Platform Rights to Remove Listings

11.1 **Discretionary Removal.** The Platform may, at its sole discretion, remove, suspend, or delist any Listing at any time, with or without notice to the Seller, for any of the following reasons:

- (a) The Listing violates this Agreement, the Acceptable Use Policy, or any other Platform policy.
- (b) The Listing is found to contain undisclosed security vulnerabilities.
- (c) The Listing is found to infringe the intellectual property rights of a third party.
- (d) The Platform receives a valid DMCA takedown notice relating to the Listing.
- (e) The Listing causes harm or threatens harm to Buyers, the Platform, or the Volqan framework ecosystem.
- (f) The Platform determines in its reasonable business judgment that the Listing's continued availability poses legal, reputational, or commercial risk to the Platform.

11.2 **Notice of Removal.** Where practicable and where doing so would not exacerbate the harm requiring removal, the Platform will provide the Seller with written notice of removal via the email address on the Seller's account, explaining the reason and — if applicable — the steps required to restore eligibility.

11.3 **Effect on Existing Buyers.** Removal of a Listing does not automatically revoke license keys already issued to Buyers who purchased the Listing prior to removal, unless the removal is due to the Listing being found to contain malware or to have been submitted in violation of IP rights, in which case the Platform reserves the right to notify affected Buyers and revoke access.

11.4 **No Liability for Removal.** The Platform shall not be liable to the Seller for any lost revenue, lost sales, or other damages arising from the removal of a Listing under this Section, provided the Platform acts in good faith.

---

## 12. Termination

12.1 **Termination by Seller.** You may terminate your Seller account at any time by submitting a written termination request to sharif@readypixels.com. Upon termination: (a) all of your active Listings will be delisted from the Platform within five (5) business days; (b) any pending unpaid balance meeting the minimum payout threshold (Section 6.4) will be disbursed to your Stripe Connect account in the next scheduled payout cycle; and (c) your access to the Seller dashboard will be revoked upon confirmation of termination.

12.2 **Termination by Platform for Cause.** The Platform may terminate your Seller account immediately and without prior notice in any of the following circumstances:

- (a) You commit a material breach of this Agreement that is not cured within fifteen (15) days of written notice, where the breach is capable of cure.
- (b) You commit a material breach of this Agreement that is incapable of cure, including submission of malware-containing Listings, submission of Listings infringing third-party IP rights, or fraud against Buyers.
- (c) You engage in conduct — whether on or off the Platform — that, in the Platform's reasonable judgment, causes or threatens to cause material harm to the Platform, its users, or its reputation.
- (d) You provide materially false information in your registration or Stripe Connect verification.
- (e) You violate applicable law in connection with your use of the Platform.

12.3 **Effect of Termination for Cause.** Upon termination for cause: (a) all active Listings will be immediately removed; (b) outstanding earnings may be withheld during a thirty (30) day review period to determine whether chargebacks, refunds, or other obligations will reduce the balance; (c) following the review period, any undisputed balance meeting the minimum payout threshold will be disbursed; and (d) the Seller will be barred from re-registering on the Platform.

12.4 **Termination by Platform Without Cause.** The Platform may terminate any Seller account without cause upon thirty (30) days' written notice. In such case, all Listings will be delisted at the end of the notice period and all earned, unpaid balances will be disbursed in the ordinary course.

12.5 **Survival.** The following sections survive termination of this Agreement: Section 8 (Intellectual Property), Section 13 (Representations and Warranties), Section 14 (Limitation of Liability), Section 15 (Indemnification), and Section 18 (General Provisions).

---

## 13. Representations and Warranties

13.1 **By Seller.** You represent and warrant, on a continuing basis throughout the term of this Agreement, that:

- (a) You have full legal authority to enter into this Agreement and to perform your obligations under it.
- (b) Each Listing you submit is your original work or you hold all rights required to distribute it.
- (c) Each Listing does not infringe the intellectual property rights of any third party.
- (d) Each Listing does not contain malware, backdoors, undisclosed surveillance code, or any functionality not described in its documentation.
- (e) Your account registration information is accurate and current.
- (f) You are in compliance with all applicable laws, including tax laws, in connection with your use of the Platform.
- (g) You have the right to grant the licenses described in Section 8.2.

13.2 **Disclaimer of Platform Warranties.** THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE." READYPIXELS MAKES NO WARRANTY, EXPRESS OR IMPLIED, REGARDING THE PLATFORM, INCLUDING ANY WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED OR ERROR-FREE OPERATION. READYPIXELS DOES NOT WARRANT THAT THE PLATFORM WILL GENERATE ANY PARTICULAR LEVEL OF REVENUE FOR THE SELLER.

---

## 14. Limitation of Liability

14.1 TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, READYPIXELS SHALL NOT BE LIABLE TO THE SELLER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF DATA, OR LOSS OF GOODWILL, ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE PLATFORM, EVEN IF READYPIXELS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

14.2 TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, READYPIXELS'S TOTAL CUMULATIVE LIABILITY TO THE SELLER ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID BY READYPIXELS TO THE SELLER IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM.

14.3 Some jurisdictions do not permit the exclusion or limitation of certain categories of damages. In such jurisdictions, the limitations in this Section shall apply to the fullest extent permitted by applicable law.

---

## 15. Indemnification

15.1 **By Seller.** You agree to indemnify, defend, and hold harmless ReadyPixels, its officers, directors, employees, contractors, and agents from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your breach of any representation, warranty, or obligation under this Agreement; (b) any claim that a Listing you submitted infringes the intellectual property rights of a third party; (c) any claim by a Buyer or third party arising from a defect, security vulnerability, or harmful code in a Listing you submitted; (d) your violation of any applicable law; or (e) your gross negligence or willful misconduct.

15.2 **Indemnification Procedure.** ReadyPixels will promptly notify you in writing of any indemnifiable claim. You will have the right to assume control of the defense of such claim, provided that ReadyPixels may participate at its own expense and that you may not settle any claim in a manner that imposes obligations on ReadyPixels without ReadyPixels's written consent.

---

## 16. Dispute Resolution

16.1 **Informal Resolution.** Before initiating any formal dispute proceeding, each party agrees to attempt to resolve any dispute arising out of this Agreement through good-faith negotiation. Either party may initiate informal resolution by sending written notice of the dispute to the other party. The parties shall have thirty (30) days from the date of such notice to attempt informal resolution.

16.2 **Binding Arbitration.** If informal resolution fails, any dispute, claim, or controversy arising out of or relating to this Agreement or the breach, termination, enforcement, interpretation, or validity thereof — including the determination of the scope or applicability of this agreement to arbitrate — shall be determined by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules, before a single arbitrator. The seat of arbitration shall be the State of Wyoming, United States. The language of arbitration shall be English.

16.3 **Class Action Waiver.** You agree that any dispute resolution proceeding will be conducted only on an individual basis and not as a class, consolidated, or representative action. You expressly waive any right to bring or participate in any class action claim or proceeding against ReadyPixels.

16.4 **Injunctive Relief.** Notwithstanding the arbitration requirement, either party may seek injunctive or other equitable relief in a court of competent jurisdiction to prevent actual or threatened infringement, misappropriation, or violation of intellectual property rights, confidential information, or other proprietary rights.

16.5 **Governing Law.** This Agreement is governed by and construed in accordance with the laws of the State of Wyoming, United States, without regard to its conflict-of-law principles. To the extent that any court action is permitted under this Agreement or is required to enforce an arbitration award, the parties consent to the exclusive jurisdiction of the state and federal courts located in Wyoming.

---

## 17. Modifications to Agreement

17.1 **Right to Modify.** ReadyPixels reserves the right to modify this Agreement at any time. When material changes are made, ReadyPixels will provide written notice to Sellers via the email address on file at least thirty (30) days prior to the effective date of the changes.

17.2 **Acceptance of Changes.** Continued use of the Platform after the effective date of any modification constitutes acceptance of the modified Agreement. If you do not accept the modification, you must terminate your Seller account before the effective date.

---

## 18. General Provisions

18.1 **Entire Agreement.** This Agreement, together with the Acceptable Use Policy, Privacy Policy, DMCA Policy, and Buyer Terms of Service (all published at bazarix.link/legal/), constitutes the entire agreement between the Seller and ReadyPixels with respect to the subject matter hereof and supersedes all prior or contemporaneous understandings, agreements, representations, or warranties.

18.2 **Severability.** If any provision of this Agreement is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect, and the invalid or unenforceable provision shall be modified to the minimum extent necessary to make it enforceable.

18.3 **Waiver.** No failure or delay by ReadyPixels in exercising any right or remedy under this Agreement shall constitute a waiver of that right or remedy.

18.4 **Assignment.** You may not assign or transfer your rights or obligations under this Agreement without the prior written consent of ReadyPixels. ReadyPixels may assign this Agreement without restriction in connection with a merger, acquisition, or sale of all or substantially all of its assets.

18.5 **Notices.** All legal notices required or permitted under this Agreement must be in writing and delivered to: (a) ReadyPixels at sharif@readypixels.com; (b) Seller at the email address on file in the Seller's account. Notices are deemed delivered upon confirmed email receipt.

18.6 **Independent Contractors.** The parties are independent contractors. Nothing in this Agreement creates an employment, partnership, joint venture, franchise, or agency relationship between ReadyPixels and any Seller.

18.7 **Force Majeure.** Neither party shall be liable for any delay or failure to perform its obligations under this Agreement (other than payment obligations) to the extent such delay or failure results from causes beyond that party's reasonable control, including natural disasters, government actions, strikes, pandemics, or internet infrastructure failures.

18.8 **Language.** This Agreement is written in English. Any translation of this Agreement is provided for convenience only. In the event of any inconsistency between the English version and any translation, the English version shall control.

---

*Bazarix Marketplace — Seller Agreement v1.0*
*Effective: April 5, 2026*
*Operator: ReadyPixels / sharif@readypixels.com*
*Domain: bazarix.link*
