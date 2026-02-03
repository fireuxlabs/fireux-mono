<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <p v-if="isMounted" class="mb-2 text-xs text-muted">Page loaded.</p>
      <div class="mb-3 flex flex-wrap gap-2">
        <UButton
          v-if="isAdmin && userId"
          size="xs"
          color="primary"
          icon="i-lucide-shield"
          :to="`/users/admin/${userId}`"
        >
          Admin
        </UButton>
        <UButton
          v-if="isSelf"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          to="/dashboard/user-profile"
        >
          Edit
        </UButton>
      </div>
      <OrganismsUserCardsProfile v-if="userCard" v-bind="userCard" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserFetch } from '../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const route = useRoute()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const userId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const { user: currentUser } = useUserFetch(userId)
const { isAdmin, user: sessionUser } = useUser()

const { card } = useUserInterface(currentUser)
const userCard = computed(() => (currentUser.value ? card(currentUser.value) : null))
const isSelf = computed(() =>
  Boolean(userId.value && sessionUser.value?.id === userId.value)
)

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
