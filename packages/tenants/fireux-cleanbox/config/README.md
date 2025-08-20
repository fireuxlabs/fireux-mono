# CleanBox Service Account Setup

## Status: ⚠️ PLACEHOLDER SERVICE ACCOUNT

The current service account file is a placeholder and needs to be replaced with the actual service account from Firebase Console.

## Steps to Fix:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/cleanbox-f15bc
2. **Navigate to**: Project Settings → Service Accounts
3. **Generate new private key** for Firebase Admin SDK
4. **Replace this file** with the downloaded JSON file
5. **Keep the filename**: `service-account.json`

## Important:

- This file contains sensitive credentials - never commit real service account keys to git
- The .env file correctly points to this shared location: `../../../packages/tenants/fireux-cleanbox/config/service-account.json`
- Once replaced with real credentials, CleanBox app will work properly

## Test After Setup:

```bash
pnpm dev:cleanbox
```

Visit http://localhost:3002/dev/core-users to verify Firebase connection works.
