<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="space-y-6">
      <OrganismsUserSectionsSingle :user-id="userId" :compact="false" />
      <OrganismsUserSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useRoute } from 'vue-router'
import { useUserFetch } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'

const route = useRoute()

const userId = computed(() => {
  const param = route.params.id
  const raw = Array.isArray(param) ? param[0] ?? '' : param?.toString() ?? ''
  const value = raw.trim()
  return value.length ? value : null
})

const { coreUser } = useUserFetch(userId)

const currentUser = computed(() => coreUser.value ?? null)

const pageTitle = computed(
  () => currentUser.value?.display_name ?? 'User Details'
)
const pageDescription = computed(() =>
  currentUser.value?.display_name
    ? `Inspect ${currentUser.value.display_name}, their overlays, and related users.`
    : 'Inspect the selected user, their overlays, and related users.'
)

useHead({
  title: computed(() =>
    currentUser.value?.display_name
      ? `${currentUser.value.display_name} · User`
      : 'User Details'
  ),
})
</script>
