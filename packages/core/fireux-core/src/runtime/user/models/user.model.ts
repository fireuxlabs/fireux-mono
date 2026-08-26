export const USER_PINGS = ['Mark', 'luke', 'john'] as const
export type UserPing = (typeof USER_PINGS)[number]

export function isUserPing(value: unknown): value is UserPing {
  return USER_PINGS.includes(value as UserPing)
}

export type User = {
  id: string
  handle: string
  display_name: string
  bio: string
  avatar: string
  ping: UserPing
}
