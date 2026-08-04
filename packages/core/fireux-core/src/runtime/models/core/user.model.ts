import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../utils/entity.model'
import type { FireuxStamped } from '../utils/stamps.model'

export const USER_ECOSYSTEM_AVATAR_SRC = '/img/ecosystem/avatar.png'

export type AppUserRole = 'user' | 'admin'
export type AppUserOnboardingStatus = 'pending' | 'completed' | 'skipped'

/** Canonical person identity stored at `users/{userId}`. */
export interface User extends FireuxStamped {
  id: string
  display_name: string
  bio: string
  avatar: string
  handle: string
  /** Reconciled membership projection; AppUser records remain authority. */
  app_ids: string[]
  /** Reconciled profile projection; profile records remain authority. */
  profiles: string[]
}

/** One User's membership and capability state inside one App. */
export interface AppUser extends FireuxStamped {
  id: string
  role: AppUserRole
  is_premium: boolean
  /** @deprecated Compatibility field pending a bounded stored-data migration. */
  console_enabled: boolean
  onboarding_status: AppUserOnboardingStatus
  /** Sparse derived profile index; omitted when empty. */
  profiles?: string[]
}

export const UserStorage = {
  shape: 'root',
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

export const UserModel: User = {
  id: '',
  display_name: '',
  bio: '',
  avatar: USER_ECOSYSTEM_AVATAR_SRC,
  handle: '',
  app_ids: [],
  profiles: [],
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
  console_enabled: false,
  onboarding_status: 'pending',
  profiles: [],
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

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<UserCreateInput>
export type AppUserCreateInput = Omit<AppUser, 'id' | 'created' | 'updated'>
export type AppUserUpdateInput = Partial<AppUserCreateInput>
