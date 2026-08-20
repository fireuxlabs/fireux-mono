<template>
  <section
    v-if="clientReady && isAuthenticated && canCreate"
    aria-label="Kitchen tools"
  >
    <UButton
      to="/workspace/kitchen/create"
      label="Create Kitchen"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()
const clientReady = ref(false)
onMounted(() => {
  clientReady.value = true
})
const workspaceRoot = useWorkspace('kitchen')
const canCreate = computed(() => workspaceRoot.canCreateTarget())
</script>
