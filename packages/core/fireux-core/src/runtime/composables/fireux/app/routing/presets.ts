import { computed } from 'vue'
import type { NavItem } from '../../../../../types/nav'
import { useUser } from '../../firestore/core/user/useUser'
import { useNav } from '../ui/nav/useNav'

export const useDefaultNav = () => useNav(['default'])
export const useLandingNav = () => useNav(['landing'])
export const useConsoleNav = () => {
	const nav = useNav(['console'])
	const { isAdmin } = useUser()
	const isDev = computed(() => import.meta.dev)

	const topPriority = [
		{ key: 'console-developer', to: '/console/developer' },
		{ key: 'admin', to: '/console/admin' },
		{ key: 'console-home', to: '/console' },
		{ key: 'console-user-profile', to: '/console/user-profile' },
	]

	const canShowNavItem = (item: NavItem) => {
		if (item.key === 'admin' || item.to === '/console/admin') {
			return isAdmin.value
		}

		if (item.key === 'console-developer' || item.to === '/console/developer') {
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
