<template>
  <MenuDetailKioskStart
    v-if="showKioskStart"
    :background-image-url="kioskStartBackgroundImageUrl"
    :kitchen-name="props.menu.presentation.kitchenName"
    :logo-image-url="props.menu.presentation.kitchenImageUrl"
    @start="startKiosk"
  />

  <section v-else-if="showKioskDump" class="menu-kiosk-dump">
    <button
      type="button"
      class="menu-kiosk-dump__close"
      aria-label="Go back"
      @click="resetKiosk"
    >
      <UIcon name="i-lucide-x" aria-hidden="true" />
    </button>

    <pre>{{ kioskDumpJson }}</pre>
  </section>

  <template v-else>
    <MenuDetailContent
      :view="interaction.detail.view"
      :pre-order-operator-status="preOrderOperatorStatus"
      @update:selected-choice="interaction.detail.select"
      @select-item="interaction.detail.selectItem"
      @add="interaction.detail.add"
    />

    <section
      v-if="interaction.funnel.sessionConflict"
      class="mx-auto mt-6 w-full max-w-3xl rounded-lg border border-default bg-muted p-4"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-medium text-highlighted">
              You already have a {{ interaction.funnel.sessionConflict.label }} basket
            </p>

            <UBadge color="warning" variant="soft">
              {{ interaction.funnel.sessionConflict.quantity }}
              item{{ interaction.funnel.sessionConflict.quantity === 1 ? '' : 's' }}
            </UBadge>
          </div>

          <p class="text-sm text-muted">
            Open it to continue, or restart before starting
            {{ interaction.funnel.sessionConflict.currentLabel }}.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="interaction.funnel.sessionConflict.to"
            :to="interaction.funnel.sessionConflict.to"
            color="primary"
            variant="soft"
            icon="i-lucide-shopping-basket"
            @click="interaction.funnel.openSession?.()"
          >
            Open basket
          </UButton>

          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-refresh-cw"
            @click="interaction.funnel.restartSession?.()"
          >
            Restart order
          </UButton>
        </div>
      </div>
    </section>

    <MenuDetailFunnel
      v-if="interaction.funnel.show && interaction.funnel.order.panelOpen"
      :funnel="interaction.funnel"
    />

    <MenuDetailFunnelTrigger
      v-else-if="interaction.funnel.show"
      :funnel="interaction.funnel"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFunnel } from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/useKitchen'
import { resolveKitchenScopeCollectionPath } from '../../../composables/fireux/firestore/kitchen/utils/paths/useKitchenChildCollection'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'

type OperatorStatus = 'online' | 'offline'
type OperatorPresenceWatch = {
  orderType: string
  status: OperatorStatus
}
type KioskEntryMode = 'eat_in' | 'takeaway'

const props = defineProps<{
  menu: MenuManifest
  menuId: string
  menuContext?: MenuRouteContext
  kitchenSlug?: string
}>()

const interaction = useFunnel({
  menu: () => props.menu,
  menuId: () => props.menuId,
  menuContext: () => props.menuContext,
  kitchenSlug: () => props.kitchenSlug,
})
const { uid } = useAuth()
const kioskStarted = ref(false)
const kioskMode = ref<KioskEntryMode | ''>('')
const kitchenSlug = computed(() => String(props.kitchenSlug || '').trim())
const { kitchen: rootKitchen } = useKitchenFetch(kitchenSlug, {
  hydrate: false,
})
const scopedKitchenId = computed(() =>
  String(rootKitchen.value?.id || '').trim()
)
const scopedKitchenAppId = computed(() => {
  const kitchen = rootKitchen.value as Record<string, unknown> | null

  return String(kitchen?.app_scope_app_id || kitchen?.app_id || '').trim()
})
const scopedKitchenCollectionPath = computed(() =>
  scopedKitchenAppId.value
    ? resolveKitchenScopeCollectionPath(scopedKitchenAppId.value)
    : ''
)
const { kitchen: scopedKitchen } = useKitchenFetch(scopedKitchenId, {
  collectionPath: scopedKitchenCollectionPath,
  hydrate: false,
})
const preOrderOperatorStatus = computed(() =>
  targetHasOperator(scopedKitchen.value, String(uid.value || '').trim())
    ? 'online' as const
    : 'offline' as const
)
const activeOrderType = computed(() => interaction.funnel.order.orderType)
const isKioskContext = computed(() =>
  props.menu.behaviour.context === 'kiosk' || props.menuContext === 'kiosk'
)
const showKioskStart = computed(() =>
  isKioskContext.value &&
    !kioskStarted.value &&
    !interaction.funnel.show
)
const showKioskDump = computed(() =>
  isKioskContext.value && kioskStarted.value
)
const kioskStartBackgroundImageUrl = computed(() =>
  props.menu.presentation.kioskSkin?.backgroundImageUrl || ''
)
const kioskDump = computed(() => ({
  route: {
    menuId: props.menuId,
    menuContext: props.menuContext,
    kitchenSlug: props.kitchenSlug,
  },
  kiosk: {
    mode: kioskMode.value,
  },
  manifest: props.menu,
  interaction: {
    detail: interaction.detail.view,
    funnel: {
      show: interaction.funnel.show,
      order: interaction.funnel.order,
      incoming: interaction.funnel.incoming,
      processing: interaction.funnel.processing,
      sending: interaction.funnel.sending,
      sessionConflict: interaction.funnel.sessionConflict,
    },
  },
}))
const kioskDumpJson = computed(() =>
  JSON.stringify(kioskDump.value, null, 2)
)

function startKiosk(mode: KioskEntryMode) {
  kioskMode.value = mode
  interaction.detail.select(`order:${mode}`)
  kioskStarted.value = true
}

function resetKiosk() {
  kioskStarted.value = false
  kioskMode.value = ''
}

watch((): OperatorPresenceWatch => ({
  orderType: String(activeOrderType.value || ''),
  status: preOrderOperatorStatus.value,
}), ({ orderType, status }: OperatorPresenceWatch) => {
  if (orderType !== 'pre_order') return

  interaction.funnel.collect({
    operator: {
      role: 'kitchen_operator',
      status,
    },
  })
}, { immediate: true })
</script>

<style scoped>
.menu-kiosk-dump {
  position: relative;
  display: block;
  min-height: 100svh;
  padding: 1rem;
  background: var(--menu-bg);
  color: var(--menu-text);
}

.menu-kiosk-dump__close {
  position: sticky;
  top: 1rem;
  z-index: 1;
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  margin-left: auto;
  place-items: center;
  border: 1px solid var(--menu-primary);
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
}

.menu-kiosk-dump__close:hover,
.menu-kiosk-dump__close:focus-visible {
  background: color-mix(in srgb, var(--menu-primary) 88%, black);
}

.menu-kiosk-dump__close:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-kiosk-dump__close :deep(.iconify) {
  width: 2.5rem;
  height: 2.5rem;
}

.menu-kiosk-dump pre {
  overflow: auto;
  margin: 1rem 0 0;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-text) 6%, transparent);
  color: inherit;
  font-size: 0.8rem;
  line-height: 1.45;
  text-align: left;
  white-space: pre-wrap;
}
</style>
