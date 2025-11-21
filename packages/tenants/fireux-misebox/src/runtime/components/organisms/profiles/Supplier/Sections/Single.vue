<template>
  <div class="space-y-6">
    <UCard v-if="coreProfile">
      <template #header>
        <h2>{{ coreUser?.display_name || '-' }}</h2>
      </template>

      <div class="space-y-4">
        <OrganismsProfilesSupplierCardsCell
          v-if="cell"
          :supplier="cell"
          class="max-w-xl"
        />
        <OrganismsProfilesSupplierCardsPill
          v-if="pill"
          :supplier="pill"
          class="max-w-md"
        />
      </div>
    </UCard>

    <p v-else class="text-sm opacity-70">No supplier profile loaded.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  SupplierProfile,
  SupplierCard,
} from '../../../../../models/profiles/Supplier.model.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const props = defineProps<{
  coreProfile: SupplierProfile | null | undefined
  appProfile?: Partial<SupplierProfile> | null | undefined
  pill: SupplierCard.Pill | null
}>()

const { coreUser } = useUser()

const cell = computed<SupplierCard.Cell | null>(() => {
  const profile = props.coreProfile ?? null
  if (!profile) return null

  const tagline =
    profile.tagline ?? (profile as { subtitle?: string | null })?.subtitle ?? ''

  return {
    id: profile.id ?? profile.user?.id ?? 'supplier-profile',
    avatar: profile.user?.avatar ?? undefined,
    title: profile.user?.display_name ?? profile.title ?? 'Supplier',
    subtitle: tagline,
    tagline,
    badges: profile.badges ?? [],
    bio_short: profile.bio_short ?? null,
    specialties: profile.specialties ?? [],
    locations: profile.locations ?? [],
    to: profile.id ? `/suppliers/${profile.id}` : undefined,
  }
})
</script>
