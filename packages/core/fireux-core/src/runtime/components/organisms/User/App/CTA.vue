<template>
  <div class="appuser-cta">
    <p v-if="hasApp">✅ You’re a member of {{ appName }}.</p>
    <p v-else>❌ Not yet a member of {{ appName }}.</p>

    <div class="cta-buttons">
      <UButton v-if="!hasApp" size="lg" color="primary" to="/auth">
        Sign in to Join {{ appName }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../../../composables/firestore/user/useUser'
import { useFireUXConfig } from '../../../../composables/FireUXConfig'

const { appName } = useFireUXConfig()
const { user } = useUser()
const hasApp = computed(() => !!user.value?.app)
</script>

<style scoped>
.appuser-cta {
  display: grid;
  gap: 0.75rem;
}
.cta-buttons {
  margin-top: 0.5rem;
}
</style>
