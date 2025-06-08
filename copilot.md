# Fireux Monorepo Setup

## What We Did to Set Up

1. **Initialized the Monorepo**:

   - Created a `pnpm-workspace.yaml` file to define the workspace structure:
     ```yaml
     packages:
       - 'packages/*'
       - 'projects/*/*'
     ```

2. **Scaffolded Projects and Modules**:

   - Created the following structure:
     - `packages/fireux-core`: A Nuxt 3 module.
     - `projects/fireux/fireux-app`: A Nuxt 3 app.
     - `projects/misebox/misebox-app`: Another Nuxt 3 app.
   - Used `pnpm create nuxt` to scaffold the apps and module.

3. **Configured Shared Dev Dependencies**:

   - Added shared dev dependencies (e.g., `eslint`, `prettier`, `nuxt`, `typescript`) to the root `package.json`.
   - Installed dependencies using `pnpm install`.

4. **Set Up ESLint and Prettier**:

   - Created `.eslintrc.js` for linting rules.
   - Created `.prettierrc` for formatting rules.
   - Installed necessary plugins and configurations.

5. **Linked the Module**:

   - Updated `nuxt.config.ts` in both apps to include the `fireux-core` module:
     ```ts
     export default defineNuxtConfig({
       modules: ['../../../../packages/fireux-core'],
     })
     ```

6. **Removed Playground**:
   - Removed all references to `packages/fireux-core/my-module/playground` from the workspace.

## Memory Notes

### General Setup

- **Monorepo Tool**: Using `pnpm` for efficient dependency management.
- **Structure**: Apps are under `projects/`, and shared modules are under `packages/`.
- **Shared Configurations**: ESLint and Prettier are configured at the root for consistency.

### Key Commands

- **Install Dependencies**: `pnpm install` (run from the root).
- **Run Apps**:
  - `pnpm --filter misebox-app dev`
  - `pnpm --filter fireux-app dev`

### Patterns and References

- **Module Linking**: Use relative paths in `nuxt.config.ts` to include local modules.
- **Dev Dependencies**: Keep shared dependencies in the root `package.json` to avoid duplication.

### Troubleshooting

- **Module Not Found**: Ensure the path in `nuxt.config.ts` is correct and the module is included in `pnpm-workspace.yaml`.
- **ESLint/Prettier Issues**: Run `pnpm eslint .` or `pnpm prettier --write .` to debug and fix issues.

### Future Enhancements

- **Testing**: Set up Vitest for unit and integration tests.
- **Auto-Imports**: Configure auto-imports for composables and components.
- **CI/CD**: Add workflows for linting, testing, and building.

### Activitusbar Configuration

- **Views Initialization**: Ensure the activitusbar views are initialized as part of the system setup: eg
  ```json
  {
    "activitusbar.views": [
      {
        "name": "task.Run Playground Dev Server",
        "codicon": "play",
        "tooltip": "Run Playground Dev Server"
      },
      {
        "name": "task.Run Fireux App Dev Server",
        "codicon": "play-circle",
        "tooltip": "Run Fireux App Dev Server"
      },
      {
        "name": "task.Run Misebox App Dev Server",
        "codicon": "symbol-misc",
        "tooltip": "Run Misebox App Dev Server"
      }
    ],
    "activitusbar.alignment": "Right",
    "activitusbar.priority": -99999
  }
  ```

This document will evolve as we continue development. Let me know if you need to add or update anything!

# FireUX Copilot Documentation

## Runtime Configuration

To access runtime configuration in your Nuxt application, use the following import:

```typescript
import { useRuntimeConfig } from 'nuxt/app'
```

This replaces the older `#app` import and ensures compatibility with the latest Nuxt conventions.

## Stack Change Monitoring

To ensure the stack remains consistent and changes are intentional, consider the following:

1. **Version Control**:

   - Use Git to track changes in the stack.
   - Regularly commit your changes and review the `git diff` output.

2. **Automated Checks**:

   - Set up a CI/CD pipeline to validate the stack.
   - Use tools like `pnpm audit` to check for dependency changes.

3. **Manual Review**:

   - Periodically review the `pnpm-lock.yaml` file for unexpected changes.
   - Compare the current stack with the expected structure in this document.

4. **Warnings**:
   - If you notice unexpected changes, investigate immediately.
   - Use `git log` and `git blame` to identify the source of changes.

This document will evolve as we continue development. Let me know if you need to add or update anything!

## Design Tokens

### Shadows

- `--shadow-none`: none
- `--shadow-sm`: var(--shadow-sm)
- `--shadow-md`: var(--shadow-md)
- `--shadow-lg`: var(--shadow-lg)
- `--shadow-xl`: var(--shadow-xl)
- `--shadow-2xl`: var(--shadow-2xl)

### Opacity

- `--opacity-0`: 0
- `--opacity-25`: 0.25
- `--opacity-50`: 0.5
- `--opacity-75`: 0.75
- `--opacity-100`: 1

### Border Radius

- `--radius-xs`: var(--radius-xs)
- `--radius-sm`: var(--radius-sm)
- `--radius-md`: var(--radius-md)
- `--radius-lg`: var(--radius-lg)
- `--radius-xl`: var(--radius-xl)
- `--radius-2xl`: var(--radius-2xl)
- `--radius-3xl`: var(--radius-3xl)
- `--radius-4xl`: var(--radius-4xl)

