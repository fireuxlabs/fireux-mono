<template>
  <UPageCard
    v-if="hasSurface"
    title="Kitchen people"
    description="Who owns, operates, and works with this kitchen."
    variant="subtle"
  >
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="space-y-3 rounded-lg border border-default bg-default p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shield-check" class="size-4 text-muted" />
            <div class="text-sm font-semibold text-highlighted">Admin</div>
          </div>
          <UBadge v-if="claimedBy" color="success" variant="soft">
            Claimed
          </UBadge>
        </div>

        <UserCardsPill
          v-if="ownerCard"
          v-bind="ownerCard"
          :show-badges="false"
          :link="Boolean(ownerCard.to)"
        />
        <p v-else class="text-sm text-dimmed">
          {{ claimedBy ? 'Admin user loading.' : 'No admin claimed yet.' }}
        </p>
      </div>

      <div class="space-y-3 rounded-lg border border-default bg-default p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-key-round" class="size-4 text-muted" />
            <div class="text-sm font-semibold text-highlighted">Operators</div>
          </div>
          <UBadge color="neutral" variant="soft">
            {{ operatorIds.length }}
          </UBadge>
        </div>

        <div v-if="operatorCards.length" class="grid gap-2">
          <UserCardsPill
            v-for="card in operatorCards"
            :key="card.id"
            v-bind="card"
            :show-badges="false"
            :link="Boolean(card.to)"
          />
        </div>
        <p v-else class="text-sm text-dimmed">No workspace operators listed.</p>
      </div>

      <div class="space-y-3 rounded-lg border border-default bg-default p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users-round" class="size-4 text-muted" />
            <div class="text-sm font-semibold text-highlighted">Team</div>
          </div>
          <UBadge color="neutral" variant="soft">
            {{ visibleTeamMembers.length }}
          </UBadge>
        </div>

        <div v-if="visibleTeamMembers.length" class="space-y-2">
          <div
            v-for="member in visibleTeamMembers"
            :key="member.id"
            class="rounded-lg bg-muted/40 px-3 py-2"
          >
            <div class="truncate text-sm font-medium text-highlighted">
              {{ memberDisplayName(member) }}
            </div>
            <div v-if="memberRole(member)" class="truncate text-xs text-dimmed">
              {{ memberRole(member) }}
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-dimmed">No kitchen team listed.</p>
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — User raw-list cutoff: hydrate only selected Kitchen operator UIDs.
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSessionRead } from 'fireux-core/runtime/user/composables/useUserSessionRead'
import { useUserHydration } from 'fireux-core/runtime/user/composables/firestore/fetch/useUserCollection'
import {
  useUserInterface,
  type UserCard,
} from 'fireux-core/runtime/user/composables/useUserInterface'
import { useKitchenRead } from '../../composables/firestore/useKitchen'
import { useKitchenChildCollection } from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import {
  resolveKitchenScopeCollectionPath,
  ROOT_KITCHEN_COLLECTION_PATH,
} from '../../composables/firestore/utils/paths/useKitchenChildCollection'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import {
  KitchenTeamMemberStorage,
  type KitchenTeamMember,
} from '../../utils/team.ts'

const props = defineProps<{
  kitchen?: KitchenSurface | null
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const { appId } = useFireUXConfig()
const currentAppId = computed(() => clean(appId))
const kitchenId = computed(() => clean(props.kitchen?.id))
const claimedBy = computed(() => clean(props.kitchen?.claimed_by))
const ownerRead = useUserSessionRead(claimedBy)
const { pill } = useUserInterface()
const ownerCard = computed(() => pill(ownerRead.user.value))
const operatorAppId = computed(() => clean(props.kitchen?.management_app_id))
const operatorCollectionPath = computed(() =>
  operatorAppId.value
    ? resolveKitchenScopeCollectionPath(operatorAppId.value)
    : ROOT_KITCHEN_COLLECTION_PATH
)
const { kitchen: operatorKitchen } = useKitchenRead(kitchenId, {
  collectionPath: operatorCollectionPath,
  hydrate: false,
})
const operatorSource = computed(
  () =>
    (operatorKitchen.value || props.kitchen || {}) as Record<string, unknown>
)
const operatorIds = computed(() =>
  uniqueStrings(operatorSource.value.operator_ids)
)
const { userById: operatorUserById } = useUserHydration(operatorIds)
const { items: teamMembers } = useKitchenChildCollection<KitchenTeamMember>(
  KitchenTeamMemberStorage.collection,
  kitchenId,
  {
    kitchenCollectionPath: operatorCollectionPath,
  }
)
const operatorCards = computed<UserCard[]>(() =>
  operatorIds.value
    .map((id) => pill(operatorUserById(id)))
    .filter((card): card is UserCard => Boolean(card))
)
const visibleTeamMembers = computed(() =>
  teamMembers.value
    .filter((member) => member.active !== false && member.status !== 'inactive')
    .sort((left, right) => {
      const byOrder = sortOrder(left) - sortOrder(right)
      if (byOrder) return byOrder
      return memberDisplayName(left).localeCompare(memberDisplayName(right))
    })
    .slice(0, 6)
)
const hasSurface = computed(() =>
  Boolean(
    kitchenId.value ||
      claimedBy.value ||
      operatorIds.value.length ||
      visibleTeamMembers.value.length ||
      currentAppId.value
  )
)

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map(clean).filter(Boolean)))
}

function sortOrder(member: KitchenTeamMember) {
  const value = Number(member.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

function memberDisplayName(member: KitchenTeamMember) {
  return (
    clean(member.display_name || member.name || member.user_id) || 'Team member'
  )
}

function memberRole(member: KitchenTeamMember) {
  return clean(member.role || member.station || member.shift_label)
}
</script>
