<template>
  <CoreUserDetail :user="user" />
  <KitchenUserMemberships :user="user" />
</template>

<script setup lang="ts">
import KitchenUserMemberships from 'fireux-kitchens/runtime/kitchen/components/Workspace/Team/UserMemberships.vue'
import CoreUserDetail from 'fireux-core/runtime/user/components/Detail/Index.vue'
import type { User } from 'fireux-core/runtime/user/models/user.model'

defineOptions({ name: 'MiseboxUserDetail' })

defineProps<{
  user: User
}>()
</script>
