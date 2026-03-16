// Product extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/models/core/user.model' {
  interface UserCoreExtensions {
    canManageProducts?: boolean
  }

  interface UserAppExtensions {
    canManageProducts?: boolean
  }
}

export {}
