<template>
  <KitchenCardsPill
    link
    to="/dashboard/kitchen"
    :title="chefLabel"
    subtitle="Test kitchen"
    :image-url="chefAvatarUrl"
    :show-badges="false"
  />
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'

const { user } = useUser()

const chefLabel = computed(() =>
  String(
    user.value?.display_name ||
      user.value?.handle ||
      'Chef'
  ).trim()
)

const chefAvatarUrl = computed(() =>
  String(user.value?.avatar || 'https://i.pravatar.cc/64?u=chef').trim()
)
</script>
