<template>
  <ClientOnly>
    <UButton
      v-if="!isAuthenticated"
      :to="signInTo"
      label="Sign in"
      color="neutral"
      variant="ghost"
    />
    <LayoutsSharedRoleBadge interactive />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()

const signInTo = computed(() => '/auth')
</script>
