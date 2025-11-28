<template>
  <div class="page">
    <UContainer class="layout">
      <section class="brand-panel">
        <div class="brand-stack" :aria-label="`${appName} brand`">
          <img :src="brandIcon" :alt="`${appName} icon`" class="brand-icon" />
          <img
            :src="brandWordmark"
            :alt="`${ecosystemLabel} wordmark`"
            class="brand-wordmark"
          />
        </div>
        <p class="brand-tagline">
          Sign in with your {{ ecosystemLabel }} credentials to access
          {{ appName }}.
        </p>
      </section>

      <OrganismsAuthSystem />

      <p class="footnote">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../composables/FireUXConfig'
import { useBrandAssets } from '../composables/brand/useBrandAssets'

const { appName, ecosystem } = useFireUXConfig()
const {
  iconSrc: brandIcon,
  ecosystemWordmarkSrc,
  wordmarkSrc: fallbackWordmark,
} = useBrandAssets()

const ecosystemLabel = computed(() => ecosystem || 'FireUX')
const brandWordmark = computed(
  () => ecosystemWordmarkSrc.value || fallbackWordmark.value
)

const useHeadFn = (globalThis as any).useHead as
  | undefined
  | ((payload: {
      title: string
      meta: Array<{ name: string; content: string }>
    }) => void)

useHeadFn?.({
  title: `Sign In - ${appName}`,
  meta: [
    {
      name: 'description',
      content: `Sign in to your ${appName} account to access all features and manage your profile.`,
    },
  ],
})

definePageMeta({
  layout: 'default',
  title: 'Authentication',
  icon: 'i-lucide-lock',
})
</script>

<style scoped>
.layout {
  max-width: 520px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
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

.brand-tagline {
  font-size: 1rem;
  color: var(--ui-text-600, #475569);
}

.footnote {
  text-align: center;
  font-size: 0.875rem;
  color: var(--ui-text-muted, #6b7280);
}
</style>
