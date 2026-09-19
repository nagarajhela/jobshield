# Contributing to JobShield

First off, thank you for considering contributing to **JobShield**! 🎉 

Whether you're fixing a bug, adding new AI scam detection rules, or polishing the frontend UI, your contributions help make the job hunt safer for everyone.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Message Conventions](#commit-message-conventions)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Style Guidelines](#code-style-guidelines)

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment. Please treat all contributors with respect and professional courtesy.

---

## 💡 How Can I Contribute?

- **Reporting Bugs**: Open an issue describing the expected vs. actual behavior with reproduction steps and logs.
- **Suggesting Enhancements**: Open an issue tagged `enhancement` with the proposed feature or threat pattern.
- **Pull Requests**: Tackle open issues labeled `good first issue` or `help wanted`.

---

## 🛠️ Development Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/[YOUR-USERNAME]/JobShield.git
   cd JobShield
   ```
3. **Set Up Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/[ORIGINAL-OWNER]/JobShield.git
   ```

---

## 🌿 Branching Strategy

Always create a new branch from `main` with a clear, standardized naming prefix:

- `feat/feature-name` — for new features
- `fix/bug-description` — for bug fixes
- `refactor/scope` — for code restructuring
- `docs/topic` — for documentation updates
- `test/test-scope` — for adding missing tests

Example:
```bash
git checkout -b fix/phone-number-truncation
```

---

## 💬 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: A new feature (e.g., `feat(scanner): add telegram handle detector`)
- `fix`: A bug fix (e.g., `fix(auth): allow single-character last name`)
- `docs`: Documentation changes only
- `style`: Changes that do not affect code logic (formatting, semicolons)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Build tasks, package updates, dependencies

Example:
```bash
git commit -m "feat(ai): integrate gemini flash prompt for advance-fee detection"
```

---

## 🚀 Submitting a Pull Request

1. Ensure your code builds locally:
   - Backend: `cd jobshield-backend && ./mvnw clean test`
   - Frontend: `cd jobshield-frontend && npm run lint`
2. Push your branch to GitHub:
   ```bash
   git push origin fix/your-fix-name
   ```
3. Open a **Pull Request** against `main`.
4. Provide a descriptive title and fill out the PR template:
   - Summary of changes
   - Linked issue (e.g., `Closes #12`)
   - Manual verification steps & screenshots

---

## 📐 Code Style Guidelines

### Java (Spring Boot)
- Follow standard Java naming conventions (camelCase for variables/methods, PascalCase for classes).
- Use constructor injection over `@Autowired` field injection.
- Validate all incoming DTOs using Bean Validation (`@Valid`, `@NotBlank`, etc.).
- Avoid committing raw credentials or hardcoded API keys.

### JavaScript / React
- Write modern functional components using React hooks.
- Keep CSS modular and utilize predefined CSS variables for colors, radius, and shadows.
- Avoid inline styles where reusable CSS classes exist.
