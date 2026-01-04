<template>
  <ClientOnly>
    <div class="profile-page">
      <div v-if="loading" class="py-10 text-sm opacity-70">Loading profile…</div>

      <div v-else-if="!profile" class="space-y-2">
        <h1 class="text-lg font-semibold">Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/professionals" class="text-primary hover:underline">← Back</NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-if="canEdit">
          <UButton
            icon="i-lucide-pencil"
            size="md"
            color="primary"
            variant="solid"
            @click="navigateTo('/dashboard/professional/profile')"
          >
            Edit Profile
          </UButton>
        </div>

        <OrganismsProfilesProfessionalCardsProfile
          v-if="professionalCard"
          :card="professionalCard"
        />
      </div>
    </div>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading profile…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { professionalConfig } from '../../models/profiles/Professional/Professional.model.ts'
import { computed, ref } from 'vue'
import { navigateTo, useHead, useRoute, useSeoMeta } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { ProfessionalProfile } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { useProfessionalInterface } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

useSeoMeta({
  title: 'Professional Profile',
  description: 'View professional profile',
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? raw[0] : String(raw || '')

const { user } = useUser()
const appUser = computed(() => user.value?.appUser)

const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId
  ? await firestoreFetchDoc(professionalConfig.collectionName, docId)
  : null
const profile = computed<any>(() => (rawDoc as any)?.value ?? rawDoc ?? null)
const loading = computed(() => !rawDoc && !!docId)

const { card } = useProfessionalInterface({
  coreProfile: ref<ProfessionalProfile | undefined | null>(null),
  appProfile: ref(null),
})

const professionalCard = computed(() =>
  profile.value ? card(profile.value as ProfessionalProfile) : null
)

const resolveName = (p: any) =>
  p?.display_name ||
  p?.name ||
  p?.title ||
  p?.agency_name ||
  p?.company_name ||
  p?.business_name ||
  p?.professional_name ||
  'Profile'

useHead({
  title: computed(() =>
    profile.value
      ? `${resolveName(profile.value)} - Professional Profile`
      : 'Professional Profile'
  ),
})

const canEdit = computed(
  () =>
    !!(
      appUser.value?.id &&
      profile.value?.id &&
      appUser.value.id === profile.value.id
    )
)
</script>
