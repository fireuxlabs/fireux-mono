<template>
  <UPage>
    <UPageBody>
      <UserDetail v-if="user" :user="user" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from '../../../composables/shared/useRouteParam'
import { useUserDetail } from '../../../user/composables/useUserDetail'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View a user profile.',
  name: 'UserDetailPage',
})

const handle = useRouteParam('handle')
const { user, ready } = useUserDetail(handle)

await ready
</script>
