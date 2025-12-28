// Product extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/models/core/user.model' {
  interface User {
    canManageProducts?: boolean
  }

  interface AppUser {
    canManageProducts?: boolean
  }
}

export {}
