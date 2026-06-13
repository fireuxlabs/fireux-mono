<template>
  <UPageCard
    title="Operators"
    :description="description"
    variant="subtle"
  >
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

    <DevFireuxDebugPanel
      title="Kitchen operators"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserCollection'
import {
  useUserInterface,
  type UserCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'

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
    .map((id) => users.value.find((user) => normalize(user.id) === id) ?? null)
    .map((user) => pill(user))
    .filter((card): card is UserCard.Card => Boolean(card))
)
const missingOperatorIds = computed(() => {
  const found = new Set(operatorCards.value.map((card) => card.id))
  return operatorIds.value.filter((id) => !found.has(id))
})
const description = computed(() =>
  operatorIds.value.length
    ? 'Users listed in operator_ids can write and operate this selected kitchen.'
    : 'Operator access is stored on the selected kitchen.'
)
const debug = computed(() => ({
  operatorIds: operatorIds.value,
  visibleOperators: operatorCards.value.map((card) => ({
    id: card.id,
    displayName: card.displayName,
    handle: card.handle,
  })),
  missingOperatorIds: missingOperatorIds.value,
  pending: pending.value,
}))
</script>
