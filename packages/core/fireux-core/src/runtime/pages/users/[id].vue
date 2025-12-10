<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsUserPreview :user="currentUser" :compact="false" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useRoute } from 'vue-router'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts'

const route = useRoute()

const userId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const { user: currentUser } = useUserFetch(userId)

const displayName = computed(() => currentUser.value?.display_name ?? null)
const pageTitle = computed(() => displayName.value ?? 'User Details')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value}, their overlays, and related users.`
    : 'Inspect the selected user, their overlays, and related users.'
)

const headTitle = computed(() =>
  displayName.value ? `${displayName.value} · User` : 'User Details'
)

useHead({ title: headTitle })
</script>
