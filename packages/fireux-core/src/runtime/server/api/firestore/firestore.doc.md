# Firestore Integration Documentation

This directory contains Firestore database integration endpoints for the FireUX system.

## 🎯 Purpose

Provides generic, reusable Firestore operations that can be used by other API endpoints for data persistence.

## 📁 Files

### `update-document.post.ts`

**Purpose**: Generic Firestore document operations (create, update, merge)

**Capabilities**:

- ✅ Create new documents
- ✅ Update existing documents
- ✅ Merge data into documents
- ✅ Handle nested subcollections
- ✅ Automatic timestamp metadata

## 🔧 Usage

### **Basic Document Operation**

```javascript
POST /api/firestore/update-document
{
  "collection": "apps",
  "documentId": "my-app-123",
  "data": {
    "name": "My App",
    "status": "active"
  },
  "operation": "set" // or "update" or "merge"
}
```

### **Nested Subcollection Operation**

```javascript
POST /api/firestore/update-document
{
  "collection": "apps",
  "documentId": "my-app-123",
  "subcollections": [
    { "collection": "users", "documentId": "user-456" },
    { "collection": "subscriptions", "documentId": "sub-789" }
  ],
  "data": {
    "subscription_id": "sub-789",
    "status": "active"
  },
  "operation": "set"
}
```

## 📊 Data Structure

### **Document Paths**

The endpoint constructs Firestore paths based on collections and subcollections:

**Simple Path**: `apps/my-app-123`
**Nested Path**: `apps/my-app-123/users/user-456/subscriptions/sub-789`

### **Automatic Metadata**

All operations automatically add:

```javascript
{
  "updated_at": "2025-07-04T10:30:00.000Z",
  "firestore_updated_at": "2025-07-04T10:30:00.000Z"
}
```

## 🔄 Operations

### **Set Operation** (`operation: "set"`)

- Creates new document or completely replaces existing
- Use for: New documents, complete replacements

### **Update Operation** (`operation: "update"`)

- Updates only specified fields in existing document
- Use for: Partial updates, requires document to exist

### **Merge Operation** (`operation: "merge"`)

- Merges data into existing document, creates if doesn't exist
- Use for: Safe updates, won't overwrite existing fields

## 🏗️ Integration with Other Services

### **Used By:**

- `POST /api/stripe/create-product` - Store product data
- `POST /api/stripe/create-subscription` - Store subscription data
- `POST /api/app/ensure-app` - Store app metadata

### **Firebase Configuration**

Uses standard Firebase Admin SDK with environment variable:

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON

## 🔧 Error Handling

### **Common Errors**

- `400` - Missing required fields (collection, documentId, data)
- `500` - Firestore initialization failed
- `500` - Document operation failed

### **Validation**

- Validates required fields before processing
- Checks Firebase Admin initialization
- Validates subcollection structure

## 🧪 Testing

Supports ping/pong pattern for testing:

```javascript
{
  "ping": "test-123",
  // ... other data
}

// Response includes:
{
  "pong": "test-123"
}
```

## 📋 Response Format

```javascript
{
  "success": true,
  "operation": "set",
  "documentPath": "apps/my-app-123/users/user-456",
  "message": "Document set operation completed successfully",
  "writeTime": "2025-07-04T10:30:00.000Z",
  "pong": "test-123" // if ping was provided
}
```
