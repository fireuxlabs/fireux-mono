export interface NavVisibility {
  apps?: string[]
  ecosystems?: string[]
  modules?: string[]
  modulesAny?: string[]
  profiles?: string[]
  profilesAny?: string[]
  publicProfiles?: string[]
  publicProfilesAny?: string[]
  dashboardPages?: string[]
  dashboardPagesAny?: string[]
}

export type NavPosition = 'top' | 'middle' | 'bottom'

export interface NavMeta {
  key?: string
  label?: string
  icon?: string
  group?: string
  position?: NavPosition
  order?: number | string
  profileId?: string
  requiresSelection?: boolean
  hidden?: boolean
  parked?: boolean
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
  position?: NavPosition
  profileId?: string
  order: number
  desktop: boolean
  mobile: boolean
  layouts: string[]
  requiresAuth?: boolean
  requiresSelection?: boolean
  parked?: boolean
  roles?: string[]
  tenant?: string
  visibility?: NavVisibility
}
