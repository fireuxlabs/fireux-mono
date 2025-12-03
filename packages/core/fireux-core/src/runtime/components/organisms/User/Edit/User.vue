<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/Edit/User.vue -->
<template>
  <OrganismsProfileEditProfile>
    <template #core>
      <OrganismsUserEditCore :user="props.user" />
    </template>

    <template #app>
      <OrganismsUserEditApp :user="props.user" />
    </template>
  </OrganismsProfileEditProfile>
</template>

<script setup lang="ts">
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import OrganismsProfileEditProfile from 'fireux-core/runtime/components/organisms/Profile/Edit/Profile.vue'

const props = defineProps<{
  user: User | null
}>()
</script>
