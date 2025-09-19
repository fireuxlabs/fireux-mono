// Local shim to reference core profile composables reliably from the jobs extension
// Avoids fragile deep relative paths and harmonizes TS path resolution
import { useProfile } from '#fireux-core-runtime/composables/firestore/profiles/useProfile'
import type { ProfileConfig } from '#fireux-core-runtime/models/profiles/profile.model'

// Back-compat wrapper that emulates the old useProfileCreate API
export function useProfileCreate(config: ProfileConfig) {
	const { ensure } = useProfile(config) as any
	return { ensure }
}
