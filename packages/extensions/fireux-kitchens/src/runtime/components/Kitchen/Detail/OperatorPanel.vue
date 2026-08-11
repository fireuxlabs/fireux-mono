<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: let Nuxt UI own the public-action card root geometry. -->
<template>
  <UCard v-if="showPanel" class="fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge :color="accessBadgeColor" variant="soft">
          {{ accessBadgeLabel }}
        </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          :icon="accessIcon"
          size="md"
          class="fx-public-action__avatar"
        />

        <div class="fx-public-action__content">
          <div class="fx-public-action__copy">
            <h2 class="fx-public-action__title">
              Kitchen Operations
            </h2>
            <p class="fx-public-action__description">
              {{ panelDescription }}
            </p>
          </div>

          <div v-if="subjectUserPill" class="fx-public-action__subject">
            <span class="fx-public-action__label">{{ subjectLabel }}</span>
            <UserCardsPill
              v-bind="subjectUserPill"
              :show-badges="false"
              :link="Boolean(subjectUserPill.to)"
              class="block"
            />
          </div>

          <div v-if="operationAction" class="fx-public-action__actions">
            <UButton
              size="xs"
              :color="operationAction.color"
              variant="soft"
              :icon="operationAction.icon"
              :to="operationAction.to"
              @click="operationAction.onClick"
            >
              {{ operationAction.label }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:59 CEST — Repo Efficiency Pass 1 of 6: resolve operator App display through the ecosystem DTO boundary.
import { navigateTo } from '#imports'
import { computed } from 'vue'
import {
  useUser,
  useUserInterface,
} from 'fireux-core/runtime/composables/fireux/user/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppDetail } from 'fireux-core/runtime/composables/fireux/app/useAppDetail'
import { useKitchenConsoleSelection } from '../../../composables/fireux/console/kitchen/core/useKitchenConsoleSelection'
import { useKitchenConsoleTargetCollection } from '../../../composables/fireux/console/kitchen/index/useKitchenConsoleTargetCollection'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { PublicActionButton } from 'fireux-core/runtime/composables/fireux/app/ui/usePublicActionPanel'

const props = defineProps<{
  kitchen?: KitchenSurface | null
}>()

const { pill } = useUserInterface()
const { currentUser, isAdmin } = useUser()
const { appId } = useFireUXConfig()
const currentAppId = computed(() => String(appId || '').trim())
const operatorAppId = computed(() =>
  String(props.kitchen?.console?.app_id || currentAppId.value).trim()
)
const isTenantConsoleHandoff = computed(() =>
  Boolean(operatorAppId.value && operatorAppId.value !== currentAppId.value)
)
const { app: operatorApp } = useAppDetail(operatorAppId)
const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const { kitchens: consoleTargets } = useKitchenConsoleTargetCollection()
const consoleKitchen = computed(() =>
  consoleTargets.value.find(kitchen => kitchen.id === kitchenId.value) || null
)
const hasConsoleAccess = computed(() => Boolean(consoleKitchen.value))
const subjectUserPill = computed(() =>
  hasConsoleAccess.value ? pill(currentUser.value) : null
)
const operatorAppName = computed(() =>
  String((operatorApp.value as any)?.app_short_name || (operatorApp.value as any)?.app_name || '').trim()
)
const panelDescription = computed(() =>
  hasConsoleAccess.value && isTenantConsoleHandoff.value
    ? `This kitchen is managed from the ${operatorAppName.value || 'tenant'} app console.`
    : hasConsoleAccess.value
    ? 'You have operator access for this kitchen console.'
    : 'This kitchen has no operators yet. Make a console to manage menus, orders, team, and stations.'
)
const subjectLabel = computed(() =>
  hasConsoleAccess.value ? 'Signed in as' : ''
)
const accessBadgeLabel = computed(() =>
  hasConsoleAccess.value ? 'Operator' : 'No operators'
)
const accessBadgeColor = computed(() =>
  hasConsoleAccess.value ? 'primary' : 'neutral'
)
const accessIcon = computed(() =>
  hasConsoleAccess.value ? 'i-lucide-key-round' : 'i-lucide-users-round'
)
const canActivateConsole = computed(() =>
  Boolean(isAdmin.value && !isTenantConsoleHandoff.value)
)
const showPanel = computed(() =>
  Boolean(hasConsoleAccess.value || canActivateConsole.value)
)
const consolePath = '/console/kitchen'
const consoleCreatePath = `${consolePath}/create`
const consoleCreateTo = computed(() =>
  kitchenId.value
    ? `${consoleCreatePath}?existingRootId=${encodeURIComponent(kitchenId.value)}`
    : consoleCreatePath
)
const operatorAppOrigin = computed(() =>
  normalizeOrigin(
    (operatorApp.value as any)?.social_links?.website ||
      (operatorApp.value as any)?.website
  )
)
const operationTo = computed(() =>
  hasConsoleAccess.value
    ? isTenantConsoleHandoff.value
      ? operatorAppOrigin.value
        ? `${operatorAppOrigin.value}${consolePath}`
        : ''
      : consolePath
    : canActivateConsole.value
      ? consoleCreateTo.value
      : ''
)
const operationLabel = computed(() =>
  hasConsoleAccess.value && isTenantConsoleHandoff.value
    ? `Open ${operatorAppName.value || 'tenant'} console`
    : hasConsoleAccess.value
    ? 'Open console'
    : 'Make console'
)
const operationAction = computed<PublicActionButton | null>(() =>
  operationTo.value
    ? {
        label: operationLabel.value,
        to: operationTo.value,
        icon: hasConsoleAccess.value
          ? 'i-lucide-panel-right-open'
          : 'i-lucide-key-round',
        color: hasConsoleAccess.value ? 'neutral' as const : 'primary' as const,
        onClick:
          hasConsoleAccess.value && !isTenantConsoleHandoff.value
            ? selectConsoleKitchen
            : undefined,
      }
    : null
)
const { setKitchenConsoleSelection } = useKitchenConsoleSelection()

async function selectConsoleKitchen(event: MouseEvent) {
  if (!hasConsoleAccess.value || !kitchenId.value) return
  if (isTenantConsoleHandoff.value) return

  event.preventDefault()
  setKitchenConsoleSelection({
    kitchenId: kitchenId.value,
  })

  await navigateTo(consolePath)
}

function normalizeOrigin(value: unknown) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
}
</script>
