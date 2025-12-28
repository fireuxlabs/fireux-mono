// Blog extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/models/core/user.model' {
  interface User {
    canPost?: boolean
  }

  interface AppUser {
    canPost?: boolean
  }
}

export {}
