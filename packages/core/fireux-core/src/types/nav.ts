export interface NavVisibility {
  apps?: string[]
  ecosystems?: string[]
  modules?: string[]
  modulesAny?: string[]
}

export interface NavMeta {
  key?: string
  label?: string
  icon?: string
  group?: string
  order?: number | string
  profileId?: string
  desktop?: boolean
  mobile?: boolean
  layouts?: string[]
  visibility?: NavVisibility
}

export interface NavItem {
  key?: string
  label: string
  icon?: string
  to: string
  group?: string
  profileId?: string
  order: number
  desktop: boolean
  mobile: boolean
  layouts: string[]
  requiresAuth?: boolean
  roles?: string[]
  tenant?: string
  visibility?: NavVisibility
}
