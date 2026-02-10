import { computed } from 'vue'
import type { NavItem } from '../../../../../types/nav'
import { useUser } from '../../firestore/core/user/useUser'
import { useNav } from '../ui/nav/useNav'

export const useDefaultNav = () => useNav(['default'])
export const useLandingNav = () => useNav(['landing'])
export const useDashboardNav = () => {
	const nav = useNav(['dashboard'])
	const { isAdmin } = useUser()
	const isDev = computed(() => import.meta.dev)

	const topPriority = [
		{ key: 'dashboard-developer', to: '/dashboard/developer' },
		{ key: 'admin', to: '/dashboard/admin' },
		{ key: 'dashboard-home', to: '/dashboard' },
		{ key: 'dashboard-user-profile', to: '/dashboard/user-profile' },
	]

	const canShowNavItem = (item: NavItem) => {
		if (item.key === 'admin' || item.to === '/dashboard/admin') {
			return isAdmin.value
		}

		if (item.key === 'dashboard-developer' || item.to === '/dashboard/developer') {
			return isDev.value
		}

		return true
	}

	const baseNavFilter = (item: NavItem) =>
		item.group !== 'profiles' && !item.profileId && canShowNavItem(item)

	return {
		...nav,
		topPriority,
		baseNavFilter,
	}
}
export const useDevNav = () => useNav(['dev'])
