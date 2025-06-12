# MiseBox App

MiseBox is a versatile task management and organization application built on the FireUX Core module, showcasing the power and flexibility of the FireUX platform architecture.

## Features

- 📋 **Task Management**: Create, organize, and track tasks efficiently
- 🔐 **User Authentication**: Secure login and user profile management
- 📊 **Dashboard**: Comprehensive overview of tasks and progress
- 🎯 **Project Organization**: Group tasks into projects and categories
- 📱 **Responsive Design**: Works seamlessly across all devices
- 🔥 **Firebase Backend**: Real-time synchronization and data persistence
- ⚡ **Performance**: Fast loading and smooth interactions

## Architecture

MiseBox follows the standardized FireUX application architecture:

```
misebox-app/
├── app.vue                # Main application entry point
├── nuxt.config.ts         # Nuxt and FireUX Core configuration
├── public/                # Static assets
├── server/                # Server-side code
└── layouts/               # Page layouts (optional)
```

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm
- Firebase account

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Configuration

Create a `.env` file in your project root with the following variables:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Application Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3006
```

### Firebase Setup

Configure the following Firebase services in your project:

1. **Authentication**

   - Enable Email/Password authentication
   - Enable Google Sign-In (optional)
   - Configure anonymous authentication for testing

2. **Cloud Firestore**

   - Set up database with appropriate security rules
   - Create collections for tasks, projects, and user data

3. **Storage**
   - Configure file upload rules
   - Set up bucket for task attachments

## Development

### Start the Development Server

```bash
pnpm dev
```

The application will be available at http://localhost:3006

### Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## FireUX Core Integration

MiseBox leverages FireUX Core for:

- **Authentication System**: Complete user management with Firebase Auth
- **UI Components**: Consistent design system and reusable components
- **Asset Management**: Centralized CSS and design tokens
- **Navigation**: Standardized routing and layout patterns
- **State Management**: Reactive data handling with Nuxt/Vue

## Deployment

### Build Process

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build
```

### Environment Variables

Ensure all required environment variables are configured in your deployment environment:

- Firebase configuration
- Site URL for proper routing
- Any additional API keys

### Hosting Options

MiseBox can be deployed to various platforms:

- **Vercel**: Automatic deployments with Git integration
- **Netlify**: Static site hosting with serverless functions
- **Firebase Hosting**: Integrated with Firebase backend services
- **Self-hosted**: Any Node.js compatible hosting provider

## Contributing

When contributing to MiseBox:

1. Follow the FireUX Core conventions and patterns
2. Ensure all Firebase integrations work correctly
3. Test across different screen sizes and devices
4. Update documentation for new features

For more information on the underlying architecture, see the [FireUX Core documentation](../../packages/fireux-core/README.md).
