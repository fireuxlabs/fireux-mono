<template>
  <UCard class="fx-card fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge color="primary" variant="soft">
          Operator
        </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          icon="i-lucide-key-round"
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

          <div v-if="operatorUserPill" class="fx-public-action__subject">
            <span class="fx-public-action__label">{{ operatorLabel }}</span>
            <UserCardsPill
              v-bind="operatorUserPill"
              :show-badges="false"
              :link="Boolean(operatorUserPill.to)"
              class="block"
            />
          </div>

          <div v-if="manageAction" class="fx-public-action__actions">
            <UButton
              size="xs"
              :color="manageAction.color"
              variant="soft"
              :icon="manageAction.icon"
              :to="manageAction.to"
              @click="manageAction.onClick"
            >
              {{ manageAction.label }}
            </UButton>
          </div>

          <div v-if="groups.length" class="fx-public-action__groups">
            <div
              v-for="group in groups"
              :key="group.label"
              class="fx-public-action__group"
            >
              <p class="fx-public-action__label">
                {{ group.label }}
              </p>
              <div class="fx-public-action__chips">
                <UBadge
                  v-for="item in group.items"
                  :key="item"
                  :color="group.color"
                  variant="soft"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import {
  useUser,
  useUserFetch,
  useUserInterface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/useKitchen'
import { resolveKitchenScopeCollectionPath } from '../../../composables/fireux/firestore/kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsoleSelection } from '../../../composables/fireux/console/kitchen/core/useKitchenConsoleSelection'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import {
  visiblePublicActionGroups,
  type PublicActionButton,
  type PublicActionGroup,
} from 'fireux-core/runtime/composables/fireux/app/ui/usePublicActionPanel'

const props = defineProps<{
  kitchen?: KitchenSurface | null
}>()

const aligned = ['Identity', 'Recipe', 'Ingredient', 'Dish']
const notAligned = [
  'Menu',
  'Supplier',
  'Mise',
  'Order',
  'Team',
  'Station',
]

const claimedBy = computed(() => String(props.kitchen?.claimed_by ?? '').trim())
const { user: ownerUser } = useUserFetch(claimedBy)
const { pill } = useUserInterface()
const { currentUser, isAdmin } = useUser()
const { appId } = useFireUXConfig()
const currentAppId = computed(() => String(appId || '').trim())
const operatorAppId = computed(() =>
  String(props.kitchen?.app_scope_app_id || currentAppId.value).trim()
)
const isTenantConsoleHandoff = computed(() =>
  Boolean(operatorAppId.value && operatorAppId.value !== currentAppId.value)
)
const { app: operatorApp } = useAppFetch(operatorAppId)
const currentUserId = computed(() => String(currentUser.value?.id ?? '').trim())
const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const operatorCollectionPath = computed(() =>
  operatorAppId.value ? resolveKitchenScopeCollectionPath(operatorAppId.value) : ''
)
const { kitchen: consoleKitchen } = useKitchenFetch(kitchenId, {
  collectionPath: operatorCollectionPath,
  hydrate: false,
})
const hasConsoleAccess = computed(() =>
  targetHasOperator(consoleKitchen.value, currentUserId.value)
)
const operatorUserPill = computed(() =>
  hasConsoleAccess.value
    ? pill(currentUser.value)
    : pill(ownerUser.value)
)
const operatorAppName = computed(() =>
  String((operatorApp.value as any)?.app_short_name || (operatorApp.value as any)?.app_name || '').trim()
)
const panelDescription = computed(() =>
  hasConsoleAccess.value && isTenantConsoleHandoff.value
    ? `This kitchen is managed from the ${operatorAppName.value || 'tenant'} app console.`
    : hasConsoleAccess.value
    ? 'You have operator access for this kitchen console.'
    : 'Operators manage menus, recipes, ingredients, and kitchen work from the kitchen console.'
)
const operatorLabel = computed(() =>
  hasConsoleAccess.value ? 'Signed in as' : 'Operator'
)
const canEdit = computed(() =>
  Boolean(
    hasConsoleAccess.value ||
      isAdmin.value ||
      (claimedBy.value && currentUserId.value === claimedBy.value)
  )
)
const isAdminEdit = computed(() =>
  Boolean(
    isAdmin.value &&
      !hasConsoleAccess.value &&
      (!claimedBy.value || currentUserId.value !== claimedBy.value)
  )
)
const editLocator = computed(() =>
  String(props.kitchen?.slug || props.kitchen?.id || '').trim()
)
const consolePath = '/console/kitchen'
const operatorAppOrigin = computed(() =>
  normalizeOrigin(
    (operatorApp.value as any)?.social_links?.website ||
      (operatorApp.value as any)?.website
  )
)
const editTo = computed(() =>
  hasConsoleAccess.value
    ? isTenantConsoleHandoff.value
      ? operatorAppOrigin.value
        ? `${operatorAppOrigin.value}${consolePath}`
        : ''
      : consolePath
    : editLocator.value
      ? `/kitchens/${encodeURIComponent(editLocator.value)}/edit`
      : ''
)
const manageLabel = computed(() =>
  hasConsoleAccess.value && isTenantConsoleHandoff.value
    ? `Open ${operatorAppName.value || 'tenant'} console`
    : hasConsoleAccess.value
    ? 'Open console'
    : 'Edit kitchen'
)
const manageAction = computed<PublicActionButton | null>(() =>
  canEdit.value && editTo.value
    ? {
        label: isAdminEdit.value ? 'Admin Edit' : manageLabel.value,
        to: editTo.value,
        icon: isAdminEdit.value
          ? 'i-lucide-shield-check'
          : 'i-lucide-pencil',
        color: isAdminEdit.value ? 'warning' as const : 'neutral' as const,
        onClick: selectConsoleKitchen,
      }
    : null
)
const groups = computed<PublicActionGroup[]>(() =>
  visiblePublicActionGroups([
    {
      label: 'Aligned',
      items: aligned,
      color: 'primary' as const,
    },
    {
      label: 'Not aligned yet',
      items: notAligned,
      color: 'neutral' as const,
    },
  ])
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
