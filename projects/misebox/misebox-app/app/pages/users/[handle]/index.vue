<template>
  <UPage>
    <UPageBody>
      <UserDetail v-if="user" :user="user" />
      <DevDebugPanel
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
import { useUserDetail } from 'fireux-core/runtime/user/composables/useUserDetail'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View User details.',
})

const handle = useRouteParam('handle')
const { user, ready } = useUserDetail(handle)

await ready
</script>
