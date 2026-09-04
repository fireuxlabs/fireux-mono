<template>
  <div class="space-y-3 rounded-lg bg-muted/30 p-3">
    <div>
      <div class="text-sm font-medium text-highlighted">Operators</div>
      <p class="text-xs text-dimmed">{{ description }}</p>
    </div>

    <div v-if="pending" class="text-sm text-dimmed">Loading operators...</div>

    <div v-else-if="operatorCards.length" class="grid gap-2 sm:grid-cols-2">
      <UserCardsPill
        v-for="card in operatorCards"
        :key="card.id"
        v-bind="card"
        :show-badges="false"
        :link="Boolean(card.to)"
      />
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-user-round-x"
      title="No operators listed"
      description="This kitchen can be selected, but no operator users are listed on the selected kitchen yet."
    />
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — User raw-list cutoff: hydrate only selected Kitchen operator UIDs.
import { computed } from 'vue'
import { useUserHydration } from 'fireux-core/runtime/user/composables/firestore/fetch/useUserCollection'
import {
  useUserView,
  type UserCard,
} from 'fireux-core/runtime/user/composables/useUserView'

const props = defineProps<{
  operatorIds?: string[]
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const operatorIds = computed(() =>
  Array.from(new Set((props.operatorIds ?? []).map(normalize).filter(Boolean)))
)
const { userById, pending } = useUserHydration(operatorIds)
const { pill } = useUserView()
const operatorCards = computed<UserCard[]>(() =>
  operatorIds.value
    .map((id) => pill(userById(id)))
    .filter((card): card is UserCard => Boolean(card))
)
const description = computed(() =>
  operatorIds.value.length
    ? 'Users listed in operator_ids can write and operate this selected kitchen.'
    : 'Operator access is stored on the selected kitchen.'
)
</script>
