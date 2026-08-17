<template>
  <section v-if="isAuthenticated && canCreate" aria-label="Kitchen tools">
    <UButton
      to="/console/kitchen/create"
      label="Create Kitchen"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()
const consoleRoot = useConsole('kitchen')
const canCreate = computed(() => consoleRoot.canCreateTarget())
</script>
