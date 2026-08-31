<template>
  <CoreUserDetail :user="user" />
  <KitchenUserMemberships :user="user" />
  <KitchenAdminProvision :user="user" />
</template>

<script setup lang="ts">
import CoreUserDetail from 'fireux-core/runtime/user/components/Detail.vue'
import type { User } from 'fireux-core/runtime/user/models/user.model'

defineOptions({ name: 'MiseboxUserDetail' })

defineProps<{
  user: User
}>()
</script>
