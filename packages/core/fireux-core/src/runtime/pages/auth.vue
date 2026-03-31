<template>
  <div class="page">
    <UContainer class="auth-page">
      <section v-if="isTenant" class="tenant-brand">
        <div class="tenant-brand__stack" :aria-label="`${appName} brand`">
          <img
            :src="tenantIcon"
            :alt="`${appName} icon`"
            class="tenant-brand__icon"
          />
          <AppBrandWordmark size="large" class="tenant-brand__wordmark" />
        </div>
      </section>
      <AuthSystem />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { computed, definePageMeta } from '#imports'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'
import { useFireuxBrandAssets } from '../composables/fireux/app/useFireuxBrandAssets'

definePageMeta({
  layout: 'auth'
})

const { appName, isTenant } = useFireUXConfig()
const brandAssets = useFireuxBrandAssets()
const tenantIcon = computed(() => brandAssets.value.logo)

</script>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
}

.auth-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

@media (min-width: 640px) {
  .auth-page {
    padding: 3rem 1.5rem;
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
  gap: 0.5rem;
}

.tenant-brand__icon {
  height: 48px;
  width: 48px;
  border-radius: 16px;
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
