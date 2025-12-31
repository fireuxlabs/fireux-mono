<template>
  <ClientOnly>
    <div class="profile-page">
      <div v-if="loading" class="py-10 text-sm opacity-70">Loading profile…</div>

      <div v-else-if="!profile" class="space-y-2">
        <h1 class="text-lg font-semibold">Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/agents" class="text-primary hover:underline">← Back</NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-if="canEdit">
          <UButton
            icon="i-lucide-pencil"
            size="md"
            color="primary"
            variant="solid"
            @click="navigateTo('/dashboard/agent/profile')"
          >
            Edit Profile
          </UButton>
        </div>

        <OrganismsProfilesAgentCardsProfile :agent="profile" />
      </div>
    </div>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading profile…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { agentConfig } from '../../models/profiles/Agent/Agent.model'
import { computed } from 'vue'
import { navigateTo, useHead, useRoute, useSeoMeta } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

useSeoMeta({
  title: 'Agent Profile',
  description: 'View agent profile',
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? raw[0] : String(raw || '')

const { user } = useUser()
const appUser = computed(() => user.value?.appUser)

const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId ? await firestoreFetchDoc(agentConfig.collectionName, docId) : null
const profile = computed<any>(() => (rawDoc as any)?.value ?? rawDoc ?? null)
const loading = computed(() => !rawDoc && !!docId)

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
    profile.value ? `${resolveName(profile.value)} - Agent Profile` : 'Agent Profile'
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
