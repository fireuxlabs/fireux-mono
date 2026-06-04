<template>
  <UCard class="border-primary/30 bg-primary/5 ring-1 ring-primary/20">
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <UBadge color="primary" variant="soft">
          Claim
        </UBadge>
      </div>

      <div class="flex items-start gap-3">
        <UAvatar
          icon="i-lucide-shield-check"
          size="md"
          class="bg-primary/10 text-primary"
        />

        <div class="min-w-0 flex-1 space-y-3">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold">
              Is this your {{ entityLowerLabel }}?
            </h2>
            <p class="text-sm leading-6 text-muted">
              {{ panelCopy }}
            </p>
          </div>

          <div
            v-if="claim.claimedUserPill || claim.isClaimed"
            class="flex flex-wrap items-center gap-2"
          >
            <span class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Claimed by
            </span>
            <UserCardsPill
              v-if="claim.claimedUserPill"
              v-bind="claim.claimedUserPill"
              :show-subtitle="false"
              :link="Boolean(claim.claimedUserPill.to)"
            />
            <UBadge v-else color="success" variant="soft">
              Claimed
            </UBadge>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="showClaimAction"
              size="xs"
              color="primary"
              variant="soft"
              :loading="claim.isClaiming"
              :disabled="claim.isClaiming"
              @click="claim.onClaim"
            >
              {{ claimLabel }}
            </UButton>
            <UButton
              v-if="showManageAction"
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-pencil"
              :to="claim.editTo"
            >
              {{ manageLabel }}
            </UButton>
          </div>

          <div v-if="claim.consoleActions?.length" class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Consoles
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
              v-for="action in claim.consoleActions"
                :key="action.to"
                size="xs"
                color="primary"
                variant="soft"
                :icon="action.icon || 'i-lucide-plus'"
                :to="action.to"
              >
                {{ action.label }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { computed } from 'vue'

type ClaimConsoleAction = {
  label: string
  to: string
  icon?: string
}

type EntityClaimState = {
  claimedUserPill?: UserCard.Card | null
  isClaimed?: boolean
  canClaim?: boolean
  isClaiming?: boolean
  canEdit?: boolean
  editTo?: string
  consoleActions?: ClaimConsoleAction[]
  onClaim?: () => void | Promise<void>
}

const props = withDefaults(
  defineProps<{
    entityLabel: string
    claim?: EntityClaimState
    claimLabel?: string
    manageLabel?: string
    claimedCopy?: string
    unclaimedCopy?: string
  }>(),
  {
    claim: () => ({}),
    claimLabel: 'Claim this record',
    manageLabel: 'Edit details',
    claimedCopy: '',
    unclaimedCopy: '',
  }
)

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'record').trim().toLowerCase()
)

const claim = computed<EntityClaimState>(() => props.claim || {})
const showClaimAction = computed(() => claim.value.canClaim && !claim.value.isClaimed)
const showManageAction = computed(() => claim.value.canEdit && Boolean(claim.value.editTo))

const panelCopy = computed(() => {
  if (claim.value.isClaimed) {
    return props.claimedCopy || `This ${entityLowerLabel.value} is linked to an owner.`
  }

  return (
    props.unclaimedCopy ||
    `Claim this ${entityLowerLabel.value} to manage its public details.`
  )
})
</script>
