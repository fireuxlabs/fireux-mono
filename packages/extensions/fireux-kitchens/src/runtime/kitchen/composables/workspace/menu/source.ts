import type { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { computed, watchEffect, onScopeDispose } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { useFoodCatalogueSummary } from './catalogue'
import { useKitchenOfferings } from '../../offerings/useKitchenOfferings'
import { createMenuServices } from './services'

/** One read-only overview and publisher, sharing the parent's exact Menu collection. */
export function createKitchenMenuOverview(
  menuCollection: ReturnType<typeof useKitchenMenuCollection>
) {
  const workspace = useKitchenWorkspace()
  const source = useKitchenOfferings(workspace.id, menuCollection)
  const { kitchenId, storageKitchenId, menus, menusOutcome } = source
  const catalogue = useFoodCatalogueSummary(
    storageKitchenId,
    menus,
    menusOutcome
  )
  const services = createMenuServices(source)
  const { ready, pending, failed } = services
  const overview = computed(() => ({
    subject: 'Menus',
    catalogue: catalogue.value,
    availableActions: [],
    setup: ready.value ? services.setup.value.services : [],
    services: services.rows.value,
    menus: ready.value
      ? menus.value.map((menu) => ({
          id: menu.id,
          name: menu.name,
          internal_name: menu.internal_name,
          status: menu.status,
        }))
      : [],
  }))
  const page = useWorkspacePageState('kitchen')
  watchEffect(() =>
    page.publish({
      selected: { kitchenId: kitchenId.value },
      overview: overview.value,
      derived: {
        outcome: failed.value
          ? 'error'
          : pending.value
            ? 'pending'
            : ready.value
              ? 'ready'
              : 'empty',
      },
    })
  )
  onScopeDispose(() => page.publish({ derived: { outcome: 'idle' } }))
  return {
    kitchenId,
    storageKitchenId,
    timezone: source.timezone,
    catalogue,
    menus,
    menusOutcome,
    services,
    ready,
    overview,
  }
}
