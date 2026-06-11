import { computed } from 'vue'
import { useBlankCollection } from '../../firestore/blank/useBlank'
import type { Blank } from '../../../../models/blank.model'

const demoTargets: Blank[] = [
  {
    id: 'demo-blank-console',
    app_scope_state: 'root_only',
    app_scope_app_id: 'fireux-blank',
    name: 'Demo Blank Console',
    slug: 'demo-blank-console',
    status: 'active',
    operator_ids: [],
  },
]

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without domain operations or child records. Demo targets are static,
 * selectable, and read-only.
 */
export function useBlankConsole() {
  const { blanks, pending, rootCollectionPath, appCollectionPath } =
    useBlankCollection()
  const liveTargets = computed(() => blanks.value)
  const demoTargetsRef = computed(() => demoTargets)
  const hasLiveTargets = computed(() => liveTargets.value.length > 0)

  return {
    liveTargets,
    demoTargets: demoTargetsRef,
    hasLiveTargets,
    pending,
    rootCollectionPath,
    appCollectionPath,
  }
}
