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
            v-if="!showCellView && currentPill"
            :user="currentPill"
          />
          <OrganismsUserCardsCell v-else-if="currentCell" :user="currentCell" />
        </div>
      </template>

      <p v-else class="text-sm text-slate-500">No user loaded.</p>
    </section>

    <OrganismsUserCardsProfile
      v-if="showExtended && currentProfile"
      :user="currentProfile"
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

const { user: runtimeUser, pillProps, cellProps, profileProps } = useUser()

const current = computed<User | null>(() => props.user ?? runtimeUser.value ?? null)

const currentPill = computed<UserCard.Pill | null>(() => {
  if (!current.value) return null
  const pill = pillProps(current.value)
  return pill ? { ...pill } : null
})

const currentCell = computed<UserCard.Cell | null>(() => {
  if (!current.value) return null
  return cellProps(current.value)
})

const currentProfile = computed<UserCard.Profile | null>(() => {
  if (!current.value) return null
  return profileProps(current.value)
})

const showExtended = computed(() => !props.compact)

const showCellView = ref(false)
const toggleView = () => {
  showCellView.value = !showCellView.value
}
</script>
