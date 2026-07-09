<template>
  <MenuDetailKioskStart
    v-if="showKioskStart"
    :background-image-url="kioskStartBackgroundImageUrl"
    :kitchen-name="props.menu.presentation.kitchenName"
    :logo-image-url="props.menu.presentation.kitchenImageUrl"
    :primary-color="props.menu.presentation.kioskSkin?.primaryColor"
    :secondary-color="props.menu.presentation.kioskSkin?.secondaryColor"
    :wordmark-image-url="props.menu.presentation.kitchenWordmarkImageUrl"
    @start="startKiosk"
  />

  <section
    v-else-if="showKioskOrder"
    class="menu-kiosk-screen"
    :style="kioskScreenStyle"
  >
    <img
      v-if="props.menu.presentation.kitchenImageUrl"
      class="menu-kiosk-screen__logo"
      :src="props.menu.presentation.kitchenImageUrl"
      :alt="props.menu.presentation.kitchenName || ''"
    >

    <button
      type="button"
      class="menu-kiosk-screen__close"
      aria-label="Go back"
      @click="resetKiosk"
    >
      <UIcon name="i-lucide-x" aria-hidden="true" />
    </button>

    <MenuDetailKioskOrder
      :mode="kioskMode"
      :view="interaction.detail.view"
    />
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
import { computed, watch } from 'vue'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
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
type KioskStoredMode = 'start' | KioskEntryMode
const kioskModeChoices = [
  'start',
  'eat_in',
  'takeaway',
] as const satisfies readonly KioskStoredMode[]

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
const kitchenSlug = computed(() => String(props.kitchenSlug || '').trim())
const kioskModeStorageKey = computed(() =>
  [
    'fireux:menu',
    kitchenSlug.value || 'root',
    props.menuId,
    'kiosk',
    'mode',
  ].filter(Boolean).join(':')
)
const { selected: storedKioskMode } = useStoredChoice<KioskStoredMode>({
  key: kioskModeStorageKey,
  choices: kioskModeChoices,
  fallback: 'start',
})
const kioskMode = computed<KioskEntryMode | ''>(() =>
  storedKioskMode.value === 'start' ? '' : storedKioskMode.value
)
const kioskStarted = computed(() => storedKioskMode.value !== 'start')
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
const showKioskOrder = computed(() =>
  isKioskContext.value && kioskStarted.value
)
const kioskStartBackgroundImageUrl = computed(() =>
  props.menu.presentation.kioskSkin?.backgroundImageUrl || ''
)
const kioskScreenStyle = computed(() =>
  ({
    ...(kioskStartBackgroundImageUrl.value
      ? {
          '--kiosk-background-image':
            `url('${kioskStartBackgroundImageUrl.value}')`,
        }
      : {}),
    '--kiosk-primary':
      props.menu.presentation.kioskSkin?.primaryColor || '#ff7912',
    '--kiosk-secondary':
      props.menu.presentation.kioskSkin?.secondaryColor || '#050505',
  })
)
function startKiosk(mode: KioskEntryMode) {
  storedKioskMode.value = mode
  interaction.detail.select(`order:${mode}`)
}

function resetKiosk() {
  storedKioskMode.value = 'start'
}

watch(kioskMode, (mode) => {
  if (!isKioskContext.value || !mode) return

  interaction.detail.select(`order:${mode}`)
}, { immediate: true })

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
.menu-kiosk-screen {
  position: relative;
  display: block;
  height: 100svh;
  padding: 0;
  overflow: hidden;
  background-image:
    linear-gradient(rgb(0 0 0 / 28%), rgb(0 0 0 / 42%)),
    var(
      --kiosk-background-image,
      linear-gradient(145deg, #111, #2a1204)
    );
  background-position: center;
  background-size: cover;
  color: white;
}

.menu-kiosk-screen__logo {
  position: absolute;
  inset-inline: 0;
  top: 14.85svh;
  z-index: 0;
  width: min(31vw, 21rem);
  aspect-ratio: 1;
  margin-inline: auto;
  padding: 1.1rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 58%);
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 28%);
  object-fit: contain;
  transform: translateY(-50%);
}

.menu-kiosk-screen__close {
  position: fixed;
  top: clamp(1rem, 2.4svh, 2rem);
  right: clamp(1rem, 2.4vw, 2rem);
  z-index: 4;
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--kiosk-primary) 76%, white);
  border-radius: 999px;
  background: color-mix(in srgb, var(--kiosk-secondary) 36%, transparent);
  color: white;
  cursor: pointer;
  text-shadow: 0 0.25rem 0.9rem rgb(0 0 0 / 42%);
}

.menu-kiosk-screen__close:hover,
.menu-kiosk-screen__close:focus-visible {
  background: color-mix(in srgb, var(--kiosk-secondary) 52%, transparent);
}

.menu-kiosk-screen__close:focus-visible {
  outline: 2px solid var(--kiosk-primary);
  outline-offset: 0.25rem;
}

.menu-kiosk-screen__close :deep(.iconify) {
  width: 2.5rem;
  height: 2.5rem;
}

</style>
