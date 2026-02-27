<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[handle].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="isSelf"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          to="/console/user-profile"
        >
          Edit
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody class="pagebody">
      <UserCardsProfile v-if="userCard" v-bind="userCard" :user="currentUser" />
      <UAlert
        v-else-if="isLoadingProfile"
        color="neutral"
        variant="subtle"
        title="Loading profile"
        description="Searching for this user..."
      />
      <UAlert
        v-else-if="missing"
        color="amber"
        title="User not found"
        description="This handle does not exist or is not linked yet."
      />
      <DevJson
        v-if="isDev && currentUser"
        :title="'User (Doc)'"
        context="User public page · users/[handle] · handle -> uid -> user doc"
        :data="currentUser"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead } from '#imports'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserByHandleFetch } from '../../composables/fireux/firestore/core/user/fetch/useUserByHandleFetch'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const route = useRoute()

const handle = computed(() => {
  const raw = Array.isArray(route.params.handle)
    ? route.params.handle[0]
    : route.params.handle
  return String(raw ?? '').trim() || null
})

const {
  user: currentUser,
  uid,
  canonicalUid,
  shouldSuggestCanonicalUid,
  handle: normalizedHandle,
  pending,
  resolving,
  missing,
} = useUserByHandleFetch(handle)
const { user: sessionUser } = useUser()

watch(
  () => normalizedHandle.value,
  async (next) => {
    if (!next) return
    const current = String(handle.value || '')
    if (current && current !== next) {
      await navigateTo(`/users/${next}`, { replace: true })
    }
  },
  { immediate: true }
)

watch(
  () => canonicalUid.value,
  async (next) => {
    if (!next) return
    await navigateTo(`/users/${next}`, { replace: true })
  },
  { immediate: true }
)

const { card } = useUserInterface(currentUser)
const userCard = computed(() => (currentUser.value ? card(currentUser.value) : null))
const isLoadingProfile = computed(() => Boolean(resolving.value || pending.value))
const isSelf = computed(() =>
  Boolean(uid.value && sessionUser.value?.id === uid.value)
)

const displayName = computed(() => currentUser.value?.display_name ?? null)
const pageTitle = computed(() =>
  displayName.value ?? (normalizedHandle.value ? `@${normalizedHandle.value}` : 'User')
)
const pageDescription = computed(() =>
  displayName.value
    ? `Public profile for ${displayName.value}.`
    : shouldSuggestCanonicalUid.value
      ? 'Redirecting to canonical user id...'
      : 'Public user profile.'
)
const isDev = import.meta.dev

const headTitle = computed(() =>
  displayName.value ? `${displayName.value} · User` : 'User'
)

useHead({ title: headTitle })
</script>
