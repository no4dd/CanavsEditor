# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lib` - Build library version
- `npm run lint` - Run ESLint
- `npm run type:check` - Run TypeScript type checking
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run all Cypress tests headlessly
- `npx cypress run --spec "cypress/e2e/path/to/test.cy.ts"` - Run a single test

## Code Style Guidelines
- IMPORTANT: Always follow the existing coding patterns and practices established throughout this codebase
- Use TypeScript with strict typing
- No semicolons (enforce with ESLint)
- Single quotes for strings
- ESNext syntax with modules
- Follow naming conventions: camelCase for variables/functions, PascalCase for classes
- Error handling: Appropriate error handling with typed catch blocks
- Imports: Group imports by type (core, external, internal)
- File structure: Match existing component organization and architecture