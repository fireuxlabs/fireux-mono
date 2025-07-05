# API Endpoints Documentation

This directory contains all server-side API endpoints for the FireUX Core package.

## 🏗️ Structure

```
api/
├── app/                     # Application management
│   ├── ensure-app.post.ts   # App initialization
│   ├── theme.get.ts         # Theme configuration
│   └── env-check.ts         # Environment validation
├── firestore/               # Database operations
│   └── update-document.post.ts # Generic Firestore operations
├── stripe/                  # Payment processing
│   ├── create-product.post.ts     # Product creation
│   ├── create-subscription.post.ts # Customer subscriptions
│   └── stripe.doc.md        # Stripe-specific documentation
└── proxy/                   # Utility proxies
    └── google-avatar.ts     # Avatar proxy service
```

## 🔄 Endpoint Categories

### **App Management** (`/api/app/*`)

Endpoints for application lifecycle and configuration management.

**Key Endpoints:**

- `POST /api/app/ensure-app` - Initialize app with subscription plans
- `GET /api/app/theme` - Get theme configuration
- `GET /api/app/env-check` - Validate environment setup

### **Database Operations** (`/api/firestore/*`)

Generic database operations using Firestore.

**Key Endpoints:**

- `POST /api/firestore/update-document` - Generic document operations

### **Payment Processing** (`/api/stripe/*`)

Stripe integration for products and subscriptions.

**Key Endpoints:**

- `POST /api/stripe/create-product` - Create subscription plans
- `POST /api/stripe/create-subscription` - Create customer subscriptions

### **Utilities** (`/api/proxy/*`)

Proxy services and utilities.

**Key Endpoints:**

- `GET /api/proxy/google-avatar` - Proxy Google avatar images

## 🎯 Usage Patterns

### **App Initialization Flow**

```
1. POST /api/app/ensure-app
2. → POST /api/stripe/create-product (Pro Plan)
3. → POST /api/stripe/create-product (Enterprise Plan)
4. → POST /api/firestore/update-document (App metadata)
```

### **Customer Subscription Flow**

```
1. Customer selects plan
2. POST /api/stripe/create-subscription
3. → POST /api/firestore/update-document (Subscription data)
```

## 🔧 Development Standards

### **Error Handling**

All endpoints use consistent error handling with proper HTTP status codes.

### **Logging**

Standardized logging format: `[endpoint-name] Message`

### **Testing**

Support for ping/pong testing pattern for debugging.

### **Authentication**

Endpoints requiring authentication validate Firebase Auth tokens.

## 📚 Detailed Documentation

- [Stripe Integration](./stripe/stripe.doc.md) - Payment processing
- [Firestore Integration](./firestore/firestore.doc.md) - Database operations
- [App Management](./app/app.doc.md) - Application lifecycle

## 🚀 Deployment

All endpoints are automatically registered via the Nuxt module configuration and deployed with the application.
