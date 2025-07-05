# Application Management Documentation

This directory contains endpoints for application lifecycle management and configuration.

## 🎯 Purpose

Handles application initialization, configuration, and management operations for FireUX apps.

## 📁 Files

### `ensure-app.post.ts`

**Purpose**: Complete application initialization with subscription setup

**What it does**:

- ✅ Creates Pro subscription plan (€9.99/month, €99.99/year)
- ✅ Creates Enterprise subscription plan (€29.99/month, €299.99/year)
- ✅ Creates sample products (optional)
- ✅ Updates app metadata in Firestore
- ✅ Orchestrates the entire app setup process

### `theme.get.ts`

**Purpose**: Retrieve theme configuration for the application

### `env-check.ts`

**Purpose**: Validate environment configuration and dependencies

## 🔄 App Initialization Flow

### **ensure-app Workflow**

```
1. POST /api/app/ensure-app
   ├── Task 1: Setup Subscription Plans
   │   ├── POST /api/stripe/create-product (Pro Plan)
   │   └── POST /api/stripe/create-product (Enterprise Plan)
   ├── Task 2: Create Sample Products (optional)
   │   └── POST /api/stripe/create-product (Sample Product)
   └── Task 3: Update App Metadata
       └── POST /api/firestore/update-document (App metadata)
```

## 📋 Usage Examples

### **Initialize New App**

```javascript
POST /api/app/ensure-app
{
  "appId": "my-new-app",
  "appName": "My Awesome App",
  "userId": "user-123",
  "setupSubscriptions": true,
  "createDefaultProducts": true,
  "metadata": {
    "created_by": "admin",
    "version": "1.0.0"
  }
}
```

### **Response Structure**

```javascript
{
  "success": true,
  "message": "App 'My Awesome App' initialization completed",
  "appId": "my-new-app",
  "appName": "My Awesome App",
  "userId": "user-123",
  "tasks_completed": ["default_subscription_plans", "sample_products", "app_metadata_update"],
  "tasks_failed": [],
  "products_created": [
    {
      "type": "pro_plan",
      "product_id": "prod_stripe123",
      "name": "My Awesome App - Pro Plan",
      "prices": 2
    },
    {
      "type": "enterprise_plan",
      "product_id": "prod_stripe456",
      "name": "My Awesome App - Enterprise Plan",
      "prices": 2
    }
  ],
  "subscriptions_setup": true,
  "firestore_updated": true
}
```

## 🎯 Subscription Plans Created

### **Pro Plan**

- **Monthly**: €9.99/month
- **Yearly**: €99.99/year (17% savings)
- **Features**: Advanced features, Priority support, Extended storage, Analytics dashboard

### **Enterprise Plan**

- **Monthly**: €29.99/month
- **Yearly**: €299.99/year (17% savings)
- **Features**: All Pro features + Dedicated support, Unlimited storage, Advanced analytics, API access, Custom integrations

## 🔧 Configuration Options

### **Required Fields**

- `appId` - Unique application identifier
- `appName` - Human-readable application name
- `userId` - ID of user initializing the app

### **Optional Fields**

- `setupSubscriptions` (default: `true`) - Create subscription plans
- `createDefaultProducts` (default: `true`) - Create sample products
- `metadata` (default: `{}`) - Additional app metadata

## 🏗️ Integration Points

### **Dependencies**

- `/api/stripe/create-product` - For creating subscription plans
- `/api/firestore/update-document` - For data persistence

### **Used By**

- `useEnsureApp()` composable - Frontend app initialization
- New app creation workflows
- App migration processes

## 📊 Firestore Data Structure

### **App Metadata** (`apps/{appId}`)

```javascript
{
  "app_name": "My Awesome App",
  "creator_id": "user-123",
  "initialized_at": "2025-07-04T10:30:00.000Z",
  "subscriptions_setup": true,
  "products_created": 2,
  "ensure_app_completed": true,
  "last_ensure_app_run": "2025-07-04T10:30:00.000Z",
  "metadata": {
    "ensure_app_version": "1.0"
  }
}
```

### **Products** (`apps/{appId}/products/{productId}`)

- Pro plan product data
- Enterprise plan product data
- Sample product data (if enabled)

## 🧪 Testing

Supports ping/pong for testing:

```javascript
{
  "ping": "test-init-123",
  // ... other data
}

// Response includes:
{
  "pong": "pong-test-init-123"
}
```

## 🚨 Error Handling

### **Task-Based Error Handling**

- Failed tasks are logged but don't stop the entire process
- `tasks_failed` array contains details of any failures
- Graceful degradation - app can still function with partial setup

### **Common Scenarios**

- Stripe API errors (invalid keys, network issues)
- Firestore permission errors
- Missing environment variables
