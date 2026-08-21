import type { FirebaseTimestamp } from '../../../types/firebase'
import { defineFireuxEntity } from '../../models/utils/entity.model.ts'
import type { FireuxStamped } from '../../models/utils/stamps.model.ts'

export const USER_ECOSYSTEM_AVATAR_SRC = '/img/ecosystem/avatar.png'

export type AppUserRole = 'user' | 'admin'
export type AppUserOnboardingStatus = 'pending' | 'completed' | 'skipped'

export interface User extends FireuxStamped {
  id: string
  handle: string
  display_name: string
  bio: string
  avatar: string
}

export interface AppUser extends FireuxStamped {
  id: string
  role: AppUserRole
  is_premium: boolean
  onboarding_status: AppUserOnboardingStatus
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

export const UserEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'User',
  family: ['core', 'identity'],
  identity: 'root',
  authority: 'identity-database',
  appSupport: 'membership-record',
  root: UserStorage.path,
  appSupportPath: AppUserStorage.path,
})

export const UserDefaults: User = {
  id: '',
  handle: '',
  display_name: '',
  bio: '',
  avatar: USER_ECOSYSTEM_AVATAR_SRC,
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

export type UserCreateInput = Omit<User, 'id' | 'created' | 'updated'>
export type UserUpdateInput = Partial<UserCreateInput>
export type AppUserCreateInput = Omit<AppUser, 'id' | 'created' | 'updated'>
export type AppUserUpdateInput = Partial<AppUserCreateInput>
