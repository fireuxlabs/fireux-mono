<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/User.vue -->
<template>
  <LayoutsDashboardProfileEdit>
    <template #core>
      <OrganismsUserEditCore :user="props.user" />
    </template>

    <template #app>
      <OrganismsUserEditApp :user="props.user" />
    </template>
  </LayoutsDashboardProfileEdit>
</template>

<script setup lang="ts">
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'

const props = defineProps<{
  user: User | null
}>()
</script>
