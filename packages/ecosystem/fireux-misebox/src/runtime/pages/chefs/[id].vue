<template>
  <ClientOnly>
    <div class="profile-page">
      <div v-if="loading" class="py-10 text-sm opacity-70">Loading profile…</div>

      <div v-else-if="!profile" class="space-y-2">
        <MoleculesProfilesAdminCreateCard
          v-if="isAdminUser"
          title="Chef profile not available"
          description="Create a chef profile for this user."
          :button-label="chefConfig.cta || 'Create Chef profile'"
          :loading="isCreating"
          :error="createError"
          @create="createProfile"
        />

        <div v-else>
          <h1 class="text-lg font-semibold">Profile Not Found</h1>
          <p>The profile you're looking for doesn't exist.</p>
          <NuxtLink to="/chefs" class="text-primary hover:underline">← Back</NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="profile && isAdminUser && docId"
            icon="i-lucide-shield"
            size="md"
            color="primary"
            variant="solid"
            :to="`/chefs/admin/${docId}`"
          >
            Admin
          </UButton>
          <UButton
            v-if="profile && isSelf"
            icon="i-lucide-pencil"
            size="md"
            color="neutral"
            variant="soft"
            @click="navigateTo('/dashboard/chef/profile')"
          >
            Edit
          </UButton>
        </div>

        <OrganismsProfilesChefCardsProfile :chef="profile" />
      </div>
    </div>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading profile…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute, useSeoMeta } from '#imports'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, ref } from 'vue'
import { chefConfig } from '../../models/profiles/Chef/Chef.model.ts'

useSeoMeta({
  title: 'Chef Profile',
  description: 'View chef profile',
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? raw[0] : String(raw || '')

const { user, coreUser, appUser } = useUser()

const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId ? await firestoreFetchDoc(chefConfig.collectionName, docId) : null
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
    profile.value ? `${resolveName(profile.value)} - Chef Profile` : 'Chef Profile'
  ),
})

const isSelf = computed(() =>
  Boolean(docId && user.value?.id === docId)
)

const isAdminUser = computed(() =>
  appUser.value?.role === 'admin' ||
  Boolean(coreUser.value?.adminOf?.length)
)

const { ensure } = useProfileEnsure(chefConfig)
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createProfile = async () => {
  if (isCreating.value || !docId) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(docId)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create profile.'
  } finally {
    isCreating.value = false
  }
}
</script>
