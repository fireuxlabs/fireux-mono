export type PublicSeoDto = {
  title: string
  description: string
  path: string
  image?: string
  updatedAt: string
  isPublic: boolean
}

export type PublicUserDto = PublicSeoDto & {
  id: string
  handle: string
  displayName: string
  avatar: string
  apps: string[]
  profiles: string[]
}

export type PublicCollectionResponse<T> = {
  ok: true
  count: number
  generatedAt: string
  items: T[]
}

export type PublicDetailResponse<T> = {
  ok: true
  generatedAt: string
  item: T
}
