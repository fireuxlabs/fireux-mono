<template>
  <UPage>
    <UPageBody>
      <UserDetail v-if="user" :user="user" />
      <DevDebugPanel
        title="User detail acquisition"
        context="Canonical User fetched by the detail route."
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
import { useRouteParam } from '../../../composables/shared/useRouteParam'
import { useUserDetail } from '../../../user/composables/useUserDetail'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View User details.',
})

const handle = useRouteParam('handle')
const { user, ready } = useUserDetail(handle)

await ready
</script>
