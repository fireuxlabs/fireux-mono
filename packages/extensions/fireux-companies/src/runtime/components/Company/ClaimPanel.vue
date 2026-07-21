<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: let Nuxt UI own the public-action card root geometry. -->
<template>
  <UCard class="fx-card--public-action">
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
              Company Operations
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
import { usePlaceClaim } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceClaim'
import type { CompanyHydrated } from '../../composables/fireux/firestore/company/fetch/types'

const props = defineProps<{
  company: CompanyHydrated | null
  id: string
}>()

const { claimPlace } = usePlaceClaim()
const claimedBy = computed(() => String(props.company?.claimed_by ?? '').trim())
const editTo = computed(() =>
  props.id ? `/companies/${encodeURIComponent(props.id)}/edit` : '/companies'
)
const claimState = usePublicClaimPanel({
  id: computed(() => props.id),
  claimedBy,
  editTo,
  claim: claimPlace,
  claimedToast: 'Company record claimed',
  failedToast: 'Failed to claim company record',
})

const panelCopy = computed(() =>
  claimState.isClaimed.value
    ? 'This company is linked to a claimed place record.'
    : 'Claim the underlying place before treating this as an owned company record.'
)

const actions = computed<PublicActionButton[]>(() => [
  ...(claimState.canClaim.value && !claimState.isClaimed.value
    ? [{
        label: 'Claim this company',
        color: 'primary' as const,
        loading: claimState.isClaiming.value,
        disabled: claimState.isClaiming.value,
        onClick: claimState.onClaim,
      }]
    : []),
  ...(claimState.canEdit.value && claimState.editTo.value
    ? [{
        label: claimState.isAdminEdit.value ? 'Admin Edit' : 'Manage company',
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
