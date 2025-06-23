# TDD Migration Plan

This document tracks the migration of the Digital Garden project to Test-Driven Development (TDD) practices as outlined in CLAUDE.md.

## Completed ✅

### 1. Testing Infrastructure
- Added testing commands to package.json:
  - `test:watch` - for continuous testing during development
  - `test:coverage` - to check coverage metrics
  - `test:ci` - for CI/CD pipeline
- Added TypeScript checking commands:
  - `typecheck` - validates TypeScript without emitting
  - `lint` and `lint:fix` - for code quality
  - `quality` - runs all checks together

### 2. TypeScript Strictness
- Updated tsconfig.json with all strict mode options:
  - `noImplicitAny`: true
  - `strictNullChecks`: true
  - `strictFunctionTypes`: true
  - `strictBindCallApply`: true
  - `strictPropertyInitialization`: true
  - `noImplicitThis`: true
  - `alwaysStrict`: true
  - `noUnusedLocals`: true
  - `noUnusedParameters`: true
  - `noImplicitReturns`: true

### 3. MSW Setup
- Installed Mock Service Worker (MSW) for API mocking
- Created mocks directory with:
  - `server.ts` - MSW server for tests
  - `browser.ts` - MSW worker for development
  - `handlers.ts` - Mock API handlers
- Integrated MSW with test setup

### 4. Test Utilities
- Created test-utils directory with:
  - `factories.ts` - Mock data factory functions following CLAUDE.md patterns
  - `test-utils.tsx` - Custom render with providers

### 5. Initial Behavior Tests
- Created behavior tests for GraphView component
- Created behavior tests for ContentView component
- Tests focus on user behavior, not implementation details

### 6. TypeScript Quality Improvements
- Started removing `any` types from codebase
- Fixed several files with proper typing

### 7. Jest Configuration
- Configured Jest for 100% coverage requirement
- Set up coverage collection and thresholds

## In Progress 🚧

### TypeScript Errors
Multiple TypeScript errors need to be fixed due to the new strict settings:
- Unused variables and parameters
- Type mismatches in test factories
- Missing exports for types

## TODO 📋

### 1. Fix All TypeScript Errors
- Run `npm run typecheck` and fix all reported errors
- Remove remaining `any` types
- Remove type assertions (`as` keyword)

### 2. Achieve 100% Test Coverage
- Write tests for all components
- Write tests for all hooks
- Write tests for all utility functions
- Focus on behavior, not implementation

### 3. Implement Functional Programming Patterns
- Convert to immutable data patterns
- Use pure functions
- Implement options objects pattern
- Remove nested conditionals

### 4. Code Quality Improvements
- Remove all comments from code
- Make code self-documenting
- Extract magic numbers to constants
- Improve naming conventions

### 5. Add Zod for Runtime Validation
- Install Zod
- Create schemas for all data types
- Derive TypeScript types from schemas
- Add runtime validation at boundaries

### 6. Development Workflow
- Add pre-commit hooks
- Set up GitHub Actions for CI/CD
- Implement conventional commits
- Document TDD workflow

### 7. Refactoring Existing Code
Following TDD principles:
1. Write tests for existing functionality
2. Refactor code while keeping tests green
3. Improve code structure and patterns

## Next Steps

1. **STOP all feature development** until TypeScript errors are fixed
2. Fix TypeScript errors to establish a clean baseline
3. Write tests for one component at a time
4. Refactor that component following TDD principles
5. Move to the next component

## Migration Strategy

### Phase 1: Foundation (Current)
- ✅ Set up testing infrastructure
- ✅ Configure TypeScript strict mode
- 🚧 Fix TypeScript errors
- Write initial tests

### Phase 2: Component Testing
- Test and refactor each component
- Start with leaf components (no dependencies)
- Work up to container components
- Achieve 100% behavior coverage

### Phase 3: Hook and Utility Testing
- Test all custom hooks
- Test all utility functions
- Refactor for functional programming

### Phase 4: Integration Testing
- Test component interactions
- Test routing behavior
- Test data flow

### Phase 5: Continuous Improvement
- Add pre-commit hooks
- Set up CI/CD
- Document patterns
- Train team on TDD

## Success Metrics

- 100% test coverage (behavior-based)
- 0 TypeScript errors
- 0 `any` types
- 0 type assertions
- All code follows functional patterns
- All tests follow behavior-driven approach

## Resources

- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)