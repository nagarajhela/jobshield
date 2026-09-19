# Security Policy

The JobShield team is dedicated to protecting our users and ensuring the integrity of our AI threat intelligence platform.

---

## 🛡️ Supported Versions

Only the latest release branch receives critical security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you identify a security vulnerability within JobShield, **please do not report it publicly via GitHub issues or discussions.**

Instead, report it confidentially via email:

- **Security Contact**: `[YOUR_EMAIL@example.com]`
- **Subject Line**: `[SECURITY] Vulnerability Report - JobShield`

### What to Include in Your Report:
1. **Description**: Overview of the vulnerability and its potential impact.
2. **Steps to Reproduce**: Minimal, step-by-step instructions or Proof of Concept (PoC).
3. **Affected Component**: Frontend, Spring Boot backend, JWT filter, Gemini API integration, or database.
4. **Suggested Mitigation**: (Optional) Recommended patches or workarounds.

---

## ⏱️ Response Timeline

- **Initial Acknowledgment**: Within **48 hours** of report receipt.
- **Triage & Assessment**: Within **5 business days** confirming vulnerability validity and severity.
- **Resolution & Release**: A fix will be developed, tested, and deployed to `main` as a patch release as soon as possible.
- **Public Disclosure**: Coordinated disclosure after the patch has been made publicly available.

---

## 🎯 Scope

### In-Scope:
- Authentication bypass or privilege escalation (e.g., JWT spoofing, role tampering).
- SQL Injection or database exposure vulnerabilities.
- API Key leakage or unsafe prompt injection attacks against the AI analyzer.
- Remote Code Execution (RCE) or arbitrary file uploads via the PDF parser.

### Out-of-Scope:
- Denial of Service (DoS/DDoS) attacks against public-facing demo servers.
- Social engineering against JobShield maintainers.
- Issues related to outdated browser or client software.

Thank you for helping keep JobShield secure for everyone!
