<template>
  <section
    v-if="clientReady && isAuthenticated && canCreate"
    aria-label="Kitchen tools"
  >
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
import { computed, onMounted, ref } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()
const clientReady = ref(false)
onMounted(() => {
  clientReady.value = true
})
const consoleRoot = useConsole('kitchen')
const canCreate = computed(() => consoleRoot.canCreateTarget())
</script>
