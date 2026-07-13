<template>
  <MenuDetailKioskBackground
    v-if="isKioskContext"
    aria-label="Kiosk menu"
    :background-image-url="kioskStartBackgroundImageUrl"
    :kitchen-name="props.menu.presentation.kitchenName"
    :logo-image-url="props.menu.presentation.kitchenLogoImageUrl"
    :primary-color="props.menu.presentation.kioskSkin?.primaryColor"
    :secondary-color="props.menu.presentation.kioskSkin?.secondaryColor"
  >
    <Transition name="menu-kiosk-surface" mode="out-in">
      <div
        v-if="showKioskStart"
        key="start"
        class="menu-kiosk-screen menu-kiosk-screen--start"
      >
        <MenuDetailKioskStart
          :kitchen-name="props.menu.presentation.kitchenName"
          :modes="kioskModeOptions"
          :wordmark-image-url="props.menu.presentation.kitchenWordmarkImageUrl"
          @start="startKiosk"
        />
      </div>

      <div
        v-else
        key="browse"
        class="menu-kiosk-screen menu-kiosk-screen--browse"
      >
        <button
          type="button"
          class="menu-kiosk-screen__close"
          aria-label="Go back"
          @click="leaveKiosk"
        >
          <UIcon name="i-lucide-x" aria-hidden="true" />
        </button>

        <MenuDetailKioskBrowse
          :view="interaction.detail.view"
          @add="interaction.detail.add"
        />

        <MenuDetailFunnel
          v-if="interaction.funnel.show && interaction.funnel.order.panelOpen"
          :funnel="interaction.funnel"
          @done="resetKiosk"
        />

        <MenuDetailFunnelTrigger
          v-else-if="interaction.funnel.show"
          :funnel="interaction.funnel"
        />
      </div>
    </Transition>
  </MenuDetailKioskBackground>

  <template v-else-if="isStaffPosContext">
    <template v-if="canUseStaffPos">
      <MenuDetailStaffPos
        :view="interaction.detail.view"
        @update:selected-choice="interaction.detail.select"
        @add="interaction.detail.add"
      />

      <MenuDetailFunnel
        v-if="interaction.funnel.show && interaction.funnel.order.panelOpen"
        :funnel="interaction.funnel"
      />

      <MenuDetailFunnelTrigger
        v-else-if="interaction.funnel.show"
        :funnel="interaction.funnel"
      />
    </template>

    <UAlert
      v-else
      class="mx-auto mt-8 w-full max-w-2xl"
      :color="staffAccessPending ? 'neutral' : 'error'"
      variant="soft"
      :icon="staffAccessPending ? 'i-lucide-loader-circle' : 'i-lucide-shield-alert'"
      :title="staffAccessPending ? 'Checking operator access' : 'Staff POS access required'"
      :description="staffAccessPending
        ? 'Confirming your kitchen role.'
        : 'Sign in with a kitchen operator account to use this surface.'"
    />
  </template>

  <template v-else>
    <MenuDetailContent
      :view="interaction.detail.view"
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
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import { useFunnel } from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import { useKioskSkinBackground } from '../../../composables/fireux/menu/detail/useKioskSkinBackground'
import { useMenuStaffPosAccess } from '../../../composables/fireux/menu/detail/useMenuStaffPosAccess'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import { menuContextProfile } from '../../../utils/menu-context'

type KioskEntryMode = 'eat_in' | 'takeaway'
type KioskStoredMode = 'start' | KioskEntryMode
type KioskModeOption = {
  mode: KioskEntryMode
  label: string
  to?: string
}
const kioskEntryModes = [
  'eat_in',
  'takeaway',
] as const satisfies readonly KioskEntryMode[]

const props = defineProps<{
  menu: MenuManifest
  menuId: string
  menuContext?: MenuRouteContext
  kitchenSlug?: string
}>()

