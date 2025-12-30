<template>
  <div class="space-y-6">
    <section class="space-y-4">
      <template v-if="current">
        <div class="flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ showCellView ? 'Show Pill' : 'Show Cell' }}
          </UButton>
        </div>

        <div class="space-y-4">
          <OrganismsUserCardsPill
            v-if="!showCellView && currentCard"
            :card="currentCard"
          />
          <OrganismsUserCardsCell v-else-if="currentCard" :card="currentCard" />
        </div>
      </template>

      <p v-else class="text-sm text-slate-500">No user loaded.</p>
    </section>

    <OrganismsUserCardsProfile
      v-if="showExtended && currentCard"
      :card="currentCard"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { User, UserCard } from '../../../../models/core/user.model'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser'

const props = withDefaults(
  defineProps<{ user?: User | null; compact?: boolean }>(),
  { compact: true }
)

const { user: runtimeUser, card } = useUser()

const current = computed<User | null>(() => props.user ?? runtimeUser.value ?? null)

const currentCard = computed<UserCard.Card | null>(() =>
  current.value ? card(current.value) : null
)

const showExtended = computed(() => !props.compact)

const showCellView = ref(false)
const toggleView = () => {
  showCellView.value = !showCellView.value
}
</script>
