<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
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
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <p v-if="isMounted" class="mb-2 text-xs text-muted">Page loaded.</p>
      <MoleculesStateCard
        v-if="!pending && !resolvedUser"
        entity="user"
        kind="document"
        title="User Not Found"
        description="No user exists for this handle."
      />
      <UserCardsProfile v-else-if="userCard" v-bind="userCard" />
      <DevJson
        v-if="isDev && resolvedUser"
        :title="'User (Doc)'"
        context="User detail page · u/[handle] · user doc"
        :data="resolvedUser"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead } from '#imports'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useUserByHandleFetch } from '../../composables/fireux/firestore/core/user/fetch/useUserByHandleFetch'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const route = useRoute()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const routeHandle = computed(() => {
  const raw = Array.isArray(route.params.handle)
    ? route.params.handle[0]
    : route.params.handle
  return String(raw ?? '').trim() || null
})

const { user: resolvedUser, uid, handle, pending } = useUserByHandleFetch(routeHandle)
watch(
  [routeHandle, handle],
  async ([rawHandle, normalizedHandle]) => {
    if (!rawHandle || !normalizedHandle) return
    if (rawHandle === normalizedHandle) return
    await navigateTo(`/u/${normalizedHandle}`, { replace: true })
  },
  { immediate: true }
)
const userId = computed(() => uid.value)
const { isAdmin, user: sessionUser } = useUser()

const { card } = useUserInterface(resolvedUser)
const userCard = computed(() => (resolvedUser.value ? card(resolvedUser.value) : null))
const isSelf = computed(() =>
  Boolean(userId.value && sessionUser.value?.id === userId.value)
)

const displayName = computed(() => resolvedUser.value?.display_name ?? null)
const pageTitle = computed(() => displayName.value ?? 'User Details')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value}, their overlays, and related users.`
    : 'Inspect the selected user, their overlays, and related users.'
)
const isDev = import.meta.dev

const headTitle = computed(() =>
  displayName.value ? `${displayName.value} · User` : 'User Details'
)

useHead({ title: headTitle })
</script>
