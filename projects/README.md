# Human Developer Setup Guide for FireUX Projects

## Overview

This document provides a step-by-step guide for human developers to set up and contribute to FireUX projects.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **pnpm**: Install using `npm install -g pnpm`.
- **Firebase Account**: For authentication and database integration.
- **Stripe Account**: For payment processing.

## General Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd fireux
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` and fill in the required values.

4. Start the development server for the desired project:
   - FireUX App:
     ```bash
     pnpm dev:fireux
     ```
   - Misebox App:
     ```bash
     pnpm dev:misebox
     ```
   - Cleanbox App:
     ```bash
     pnpm dev:cleanbox
     ```

## Project Structure

- `packages/`: Shared modules and utilities.
- `projects/`: Individual client applications.
- `playground/`: Development environment for testing features.

## Coding Standards

- Follow the linting and formatting rules defined in `.eslintrc.js` and `.prettierrc`.
- Write clear and concise commit messages.
- Test all changes thoroughly before pushing.

## Troubleshooting

- If you encounter issues, check the `copilot.md` files in each project for additional guidance.
- For further assistance, contact the project maintainer.

## Mission, Vision, and Values

### FireUX

- **Mission**: To empower developers with a standardized platform for building web applications efficiently.
- **Vision**: To become the go-to developer platform for rapid and consistent application deployment.
- **Values**: Innovation, collaboration, and developer-centric design.

### Misebox

- **Mission**: To revolutionize the cooking experience with a comprehensive app for chefs and home cooks.
- **Vision**: To be the ultimate digital companion for culinary enthusiasts.
- **Values**: Passion, creativity, and user-first design.

### Cleanbox

- **Mission**: To dominate the cleaning market with a no-nonsense, efficient application.
- **Vision**: To be the leading app for cleaning services and solutions.
- **Values**: Precision, efficiency, and market focus.

## Modus Operandi

All projects/apps follow a standardized structure and development process:

1. **Structure**:

   - Each project is located under `projects/projectname/projectname-app`.
   - The app serves as the ecosystem for the respective project.

2. **Core Features**:

   - Built on the `fireux-core` module.
   - Integrated with Firebase for authentication and database management.
   - Uses Stripe for payment processing.
   - Includes a Pro version upgrade feature, setting `pro: true` for app users.

3. **Development Goals**:
   - All apps will have identical initial functionality.
   - Focus on achieving a consistent stage of development across all apps.
   - Deploy all apps to Firebase for production use.
