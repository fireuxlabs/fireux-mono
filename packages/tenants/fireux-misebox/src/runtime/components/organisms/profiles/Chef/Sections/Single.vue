<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <MiseProfilesChefCardsPill v-if="pill" :chef="pill" class="max-w-md" />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No chef profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import type {
  ChefProfile,
  ChefCard,
} from '../../../../../models/profiles/Chef.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

defineProps<{
  coreProfile: ChefProfile | null | undefined
  appProfile?: Partial<ChefProfile> | null | undefined
  pill: ChefCard.Pill | null
}>()

const { coreUser } = useUser()
</script>
