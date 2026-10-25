<template>
  <UContainer class="mx-auto max-w-lg py-12"
    ><UCard
      ><div class="space-y-5">
        <template v-if="result"
          ><UIcon name="i-lucide-circle-check" class="size-10 text-success" />
          <h1 class="text-2xl font-semibold">Misebox connected</h1>
          <p>
            You can now use FireUX to sign into {{ result.localLabel }}. Your
            Misebox profile and access stay the same.
          </p>
          <UButton v-if="resume" :to="resume" label="Continue to Misebox" />
          <UButton :to="connectionsPath" label="View connected ecosystems"
        /></template>
        <template v-else
          ><h1 class="text-xl font-semibold">Finishing your connection</h1>
          <p v-if="busy" role="status">Confirming your accounts…</p>
          <UAlert
            variant="subtle"
            v-if="error"
            color="error"
            title="Connection could not be completed"
            :description="error" /><FireCopyError
            v-if="error"
            :message="error" /><UButton
            v-if="error"
            label="Try again"
            @click="complete" /><UButton
            :to="connectionsPath"
            variant="ghost"
            color="neutral"
            label="Back to connections"
        /></template></div></UCard
  ></UContainer>
</template>
<script setup lang="ts">
import { resolveConnectionResume } from 'fireux-fireux/runtime/user/utils/connection-resume'
import { ref, onMounted, watch } from 'vue'
import { useAccountConnectionAction } from 'fireux-core/runtime/user/composables/connections/useAccountConnectionAction'
definePageMeta({ layout: 'auth', requiresAuth: true })
useHead({
  title: 'Connect Misebox',
  meta: [
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
})
const route = useRoute()
const resume = computed(() => resolveConnectionResume(route.query.resume))
const connectionsPath = computed(() =>
  resume.value
    ? `/dashboard/connections?resume=${encodeURIComponent(resume.value)}`
    : '/dashboard/connections'
)
const { run, busy, error, currentUser } = useAccountConnectionAction(
  '/api/account/connection'
)
const result = ref<{ uid: string; ok: true; localLabel: string } | null>(null)
watch(
  () => currentUser.value?.uid,
  () => {
    result.value = null
  },
  { flush: 'sync' }
)
async function complete() {
  result.value = await run({ action: 'complete', request: route.query.request })
}
onMounted(complete)
</script>
