export interface NavVisibility {
  apps?: string[]
  appRoles?: string[]
  ecosystems?: string[]
  modules?: string[]
  modulesAny?: string[]
  domains?: string[]
  domainsAny?: string[]
  profiles?: string[]
  profilesAny?: string[]
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
  prominent?: boolean
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
  prominent?: boolean
  parked?: boolean
  roles?: string[]
  tenant?: string
  visibility?: NavVisibility
}
