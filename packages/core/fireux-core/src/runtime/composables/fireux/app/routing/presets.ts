import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { NavItem } from '../../../../../types/nav'
import { useUser } from '../../firestore/core/user/useUser'
import { useNav } from '../ui/nav/useNav'

export const useDefaultNav = () => useNav(['default'])
export const useLandingNav = () => useNav(['landing'])

const canShowDashboardItem = (item: NavItem, isAdmin: boolean, isDev: boolean) => {
  if (item.key === 'admin' || item.to === '/dashboard/admin') {
    return isAdmin
  }

  if (item.key === 'console-developer' || item.to === '/dashboard/developer') {
    return isDev
  }

  return true
}

export const useDashboardNav = () => {
  const nav = useNav(['dashboard'])
  const { isAdmin } = useUser()
  const isDev = computed(() => import.meta.dev)

  const topPriority = [
    { key: 'console-developer', to: '/dashboard/developer' },
    { key: 'admin', to: '/dashboard/admin' },
    { key: 'console-home', to: '/dashboard' },
    { key: 'console-user-profile', to: '/dashboard/user-profile' },
  ]

  const baseNavFilter = (item: NavItem) =>
    item.group !== 'profiles' &&
    !item.profileId &&
    canShowDashboardItem(item, isAdmin.value, isDev.value)

  return {
    ...nav,
    topPriority,
    baseNavFilter,
  }
}

export const useConsoleNav = () => {
  const router = useRouter()

  const hasRoutePath = (path: string) =>
    router.getRoutes().some((route) => route.path === path)

  const items = computed<NavItem[]>(() => {
    const runtimeNav: NavItem[] = [
      {
        key: 'console-home',
        label: 'Console Home',
        icon: 'i-lucide-terminal',
        to: '/console',
        order: 10,
        desktop: true,
        mobile: true,
        layouts: ['console'],
      },
    ]

    if (hasRoutePath('/console/app')) {
      runtimeNav.push({
        key: 'console-runtime-app',
        label: 'App',
        icon: 'i-lucide-app-window',
        to: '/console/app',
        order: 15,
        desktop: true,
        mobile: true,
        layouts: ['console'],
      })
    }

    if (hasRoutePath('/console/kitchen')) {
      runtimeNav.push({
        key: 'console-runtime-kitchen',
        label: 'Kitchen',
        icon: 'i-lucide-chef-hat',
        to: '/console/kitchen',
        order: 20,
        desktop: true,
        mobile: true,
        layouts: ['console'],
      })
    }

    if (hasRoutePath('/console/portfolio')) {
      runtimeNav.push({
        key: 'console-runtime-portfolio',
        label: 'Portfolio',
        icon: 'i-lucide-building-2',
        to: '/console/portfolio',
        order: 30,
        desktop: true,
        mobile: true,
        layouts: ['console'],
      })
    }

    return runtimeNav
  })

  const desktop = computed(() => items.value.filter((item) => item.desktop))
  const mobile = computed(() => items.value.filter((item) => item.mobile))
  const topPriority = [
    { key: 'console-home', to: '/console' },
    { key: 'console-runtime-app', to: '/console/app' },
    { key: 'console-runtime-kitchen', to: '/console/kitchen' },
    { key: 'console-runtime-portfolio', to: '/console/portfolio' },
  ]

  return {
    items,
    desktop,
    mobile,
    topPriority,
    baseNavFilter: (_item: NavItem) => true,
  }
}

export const useDevNav = () => useNav(['dev'])
