# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.5.x   | Yes       |
| < 1.5.0 | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in Volqan, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

Instead, report via one of the following methods:

1. **Email**: Send details to the project maintainers at the contact address listed in the repository.
2. **GitHub Security Advisory**: Use the [GitHub Security Advisory](https://github.com/ReadyPixels/volqan/security/advisories/new) form to privately report the vulnerability.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce the issue
- The affected version(s)
- Any suggested fix or mitigation (optional)

We will acknowledge receipt within 48 hours and aim to provide a fix or mitigation within 14 days.

## Security Best Practices for Deployments

- Always set `SESSION_SECRET` to a cryptographically random value in production
- Always set `CRON_SECRET` to protect the cron endpoint
- Always set `REDIS_URL` for multi-instance rate limiting
- Use HTTPS in production (the `Secure` cookie flag is automatic when `NODE_ENV=production`)
- Keep dependencies up to date with `pnpm audit`
