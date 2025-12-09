// Blog extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/models/core/user.model.ts' {
  interface User {
    canPost?: boolean
  }

  interface AppUser {
    canPost?: boolean
  }
}

export {}
