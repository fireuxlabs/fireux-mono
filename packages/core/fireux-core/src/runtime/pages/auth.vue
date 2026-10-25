<template>
  <div class="page">
    <UContainer class="auth-page">
      <section v-if="isTenant" class="tenant-brand">
        <div class="tenant-brand__stack" :aria-label="`${appName} brand`">
          <AppBrandLogo
            size="large"
            :alt="`${appName} icon`"
            class="tenant-brand__icon"
          />
          <AppBrandWordmark size="large" class="tenant-brand__wordmark" />
        </div>
      </section>
      <FireAuthSystem />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useFireUXConfig } from '../app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'auth'
})

const { appName, isTenant } = useFireUXConfig()

</script>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
}

.auth-page {
  max-width: 520px;
  margin: 0 auto;
  padding: calc(var(--spacing) * 6) calc(var(--spacing) * 4);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
  flex: 1;
}

@media (min-width: 640px) {
  .auth-page {
    padding: calc(var(--spacing) * 12) calc(var(--spacing) * 6);
  }
}

.tenant-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tenant-brand__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.tenant-brand__icon {
  height: 48px;
  width: 48px;
  border-radius: calc(var(--ui-radius) * 4);
  object-fit: contain;
}

@media (min-width: 640px) {
  .tenant-brand__icon {
    height: 56px;
    width: 56px;
  }
}

.tenant-brand__wordmark {
  height: 32px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

@media (min-width: 640px) {
  .tenant-brand__wordmark {
    height: 38px;
  }
}
</style>
