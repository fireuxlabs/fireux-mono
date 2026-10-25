<template>
  <UPage>
    <UPageBody>
      <UserDetail v-if="user" :user="user" />
      <FireStateCard
        v-else-if="outcome === 'pending' || outcome === 'idle'"
        entity="User"
        kind="document"
        loading
      />
      <FireStateCard
        v-else-if="outcome === 'error'"
        entity="User"
        kind="document"
        state="error"
      />
      <FireStateCard v-else entity="User" kind="document" state="empty" />
      <FireDiagnosticsDebugPanel
        title="User detail acquisition"
        context="Canonical User fetched by the Misebox detail route."
        object-origin="fetched"
        :objects="{ user }"
        :derived="{ handle }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useUserDirectoryDetail } from 'fireux-core/runtime/user/composables/useUserDirectoryDetail'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View User details.',
})

const handle = useRouteParam('handle')
const { user, outcome } = useUserDirectoryDetail(handle)
</script>
