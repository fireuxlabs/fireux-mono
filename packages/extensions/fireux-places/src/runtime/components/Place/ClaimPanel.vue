<template>
  <UCard class="fx-card fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge color="primary" variant="soft">
          Claim
        </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          icon="i-lucide-shield-check"
          size="md"
          class="fx-public-action__avatar"
        />

        <div class="fx-public-action__content">
          <div class="fx-public-action__copy">
            <h2 class="fx-public-action__title">
              Is this your place?
            </h2>
            <p class="fx-public-action__description">
              {{ panelCopy }}
            </p>
          </div>

          <div v-if="claimState.isClaimed.value" class="fx-public-action__subject">
            <span class="fx-public-action__label">Claimed by</span>
            <UserCardsPill
              v-if="claimState.claimedUserPill.value"
              v-bind="claimState.claimedUserPill.value"
              :link="Boolean(claimState.claimedUserPill.value.to)"
              :show-badges="false"
              class="block"
            />
            <span v-else class="text-sm text-muted">Claimed</span>
          </div>

          <div v-if="actions.length" class="fx-public-action__actions">
            <UButton
              v-for="action in actions"
              :key="action.label"
              size="xs"
              :color="action.color || 'neutral'"
              :variant="action.variant || 'soft'"
              :icon="action.icon"
              :to="action.to"
              :loading="action.loading"
              :disabled="action.disabled"
              @click="action.onClick"
            >
              {{ action.label }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublicClaimPanel } from 'fireux-core/runtime/composables/fireux/app/ui/usePublicClaimPanel'
import type { PublicActionButton } from 'fireux-core/runtime/composables/fireux/app/ui/usePublicActionPanel'
import { usePlaceClaim } from '../../composables/fireux/firestore/place/mutations/usePlaceClaim'
import type { Place } from '../../models/place.model'

const props = defineProps<{
  place: Place | null
  id: string
  locator?: string
}>()

const { claimPlace } = usePlaceClaim()
const publicLocator = computed(() => {
  const current = String(props.locator ?? '').trim()
  const id = String(props.id ?? '').trim()
  const slug = String(props.place?.slug ?? '').trim()

  if (current && current !== id) return current
  return slug || id
})
const claimedBy = computed(() => String(props.place?.claimed_by ?? '').trim())
const editTo = computed(() =>
  publicLocator.value
    ? `/places/${encodeURIComponent(publicLocator.value)}/edit`
    : '/places'
)
const claimState = usePublicClaimPanel({
  id: computed(() => props.id),
  claimedBy,
  editTo,
  claim: claimPlace,
  claimedToast: 'Place claimed',
  failedToast: 'Failed to claim place',
})

const panelCopy = computed(() =>
  claimState.isClaimed.value
    ? 'This place is linked to an owner who can edit its public details.'
    : 'Claim this place to manage its public details.'
)

const actions = computed<PublicActionButton[]>(() => [
  ...(claimState.canClaim.value && !claimState.isClaimed.value
    ? [{
        label: 'Claim this place',
        color: 'primary' as const,
        loading: claimState.isClaiming.value,
        disabled: claimState.isClaiming.value,
        onClick: claimState.onClaim,
      }]
    : []),
  ...(claimState.canEdit.value && claimState.editTo.value
    ? [{
        label: claimState.isAdminEdit.value ? 'Admin Edit' : 'Edit place',
        to: claimState.editTo.value,
        icon: claimState.isAdminEdit.value
          ? 'i-lucide-shield-check'
          : 'i-lucide-pencil',
        color: claimState.isAdminEdit.value
          ? 'warning' as const
          : 'neutral' as const,
      }]
    : []),
  ...claimState.consoleActions.value.map((action) => ({
    label: action.label,
    to: action.to,
    icon: action.icon || 'i-lucide-plus',
    color: 'primary' as const,
  })),
])
</script>
