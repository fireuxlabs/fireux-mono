// Blog extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/user/models/user.model' {
  interface UserCoreExtensions {
    canPost?: boolean
  }

  interface AppUserExtensions {
    canPost?: boolean
  }
}

export { }