const interaction = useFunnel({
  menu: () => props.menu,
  menuId: () => props.menuId,
  sourceMenuId: () => props.menu.source.menuId,
  menuContext: () => props.menuContext,
  kitchenSlug: () => props.kitchenSlug,
  sessionKitchenSlug: () => props.menu.source.kitchenSlug,
})
const kitchenSlug = computed(() =>
  String(props.kitchenSlug || props.menu.source.kitchenSlug || '').trim()
)
const kioskModeOptions = computed<KioskModeOption[]>(() =>
  kioskEntryModes.flatMap((mode) => {
    const choice = (interaction.detail.view?.choices ?? []).find((option) =>
      option.orderType === mode
    )
    if (!choice) return []

    return [{
      mode,
      label: choice.label,
      ...(choice.to ? { to: choice.to } : {}),
    }]
  })
)
const availableKioskModes = computed<KioskEntryMode[]>(() =>
  kioskModeOptions.value
    .filter((option) => !option.to)
    .map((option) => option.mode)
)
const kioskModeChoices = computed<KioskStoredMode[]>(() => [
  'start',
  ...availableKioskModes.value,
])
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
const isKioskContext = computed(() =>
  props.menu.behaviour.surface === 'kiosk' ||
    menuContextProfile(props.menuContext).surface === 'kiosk'
)
const isStaffPosContext = computed(() =>
  props.menu.behaviour.surface === 'staff_pos' ||
    menuContextProfile(props.menuContext).surface === 'staff_pos'
)
const { canUseStaffPos, staffAccessPending } = useMenuStaffPosAccess({
  enabled: isStaffPosContext,
  menu: () => props.menu,
})
const showKioskStart = computed(() =>
  isKioskContext.value && !kioskStarted.value
)
const { backgroundImageUrl: kioskStartBackgroundImageUrl } = useKioskSkinBackground({
  skin: () => props.menu.presentation.kioskSkin,
})
function startKiosk(mode: KioskEntryMode) {
  if (!interaction.detail.selectOrderType(mode)) return

  storedKioskMode.value = mode
}

function resetKiosk() {
  interaction.funnel.clear()
  interaction.funnel.close()
  storedKioskMode.value = 'start'
}

function leaveKiosk() {
  interaction.funnel.clear()
  interaction.funnel.close()
  storedKioskMode.value = 'start'
}

watch(kioskMode, (mode: KioskEntryMode | '') => {
  if (!isKioskContext.value || !mode) return

  if (!interaction.detail.selectOrderType(mode)) {
    storedKioskMode.value = 'start'
  }
}, { immediate: true })

</script>

<style scoped>
.menu-kiosk-screen {
  height: 100%;
  min-height: 0;
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

.menu-kiosk-surface-enter-active,
.menu-kiosk-surface-leave-active {
  transition:
    opacity 240ms ease,
    filter 240ms ease,
    transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-kiosk-surface-enter-from {
  opacity: 0;
  filter: blur(0.45rem);
  transform: translateY(1.15rem) scale(0.985);
}

.menu-kiosk-surface-leave-to {
  opacity: 0;
  filter: blur(0.35rem);
  transform: translateY(-0.8rem) scale(1.015);
}

@media (prefers-reduced-motion: reduce) {
  .menu-kiosk-surface-enter-active,
  .menu-kiosk-surface-leave-active {
    transition: opacity 120ms ease;
  }

  .menu-kiosk-surface-enter-from,
  .menu-kiosk-surface-leave-to {
    filter: none;
    transform: none;
  }
}

@media (max-width: 900px) {
  .menu-kiosk-screen__close {
    width: 3.6rem;
    height: 3.6rem;
  }

  .menu-kiosk-screen__close :deep(.iconify) {
    width: 2rem;
    height: 2rem;
  }
}

@media (max-width: 560px) {
  .menu-kiosk-screen__close {
    width: 3.25rem;
    height: 3.25rem;
  }

  .menu-kiosk-screen__close :deep(.iconify) {
    width: 1.8rem;
    height: 1.8rem;
  }
}
</style>
