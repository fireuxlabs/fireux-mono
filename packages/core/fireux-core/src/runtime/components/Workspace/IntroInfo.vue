<template>
  <UButton
    icon="i-lucide-info"
    color="neutral"
    variant="ghost"
    :aria-label="`About ${intro.title}`"
    @click="open = true"
  />
  <UModal
    v-model:open="open"
    :title="`About ${intro.title}`"
    :description="intro.purpose"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body
      ><div class="grid gap-5">
        <section>
          <h3 class="font-semibold">Data and scope</h3>
          <p>{{ intro.data }}</p>
        </section>
        <section>
          <h3 class="font-semibold">Boundaries</h3>
          <p>{{ intro.boundaries }}</p>
        </section>
        <section>
          <h3 class="font-semibold">AI</h3>
          <p>{{ intro.ai }}</p>
        </section>
      </div></template
    >
    <template #footer
      ><UButton
        label="Copy introduction context"
        icon="i-lucide-copy"
        color="neutral"
        variant="soft"
        @click="copy"
    /></template>
  </UModal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'
const props = defineProps<{
  intro: {
    title: string
    purpose: string
    data: string
    boundaries: string
    ai: string
  }
}>()
const open = ref(false)
const toast = useToast()
async function copy() {
  try {
    await navigator.clipboard.writeText(
      JSON.stringify({ layer: 0, intro: props.intro }, null, 2)
    )
    toast.add({ title: 'Introduction context copied', color: 'success' })
  } catch {
    toast.add({
      title: 'Copy failed',
      description: 'The browser did not allow clipboard access.',
      color: 'error',
    })
  }
}
</script>
