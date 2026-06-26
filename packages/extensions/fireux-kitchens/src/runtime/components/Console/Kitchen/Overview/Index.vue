<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Kitchen"
        entity-plural-label="Kitchens"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <ConsoleAppScope :entity="focus.entity" />
        <ConsoleKitchenOverviewMenus
          :menus="menus"
          :pending="menusPending"
        />
        <ConsoleKitchenOverviewOperators :operator-ids="operatorIds" />
      </ConsoleOverviewFocus>
      <ConsoleOverviewMultiple
        entity-label="Kitchen"
        entity-plural-label="Kitchens"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Kitchen overview"
        scope="console"
        :data="pageDebug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard } from 'fireux-core/runtime/components/Console/types'
import { useKitchenConsoleOverview } from '../../../../composables/fireux/console/kitchen/overview/useKitchenConsoleOverview'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useMenuCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuCollection'

const { focus, multiple, debug, kitchenId, rootCollection } = useKitchenConsoleOverview()
const { pill } = useKitchenInterface()
const {
  activeMenus: menus,
  pending: menusPending,
} = useMenuCollection(kitchenId, {
  kitchenCollectionPath: rootCollection,
})
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const appScopeState = computed(() =>
  String(focus.value.entity?.app_scope_state ?? '').trim()
)
const appScopeAppId = computed(() =>
  String(focus.value.entity?.app_scope_app_id ?? '').trim()
)
const hasTenantApp = computed(() => appScopeState.value === 'dedicated_app')
const operatorIds = computed(() =>
  Array.from(
    new Set(
      ((focus.value.entity as { operator_ids?: unknown[] } | null)?.operator_ids ?? [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    )
  )
)
const pageDebug = computed(() => ({
  ...debug.value,
  appScope: {
    state: appScopeState.value,
    appId: appScopeAppId.value,
    hasTenantApp: hasTenantApp.value,
  },
  operators: {
    ids: operatorIds.value,
    count: operatorIds.value.length,
  },
  menus: {
    count: menus.value.length,
    names: menus.value.map((menu) => String(menu.name || menu.id || '').trim()).filter(Boolean),
    pending: menusPending.value,
  },
}))
const multipleCards = computed(() =>
  multiple.value.items
    .map((kitchen) => pill(kitchen) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
