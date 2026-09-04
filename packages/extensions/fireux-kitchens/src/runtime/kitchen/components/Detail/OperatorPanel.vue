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
            <h2 class="fx-public-action__title">Kitchen Operations</h2>
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
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppRead } from 'fireux-core/runtime/app/composables/useAppRead'
import { useKitchenWorkspaceSelection } from '../../composables/workspace/core/useKitchenWorkspaceSelection'
import { useKitchenWorkspaceKitchens } from '../../composables/workspace/index/useKitchenWorkspaceKitchens'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import type { PublicActionButton } from 'fireux-core/runtime/composables/public/usePublicActionPanel'

const props = defineProps<{
  kitchen?: KitchenSurface | null
}>()

const { currentUser, isAdmin, pill } = useUserSession()
const { appId } = useFireUXConfig()
const currentAppId = computed(() => String(appId || '').trim())
const operatorAppId = computed(() =>
  String(props.kitchen?.management_app_id || currentAppId.value).trim()
)
const isTenantWorkspaceHandoff = computed(() =>
  Boolean(operatorAppId.value && operatorAppId.value !== currentAppId.value)
)
const { app: operatorApp } = useAppRead(operatorAppId)
const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const { kitchens: workspaceTargets } = useKitchenWorkspaceKitchens()
const workspaceKitchen = computed(
  () =>
    workspaceTargets.value.find((kitchen) => kitchen.id === kitchenId.value) ||
    null
)
const hasWorkspaceAccess = computed(() => Boolean(workspaceKitchen.value))
const subjectUserPill = computed(() =>
  hasWorkspaceAccess.value ? pill(currentUser.value) : null
)
const operatorAppName = computed(() =>
  String(operatorApp.value?.short_name || operatorApp.value?.name || '').trim()
)
const panelDescription = computed(() =>
  hasWorkspaceAccess.value && isTenantWorkspaceHandoff.value
    ? `This kitchen is managed from the ${operatorAppName.value || 'tenant'} app workspace.`
    : hasWorkspaceAccess.value
      ? 'You have operator access for this kitchen workspace.'
      : 'This kitchen has no operators yet. Make a workspace to manage menus, orders, team, and stations.'
)
const subjectLabel = computed(() =>
  hasWorkspaceAccess.value ? 'Signed in as' : ''
)
const accessBadgeLabel = computed(() =>
  hasWorkspaceAccess.value ? 'Operator' : 'No operators'
)
const accessBadgeColor = computed(() =>
  hasWorkspaceAccess.value ? 'primary' : 'neutral'
)
const accessIcon = computed(() =>
  hasWorkspaceAccess.value ? 'i-lucide-key-round' : 'i-lucide-users-round'
)
const canActivateWorkspace = computed(() =>
  Boolean(isAdmin.value && !isTenantWorkspaceHandoff.value)
)
const showPanel = computed(() =>
  Boolean(hasWorkspaceAccess.value || canActivateWorkspace.value)
)
const workspacePath = '/'
const workspaceCreatePath = `${workspacePath}/create`
const workspaceCreateTo = computed(() =>
  kitchenId.value
    ? `${workspaceCreatePath}?existingRootId=${encodeURIComponent(kitchenId.value)}`
    : workspaceCreatePath
)
const operatorAppOrigin = computed(() =>
  normalizeOrigin(
    (operatorApp.value as any)?.social_links?.website ||
      (operatorApp.value as any)?.website
  )
)
const operationTo = computed(() =>
  hasWorkspaceAccess.value
    ? isTenantWorkspaceHandoff.value
      ? operatorAppOrigin.value
        ? `${operatorAppOrigin.value}${workspacePath}`
        : ''
      : workspacePath
    : canActivateWorkspace.value
      ? workspaceCreateTo.value
      : ''
)
const operationLabel = computed(() =>
  hasWorkspaceAccess.value && isTenantWorkspaceHandoff.value
    ? `Open ${operatorAppName.value || 'tenant'} workspace`
    : hasWorkspaceAccess.value
      ? 'Open workspace'
      : 'Make workspace'
)
const operationAction = computed<PublicActionButton | null>(() =>
  operationTo.value
    ? {
        label: operationLabel.value,
        to: operationTo.value,
        icon: hasWorkspaceAccess.value
          ? 'i-lucide-panel-right-open'
          : 'i-lucide-key-round',
        color: hasWorkspaceAccess.value
          ? ('neutral' as const)
          : ('primary' as const),
        onClick:
          hasWorkspaceAccess.value && !isTenantWorkspaceHandoff.value
            ? selectWorkspaceKitchen
            : undefined,
      }
    : null
)
const { setKitchenWorkspaceSelection } = useKitchenWorkspaceSelection()

async function selectWorkspaceKitchen(event: MouseEvent) {
  if (!hasWorkspaceAccess.value || !kitchenId.value) return
  if (isTenantWorkspaceHandoff.value) return

  event.preventDefault()
  setKitchenWorkspaceSelection({
    kitchenId: kitchenId.value,
  })

  await navigateTo(workspacePath)
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
