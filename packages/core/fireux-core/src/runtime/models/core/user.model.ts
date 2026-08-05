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
  avatar: string
}

/** Canonical person identity stored at `users/{userId}`. */
export interface User extends FireuxStamped, UserIdentity, UserPresentation {}

/** One User's membership and capability state inside one App. */
export interface AppUser extends FireuxStamped {
  id: string
  role: AppUserRole
  is_premium: boolean
  onboarding_status: AppUserOnboardingStatus
}

/** Private console-target ids owned by one User; never part of public User. */
export interface UserTargets {
  project_ids: string[]
  kitchen_ids: string[]
}

export const UserStorage = {
  shape: 'root',
  database: 'named',
  path: 'users/{userId}',
  collection: 'users',
  idParam: 'userId',
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

export const UserIdentityModel: UserIdentity = {
  id: '',
  handle: '',
}

export const UserPresentationModel: UserPresentation = {
  display_name: '',
  bio: '',
  avatar: USER_ECOSYSTEM_AVATAR_SRC,
}

export const UserModel: User = {
  ...UserIdentityModel,
  ...UserPresentationModel,
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export const AppUserModel: AppUser = {
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

export const UserTargetsModel: UserTargets = {
  project_ids: [],
  kitchen_ids: [],
}

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<UserCreateInput>
export type AppUserCreateInput = Omit<AppUser, 'id' | 'created' | 'updated'>
export type AppUserUpdateInput = Partial<AppUserCreateInput>
