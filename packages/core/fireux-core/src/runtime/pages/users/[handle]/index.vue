<template>
  <UPage>
    <UPageBody>
      <UserDetail v-if="user" :user="user" />
      <MoleculesStateCard
        v-else-if="outcome === 'pending'"
        entity="user"
        kind="document"
        loading
      />
      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="user"
        kind="document"
        state="error"
      />
      <MoleculesStateCard
        v-else-if="outcome === 'missing'"
        entity="user"
        kind="document"
        state="missing"
      />
      <DiagnosticsDebugPanel
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
import { useUserDirectoryDetail } from '../../../user/composables/useUserDirectoryDetail'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View User details.',
})

const handle = useRouteParam('handle')
const source = useUserDirectoryDetail(handle)
const user = source.user
const outcome = source.outcome
</script>
