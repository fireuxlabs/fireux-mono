<template>
  <div class="page">
    <UContainer class="layout">
      <section v-if="isTenant" class="brand-panel">
        <div class="brand-stack" :aria-label="`${appName} brand`">
          <img :src="tenantIcon" :alt="`${appName} icon`" class="brand-icon" />
          <img
            :src="tenantWordmark"
            :alt="`${appName} wordmark`"
            class="brand-wordmark"
          />
        </div>
      </section>

      <OrganismsAuthSystem />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'

const colorMode = useColorMode()
const { appName, isTenant } = useFireUXConfig()

const tenantIcon = '/img/app/logo.png'
const tenantWordmark = computed(() =>
  colorMode.value === 'dark'
    ? '/img/app/wordmark-dark.png'
    : '/img/app/wordmark-light.png'
)
</script>

<style scoped>
.layout {
  max-width: 520px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  height: 56px;
  width: 56px;
  border-radius: 16px;
  object-fit: contain;
}

.brand-wordmark {
  height: 38px;
  width: auto;
}
</style>
