<template>
  <div class="space-y-3 rounded-lg bg-muted/30 p-3">
    <div>
      <div class="text-sm font-medium text-highlighted">Operators</div>
      <p class="text-xs text-dimmed">{{ description }}</p>
    </div>

    <div v-if="pending" class="text-sm text-dimmed">
      Loading operators...
    </div>

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
import { computed } from 'vue'
import { useUserCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserCollection'
import {
  useUserInterface,
  type UserCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { User } from 'fireux-core/runtime/models/core/user.model'

const props = defineProps<{
  operatorIds?: string[]
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const operatorIds = computed(() =>
  Array.from(new Set((props.operatorIds ?? []).map(normalize).filter(Boolean)))
)
const { users, pending } = useUserCollection()
const { pill } = useUserInterface()
const operatorCards = computed<UserCard.Card[]>(() =>
  operatorIds.value
    .map((id) => users.value.find((user: User) => normalize(user.id) === id) ?? null)
    .map((user: User | null) => pill(user))
    .filter((card): card is UserCard.Card => Boolean(card))
)
const description = computed(() =>
  operatorIds.value.length
    ? 'Users listed in operator_ids can write and operate this selected kitchen.'
    : 'Operator access is stored on the selected kitchen.'
)
</script>
