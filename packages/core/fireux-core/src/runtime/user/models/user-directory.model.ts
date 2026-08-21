export type UserSeoPresentation = {
  title: string
  description: string
  path: string
  image?: string
  updatedAt: string
}

export type UserDetail = UserSeoPresentation & {
  id: string
  handle: string
  displayName: string
  bio: string
  avatar: string
}

export type UserIdentitySummary = {
  id: string
  display_name: string
  avatar: string
  handle: string
}

export type ProfileUser = UserIdentitySummary

export type ProfileDirectoryEntry<
  TProfile extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  kind: 'agent' | 'chef' | 'driver' | 'professional'
  profile: TProfile
  user: ProfileUser
}
