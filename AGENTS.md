# Agent Configuration

After any code change, complete ALL steps:

1. Linting & Formatting
- Run `bun run lint`
- Fix all issues (no warnings ignored)
- Run `bun run format` if available
- Verify with `bun run lint` again

2. Type Safety
- Run `bun run type-check` or `tsc --noEmit`
- Zero type errors allowed
- No `any` types without explicit justification
- No `@ts-ignore` without comments explaining why

3. Code Review Standards
- Remove all console.logs, debugger statements
- Remove commented-out code
- No TODOs in committed code (create issues instead)
- Descriptive variable/function names (no `data`, `temp`, `x`)

4. Security
- No hardcoded secrets, API keys, or credentials
- Validate all user inputs
- Sanitize data before database operations
- Check dependencies for known vulnerabilities

5. Documentation
- Update README if behavior changes
- Add JSDoc comments for complex functions
- Update API documentation if endpoints change

Architecture Rules
- Follow existing project patterns (don't introduce new styles)
- Keep functions under 50 lines
- Single responsibility principle
- DRY - don't repeat code

Never Do This
- Don't refactor unrelated code in the same commit
- Don't bypass error handling with empty catch blocks
- Don't commit broken code "to fix later"
- Don't remove functionality without confirmation

Task complete only when ALL items pass.
