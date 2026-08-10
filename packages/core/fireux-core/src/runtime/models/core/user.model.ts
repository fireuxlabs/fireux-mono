import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'

export const USER_ECOSYSTEM_AVATAR_SRC = '/img/ecosystem/avatar.png'

export type AppUserRole = 'user' | 'admin'
export type AppUserOnboardingStatus = 'pending' | 'completed' | 'skipped'

export interface UserIdentity {
  id: string
  handle: string
}

export interface UserPresentation {
  display_name: string
  bio: string
}

export interface UserAssets {
  avatar: string
}

export interface User
  extends FireuxStamped,
    UserIdentity,
    UserPresentation {
  assets: UserAssets
}

export interface AppUser extends FireuxStamped {
  id: string
  role: AppUserRole
  is_premium: boolean
  onboarding_status: AppUserOnboardingStatus
}

/** Console targets assigned to one User. */
export interface UserTargets {
  project_ids: string[]
  [targetIds: string]: string[]
}

export const UserStorage = {
  shape: 'root',
  database: 'named',
  path: 'users/{userId}',
  collection: 'users',
  idParam: 'userId',
} as const

export const UserAssetsStorage = {
  shape: 'entity-assets',
  root: 'users/{userId}',
  avatar: 'users/{userId}/avatar',
} as const

export const AppUserStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/users/{userId}',
  collection: 'users',
  parent: 'app',
  idParam: 'userId',
} as const

export const UserTargetsStorage = {
  shape: 'scoped',
  path: 'users/{userId}/private/targets',
  collection: 'private',
  document: 'targets',
  parent: 'user',
  idParam: 'userId',
} as const

export const UserEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'User',
  family: ['core', 'identity'],
  identity: 'root',
  authority: 'identity-database',
  appSupport: 'membership-record',
  publicRead: 'projection',
  status: 'confirmed',
  root: UserStorage.path,
  appSupportPath: AppUserStorage.path,
})

export const UserIdentityDefaults: UserIdentity = {
  id: '',
  handle: '',
}

export const UserPresentationDefaults: UserPresentation = {
  display_name: '',
  bio: '',
}

export const UserAssetsDefaults: UserAssets = {
  avatar: USER_ECOSYSTEM_AVATAR_SRC,
}

export const UserDefaults: User = {
  ...UserIdentityDefaults,
  ...UserPresentationDefaults,
  assets: UserAssetsDefaults,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const AppUserDefaults: AppUser = {
  id: '',
  role: 'user',
  is_premium: false,
  onboarding_status: 'pending',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const UserTargetsDefaults: UserTargets = {
  project_ids: [],
}

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<UserCreateInput>
export type AppUserCreateInput = Omit<AppUser, 'id' | 'created' | 'updated'>
export type AppUserUpdateInput = Partial<AppUserCreateInput>
