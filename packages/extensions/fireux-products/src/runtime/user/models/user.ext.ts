// Product extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/user/models/user.model' {
  interface UserCoreExtensions {
    canManageProducts?: boolean
  }

  interface AppUserExtensions {
    canManageProducts?: boolean
  }
}

export { }

