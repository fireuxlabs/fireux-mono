import type { User } from './user.model.ts'

export type UserIdentitySummary = Pick<
  User,
  'id' | 'display_name' | 'avatar' | 'handle'
>

export type ProfileUser = UserIdentitySummary

export type ProfileDirectoryEntry<
  TProfile extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  kind: 'agent' | 'chef' | 'driver' | 'professional'
  profile: TProfile
  user: ProfileUser
}
