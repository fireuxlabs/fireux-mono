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
            v-if="claimState.claimedUserPill || claimState.isClaimed"
            class="space-y-2"
          >
            <span class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Claimed by
            </span>
            <div class="fx-claim-admin-user">
              <UserCardsPill
                v-if="claimState.claimedUserPill"
                v-bind="claimState.claimedUserPill"
                :show-badges="false"
                :link="Boolean(claimState.claimedUserPill.to)"
                class="block"
              />
              <span v-else class="text-sm text-muted">
                Claimed
              </span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="showClaimAction"
              size="xs"
              color="primary"
              variant="soft"
              :loading="claimState.isClaiming"
              :disabled="claimState.isClaiming"
              @click="claimState.onClaim"
            >
              {{ claimLabel }}
            </UButton>
            <UButton
              v-if="showManageAction"
              :class="{ 'fx-admin-edit-button': claimState.isAdminEdit }"
              size="xs"
              :color="claimState.isAdminEdit ? 'warning' : 'neutral'"
              variant="soft"
              :icon="claimState.isAdminEdit ? 'i-lucide-shield-check' : 'i-lucide-pencil'"
              :to="claimState.editTo"
            >
              {{ claimState.isAdminEdit ? adminManageLabel : manageLabel }}
            </UButton>
          </div>

          <div v-if="claimState.consoleActions?.length" class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Consoles
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="action in claimState.consoleActions"
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
import { computed, unref } from 'vue'

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
  isAdminEdit?: boolean
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
    adminManageLabel?: string
    claimedCopy?: string
    unclaimedCopy?: string
  }>(),
  {
    claim: () => ({}),
    claimLabel: 'Claim this record',
    manageLabel: 'Edit details',
    adminManageLabel: 'Admin Edit',
    claimedCopy: '',
    unclaimedCopy: '',
  }
)

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'record').trim().toLowerCase()
)

const claimState = computed<EntityClaimState>(() => {
  const source = props.claim || {}

  return {
    claimedUserPill: unref(source.claimedUserPill as any) ?? null,
    isClaimed: Boolean(unref(source.isClaimed as any)),
    canClaim: Boolean(unref(source.canClaim as any)),
    isClaiming: Boolean(unref(source.isClaiming as any)),
    canEdit: Boolean(unref(source.canEdit as any)),
    isAdminEdit: Boolean(unref(source.isAdminEdit as any)),
    editTo: String(unref(source.editTo as any) ?? '').trim(),
    consoleActions: unref(source.consoleActions as any) ?? [],
    onClaim: source.onClaim,
  }
})
const showClaimAction = computed(() => claimState.value.canClaim && !claimState.value.isClaimed)
const showManageAction = computed(() => claimState.value.canEdit && Boolean(claimState.value.editTo))

const panelCopy = computed(() => {
  if (claimState.value.isClaimed) {
    return props.claimedCopy || `This ${entityLowerLabel.value} is linked to an owner.`
  }

  return (
    props.unclaimedCopy ||
    `Claim this ${entityLowerLabel.value} to manage its public details.`
  )
})
</script>

<style scoped>
.fx-admin-edit-button {
  border-color: var(--fx-debug-yellow-border);
  background: var(--fx-debug-yellow-bg);
  color: var(--fx-fireux-yellow-muted);
}

.fx-claim-admin-user {
  display: block;
  max-width: 100%;
  width: min(100%, 260px);
}
</style>
