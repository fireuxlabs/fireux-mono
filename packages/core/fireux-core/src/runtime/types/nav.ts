export interface NavMeta {
  key: string
  label?: string
  icon?: string
  group?: string
  order?: number
  area?: string
  desktop?: boolean
  mobile?: boolean
}

export interface NormalizedNavItem {
  key: string
  label: string
  icon?: string
  to: string
  group: string
  order: number
  area: string
  desktop: boolean
  mobile: boolean
  requiresAuth: boolean
  roles: string[]
}