### Spacing

- `--space-0`: var(--space-0)
- `--space-1`: var(--space-1)
- `--space-2`: var(--space-2)
- `--space-3`: var(--space-3)
- `--space-4`: var(--space-4)
- `--space-5`: var(--space-5)
- `--space-6`: var(--space-6)
- `--space-7`: var(--space-7)
- `--space-8`: var(--space-8)
- `--space-9`: var(--space-9)
- `--space-10`: var(--space-10)
- `--space-12`: var(--space-12)
- `--space-16`: var(--space-16)
- `--space-20`: var(--space-20)

### Font Weights

- `--font-weight-thin`: 100
- `--font-weight-extralight`: 200
- `--font-weight-light`: 300
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700
- `--font-weight-extrabold`: 800
- `--font-weight-black`: 900

### Brand Colors

- `--ui-primary`
- `--ui-secondary`

### Status Colors

- `--ui-info`
- `--ui-success`
- `--ui-warning`
- `--ui-error`

### UI Colors

- `--ui-bg`
- `--ui-bg-muted`
- `--ui-bg-elevated`
- `--ui-border`
- `--ui-border-muted`
- `--ui-border-accented`

# FireUX System Overview

## Introduction

FireUX is a monorepo-based system designed to provide a modular and scalable architecture for building web applications. It consists of multiple packages and projects, including `fireux-core`, `fireux-app`, and `misebox-app`. This document serves as a comprehensive guide to understanding the system, its components, and how they work together.

---

## Monorepo Structure

The monorepo is organized into the following key directories:

### `packages/`

- **`fireux-core/`**: The core package containing reusable composables, components, and utilities for FireUX-based applications.
  - **`src/`**: Source code for the core package, including composables, models, and runtime utilities.
  - **`dist/`**: The output directory for the built package, containing compiled JavaScript and type declaration files.

### `projects/`

- **`fireux/fireux-app/`**: A Nuxt-based application that consumes `fireux-core`.
- **`misebox/misebox-app/`**: Another Nuxt-based application that also consumes `fireux-core`.

### `playground/`

- A testing ground for experimenting with `fireux-core` features and integrations.

---

## Key Components

### 1. **`fireux-core`**

This package provides the foundational building blocks for FireUX applications. It includes:

#### Composables

- **Firebase Integration**: Utilities for interacting with Firebase services, such as Firestore and Storage.
- **State Management**: Composables for managing application state, such as `useProductCreate` and `useAppUser`.

#### Components

- Reusable Vue components for common UI patterns, such as headers, side menus, and forms.

#### Utilities

- Helper functions and constants for tasks like routing and configuration management.

#### Build Process

- The `fireux-core` package is built using TypeScript. The build script generates both JavaScript and type declaration files in the `dist/` directory.

### 2. **`fireux-app` and `misebox-app`**

These are Nuxt-based applications that consume `fireux-core`. They are configured to:

- Use `fireux-core` as a local dependency via an alias in `nuxt.config.ts`.
- Integrate Firebase services using the `nuxt-vuefire` module.

---

## Development Workflow

### Setting Up the Monorepo

1. Clone the repository.
2. Install dependencies using `pnpm install`.
3. Link local packages using `pnpm link`.

### Building `fireux-core`

1. Navigate to the `fireux-core` directory:
   ```bash
   cd packages/fireux-core
   ```
2. Run the build script:
   ```bash
   pnpm build
   ```
3. Verify that the `dist/` directory contains the expected files.

### Running Applications

1. Start the development server for `fireux-app`:
   ```bash
   pnpm dev:fireux
   ```
2. Start the development server for `misebox-app`:
   ```bash
   pnpm dev:misebox
   ```

---

## Common Issues and Resolutions

### 1. **Module Resolution Errors**

- Ensure that `fireux-core` is built and the `dist/` directory exists.
- Verify the alias configuration in `nuxt.config.ts`.

### 2. **Firebase Client-Side Errors**

- Firebase operations must be executed on the client side. Ensure that Firebase-related code is wrapped in `onMounted` or similar client-side lifecycle hooks.

### 3. **TypeScript Errors**

- Check for missing type declarations or incorrect imports.
- Run `pnpm build` in `fireux-core` to regenerate type declaration files.

---

## Future Improvements

- **Error Handling**: Improve error messages and logging for better debugging.
- **Documentation**: Expand this document with more examples and use cases.
- **Testing**: Add unit and integration tests for `fireux-core` and consuming applications.

---

## Conclusion

FireUX is a powerful and flexible system for building modern web applications. By following the guidelines in this document, you can effectively develop, debug, and extend the system. If you encounter any issues, refer to the "Common Issues and Resolutions" section or explore the source code for more insights.

# FireUX Project Guidelines

## File Editing Guidelines

1. **Filepath and Module Name Comments**:

   - When editing a file, ensure the top of the file includes a comment with the filepath and the app/module name.
   - Example:
     ```javascript
     // filepath: /path/to/file
     // module: FireUX Core
     ```

2. **Incremental Updates**:

   - Do not update all files at once. Add the comments only when editing a file to maintain focus and avoid unnecessary changes.

3. **Consistency**:
   - Ensure all new files follow this convention.

## General Notes

- This guideline helps maintain clarity and organization in the project, especially in a large workspace.
- Use this as a reference for all future edits.
