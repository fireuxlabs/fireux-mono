import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { DevHealthResult } from '../types'

// Minimal admin health check placeholder until real checks are added.
export function useDevAdminHealth(): ComputedRef<DevHealthResult | null> {
	return computed(() => null)
}
