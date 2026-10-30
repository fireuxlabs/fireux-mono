<template>
  <section class="fx-page-stack">
    <MenuExpressQueue @select="selected = $event" />
    <MenuExpressOperatorRequest
      v-if="selected"
      :key="selected"
      :request-id="selected"
    />
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
const { currentUser } = useAuth()
const selected = ref('')
watch(
  () => currentUser.value,
  () => {
    selected.value = ''
  },
  { flush: 'sync' }
)
</script>
