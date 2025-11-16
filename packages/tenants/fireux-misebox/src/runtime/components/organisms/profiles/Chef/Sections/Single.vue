<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreProfile?.title || 'Chef' }}</h2>
      </template>

      <div class="space-y-4">
        <MiseProfilesChefCardsPill v-if="pill" :chef="pill" class="max-w-md" />

        <pre class="text-xs whitespace-pre-wrap">{{ pill }}</pre>
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

defineProps<{
  coreProfile: ChefProfile | null | undefined
  appProfile?: Partial<ChefProfile> | null | undefined
  pill: ChefCard.Pill | null
}>()
</script>
