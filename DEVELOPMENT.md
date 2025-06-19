# Development Guide

This project uses several tools to maintain code quality and consistency.

## Code Quality Tools

### ESLint

- **Purpose**: Static code analysis and linting
- **Configuration**: `eslint.config.js`
- **Commands**:
  - `npm run lint` - Check for linting issues
  - `npm run lint:fix` - Fix auto-fixable issues

### Prettier

- **Purpose**: Code formatting
- **Configuration**: `.prettierrc`
- **Commands**:
  - `npm run format` - Format all files
  - `npm run format:check` - Check if files are formatted

### TypeScript

- **Purpose**: Type checking
- **Configuration**: `tsconfig.json`
- **Commands**:
  - `npm run type-check` - Check TypeScript types

## Git Hooks

### Pre-commit Hook

- **Purpose**: Automatically format and lint code before committing
- **What it does**:
  - Runs ESLint with auto-fix
  - Runs Prettier formatting
  - Only processes staged files

### Commit Message Hook

- **Purpose**: Enforce conventional commit message format
- **Configuration**: `commitlint.config.js`

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commits

### Examples

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve role code validation issue"
git commit -m "docs: update API documentation"
git commit -m "style: format code with prettier"
```

## VS Code Setup

The project includes VS Code settings (`.vscode/settings.json`) that:

- Enable format on save
- Use Prettier as the default formatter
- Run ESLint fixes on save
- Organize imports automatically

### Recommended Extensions

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Importer (`pmneo.tsimporter`)

## Workflow

1. **Before committing**:

   - Code is automatically formatted and linted via pre-commit hook
   - Commit message is validated via commit-msg hook

2. **Manual commands**:

   ```bash
   # Format all files
   npm run format

   # Check for linting issues
   npm run lint

   # Fix linting issues
   npm run lint:fix

   # Check TypeScript types
   npm run type-check
   ```

3. **Commit workflow**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # Pre-commit hook runs automatically
   # Commit-msg hook validates message format
   ```

## Troubleshooting

### If pre-commit hook fails:

1. Check the error message
2. Run `npm run lint:fix` to fix issues
3. Run `npm run format` to format code
4. Try committing again

### If commit message is rejected:

1. Follow the conventional commit format
2. Use one of the allowed types
3. Keep the subject line under 72 characters
4. Use lowercase for type and subject

### If VS Code formatting doesn't work:

1. Install the Prettier extension
2. Set Prettier as the default formatter
3. Enable format on save in settings
