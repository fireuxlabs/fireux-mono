<template>
  <UContainer class="mx-auto max-w-lg py-12"
    ><UCard
      ><div class="space-y-4">
        <h1 class="text-xl font-semibold">Continue with FireUX</h1>
        <p v-if="busy" role="status">Opening FireUX…</p>
        <UAlert
          variant="subtle"
          v-if="error"
          color="error"
          title="Shared sign-in is unavailable"
          :description="error"
        /><MoleculesCopyError v-if="error" :message="error" /><UButton
          v-if="error"
          label="Try again"
          @click="start"
        /><UButton
          :to="authPath"
          variant="ghost"
          color="neutral"
          label="Use usual Misebox sign-in"
        /></div></UCard
  ></UContainer>
</template>
<script setup lang="ts">
import { resolvePostAuthDestination } from 'fireux-core/runtime/utils/onboarding-route'
import { onMounted } from 'vue'
definePageMeta({ layout: 'auth' })
useHead({
  title: 'Continue with FireUX',
  meta: [
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
})
const route = useRoute()
const authPath = computed(
  () =>
    `/auth?redirect=${encodeURIComponent(resolvePostAuthDestination(route.query.redirect))}`
)
const { start, busy, error } = useFireuxSignIn()
onMounted(start)
</script>
