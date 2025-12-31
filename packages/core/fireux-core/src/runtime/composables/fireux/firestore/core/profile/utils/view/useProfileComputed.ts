import { computed } from 'vue'
import type {
  AppProfileBase,
  CoreProfileBase,
} from '../../../../../../../models/core/profile.model'
import type { ProfileRefs } from '../../fetch/useProfileFetch'

export function useProfileComputed<
  TCore extends CoreProfileBase = CoreProfileBase,
  TApp extends AppProfileBase = AppProfileBase,
>(profileRefs: ProfileRefs<TCore, TApp>) {
  type MergedProfile = Partial<TCore> & Partial<TApp>

  const profile = computed<MergedProfile | null>(() => {
    const core = profileRefs.coreProfile.value
    const overlay = profileRefs.appProfile.value
    if (!core && !overlay) return null

    const base = core ? { ...core } : ({} as Partial<TCore>)
    if (overlay) Object.assign(base, overlay)
    return base as MergedProfile
  })

  return { profile }
}

