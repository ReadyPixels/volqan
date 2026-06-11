# Volqan Security Hardening Loop

## Summary
Continue the repository-wide security audit as an iterative loop:
1. validate the currently identified security findings,
2. fix the reportable issues that remain,
3. update `docs/Tasks.md` with confirmed security work items,
4. re-audit the affected code paths and adjacent variants,
5. repeat until the codebase no longer yields new actionable security findings for the current scope.

Assumption: the current `docs/Tasks.md` is the canonical task tracker for security remediation and should remain the single place where confirmed follow-up work is accumulated.

## Key Changes / Execution Plan
- Validate the remaining open security items with `Codex Security:validation`, focusing first on the highest-risk paths already identified:
  - session/cookie authentication and middleware gating
  - media upload and file-serving behavior
  - API-key creation, ownership, and scope handling
  - media read/delete ownership checks
  - CSRF and cookie-flag hardening
- Fix validated findings with `Codex Security:fix-finding`, keeping changes narrow and behavior-preserving:
  - enforce the security invariant at the correct boundary
  - add the smallest regression test or reproduction harness available
  - preserve legitimate behavior while closing the exploit path
- Re-run a targeted code audit on adjacent call sites after each fix:
  - search for sibling routes, helper wrappers, and alternate entrypoints that could bypass the new control
  - check the corresponding `docs/Tasks.md` entry is either completed or kept open with accurate wording
- Keep the task list synchronized:
  - move fixed items into the completed section
  - add newly confirmed security work items only when evidence supports them
  - avoid speculative items unless they are explicitly framed as audit follow-ups
- End only when the final audit pass yields no new reportable security issues or taskable gaps for the current project scope.

## Test / Validation Plan
- For each fixed issue, run the narrowest meaningful validation:
  - targeted unit or route tests if available
  - direct reproduction against the affected code path where feasible
  - focused static trace when runtime proof is blocked by setup
- After the patch set is complete, run a final verification pass:
  - targeted typecheck or package-level checks for touched areas
  - a second security review of the modified files and nearby sibling routes
  - a final review of `docs/Tasks.md` for accuracy and consistency

## Assumptions
- `docs/Tasks.md` remains the authoritative task backlog for confirmed security work.
- The project’s security review should prioritize actionable, user-reachable issues over speculative hardening.
- Because the workspace already contains multiple known repo-wide type/config issues, validation should stay focused on the affected security paths rather than depending on a full clean build.
