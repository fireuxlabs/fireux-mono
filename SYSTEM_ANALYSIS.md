# FireUX Three Systems Analysis

## Models Comparison

### AppUser Model (Core Identity)

```typescript
interface AppUser {
  uid: string                    // Primary key
  display_name: string          // User's display name
  handle: string                // Unique handle
  avatar: string                // Profile picture
  bio: string                   // User bio
  email: string                 // Email address
  role?: 'user' | 'admin'       // System role
  subscription?: {...}          // Stripe subscription data
  notifications?: {...}         // Notification preferences
  followers?: Array<string>     // Social features
  following?: Array<string>     // Social features
  preferences?: {...}           // User preferences
}
```

### Professional Model (Job Seeker)

```typescript
interface Professional {
  uid: string                   // Links to AppUser
  title?: string                // Professional title
  bio_short?: string            // Short bio
  bio_long?: string             // Long bio
  kitchen_experience?: [...]    // Detailed work history
  languages?: [...]             // Language skills
  certifications?: [...]        // Certifications
  education?: [...]             // Education history
  projects?: [...]              // Project experience
  locations?: [...]             // Work locations

  // Legacy fields (for backward compatibility)
  displayName?: string
  email?: string
  bio?: string
  avatarUrl?: string
  skills?: string[]
}
```

### Employer Model (Job Poster)

```typescript
interface Employer {
  uid: string // Links to AppUser
  companyName: string // Company name
  contactEmail: string // Business email
  website?: string // Company website
  description?: string // Company description
  logoUrl?: string // Company logo
  createdAt: Date | string // Creation timestamp
  updatedAt?: Date | string // Update timestamp
}
```

## Create Functions Comparison

### AppUser Creation

- **Location**: Handled by `useAppUser` composable with `ensureAppUser` function
- **Strategy**: Auto-created on first authentication
- **Data Source**: Firebase Auth + user input
- **Storage**: `apps/{appId}/users/{uid}`

### Professional Creation

- **Location**: `useProfessionalCreate` composable
- **Strategy**: Manual creation with form data + AppUser identity
- **Data Source**: AppUser data + detailed form
- **Storage**: `professionals/{uid}` (global, not app-scoped)

### Employer Creation

- **Location**: `useEmployerCreate` composable
- **Strategy**: Manual creation with company data
- **Data Source**: AppUser UID + company form data
- **Storage**: `employers/{uid}` (global, not app-scoped)

## Key Issues Identified

### 1. Data Consistency Problems

- **Professional**: Uses legacy fields (displayName, email, avatarUrl) alongside new structure
- **AppUser**: Uses `display_name` (underscore)
- **Professional**: Uses `displayName` (camelCase)
- **Inconsistent**: Some fields are duplicated across models

### 2. Model Evolution Issues

- **Professional**: Has both old and new field structures
- **Legacy Support**: Old fields maintained for backward compatibility
- **Schema Drift**: Models have evolved independently

### 3. Creation Flow Inconsistencies

- **Professional**: Auto-populates from AppUser with `additionalData` parameter
- **Employer**: Requires complete `Employer` object
- **Different Patterns**: No unified creation strategy

### 4. Identity Linking

- All three use `uid` as the primary link
- AppUser is the master identity
- Professional and Employer are roles/extensions

## Recommendations

### 1. Standardize Field Names

- Use consistent naming convention (either snake_case or camelCase)
- Align field names across all models
- Create migration scripts for existing data

### 2. Unify Creation Patterns

- Make all create functions accept `additionalData` pattern
- Auto-populate identity fields from AppUser consistently
- Standardize return values and error handling

### 3. Clean Up Legacy Fields

- Plan migration from legacy Professional fields
- Establish clear deprecation timeline
- Update all references to use new fields

### 4. Model Relationships

- Consider making Professional/Employer extend a base interface
- Add proper TypeScript inheritance
- Establish clear data flow patterns
