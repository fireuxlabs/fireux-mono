import type { FireuxAppRole } from '../../../config/app/types'

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

export interface NavChild {
  label: string
  to: string
  icon?: string
}

export interface NavMeta {
  children?: NavChild[]
  key?: string
  label?: string
  description?: string
  icon?: string
  group?: string
  /** This route opens the group index; applies to explicit children or nested route groups. */
  groupIndex?: boolean
  groupDisplay?: 'nested'
  groupIcon?: string
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
  children?: NavChild[]
  key?: string
  label: string
  description?: string
  icon?: string
  to: string
  group?: string
  /** This route opens the group index; applies to explicit children or nested route groups. */
  groupIndex?: boolean
  groupDisplay?: 'nested'
  groupIcon?: string
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
  appRole?: FireuxAppRole
  visibility?: NavVisibility
}

/** App-owned presentation choices for inherited route navigation. */
export type NavigationConfig = {
  hiddenKeys?: readonly string[]
  overrides?: Record<
    string,
    Partial<
      Pick<
        NavMeta,
        | 'label'
        | 'icon'
        | 'position'
        | 'order'
        | 'desktop'
        | 'mobile'
        | 'layouts'
      >
    >
  >
}

declare module 'nuxt/schema' {
  interface AppConfigInput {
    navigation?: NavigationConfig
  }
  interface AppConfig {
    navigation?: NavigationConfig
  }
}
