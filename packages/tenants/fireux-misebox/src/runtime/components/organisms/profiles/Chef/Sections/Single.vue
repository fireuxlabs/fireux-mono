<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesChefCardsCell
          v-if="cell"
          :chef="cell"
          class="max-w-xl"
        />
        <OrganismsProfilesChefCardsPill
          v-if="pill"
          :chef="pill"
          class="max-w-md"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No chef profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  ChefProfile,
  ChefCard,
} from '../../../../../models/profiles/Chef.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const props = defineProps<{
  coreProfile: ChefProfile | null | undefined
  appProfile?: Partial<ChefProfile> | null | undefined
  pill: ChefCard.Pill | null
}>()

const { coreUser } = useUser()

const cell = computed<ChefCard.Cell | null>(() => {
  const profile = props.coreProfile ?? null
  if (!profile) return null

  return {
    id: profile.id ?? profile.user?.id ?? 'chef-profile',
    avatar: profile.user?.avatar ?? undefined,
    title: profile.user?.display_name ?? profile.title ?? 'Chef',
    subtitle: profile.subtitle ?? '',
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    locations: profile.locations ?? [],
    to: profile.id ? `/chefs/${profile.id}` : undefined,
  }
})
</script>
