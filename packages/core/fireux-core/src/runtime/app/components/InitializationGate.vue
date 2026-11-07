<template>
  <ClientOnly>
    <UModal
      v-if="showSetup"
      :open="showSetup"
      :dismissible="false"
      title="App setup"
      description="This App needs to be initialized."
    >
      <template #body><AppInitializeSystem /></template>
    </UModal>
  </ClientOnly>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { useAppRead } from '../composables/useAppRead'
const config = useFireUXConfig()
const { exists } = useAppRead(config.appId)
const showSetup = computed(() => exists.value === false)
</script>
