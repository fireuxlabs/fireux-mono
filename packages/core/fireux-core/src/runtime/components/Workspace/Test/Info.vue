<template>
  <UButton
    icon="i-lucide-info"
    color="neutral"
    variant="ghost"
    aria-label="About Test"
    @click="open = true"
  />
  <UModal
    v-model:open="open"
    title="About Test"
    :description="description.purpose"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <div class="grid gap-5">
        <section>
          <h3 class="font-semibold">Data and scope</h3>
          <p>{{ description.data }}</p>
          <p class="text-sm text-muted">
            {{ state.tests.length }} records · {{ derived.status }}
          </p>
        </section>

        <section>
          <h3 class="font-semibold">Boundaries</h3>
          <p>{{ description.boundaries }}</p>
        </section>
        <section>
          <h3 class="font-semibold">AI</h3>
          <p>{{ description.ai }}</p>
        </section>
        <section>
          <h3 class="font-semibold">Tools</h3>
          <dl class="grid gap-4">
            <div v-for="tool in tools" :key="tool.id">
              <dt class="font-medium">
                {{ tool.label }}
                <UBadge
                  size="sm"
                  :color="tool.available ? 'success' : 'neutral'"
                  variant="subtle"
                  >{{ tool.available ? 'Available' : 'Unavailable' }}</UBadge
                >
              </dt>
              <dd class="text-sm text-muted">{{ tool.description }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
    <template #footer>
      <UButton
        label="Copy capability context"
        icon="i-lucide-copy"
        color="neutral"
        variant="soft"
        :loading="copying"
        @click="copyContext"
      />
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'
import type { useTest } from '../../../composables/fireux/workspace/useTest'
import { useTestAI } from '../../../composables/fireux/workspace/useTestAI'
type Test = ReturnType<typeof useTest>
const props = defineProps<{
  state: Test['state']['value']
  derived: Test['derived']['value']
}>()
const open = ref(false)
const copying = ref(false)
const toast = useToast()
const { description, tools } = useTestAI(() => props.derived)

async function copyContext() {
  if (copying.value) return
  copying.value = true
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          id: props.derived.capability.id,
          ...description,
          status: props.derived.status,
          recordCount: props.state.tests.length,
          tools: tools.value,
        },
        null,
        2
      )
    )
    toast.add({
      title: 'Capability context copied',
      icon: 'i-lucide-clipboard-check',
      color: 'success',
    })
  } catch {
    toast.add({
      title: 'Copy failed',
      description: 'The browser did not allow clipboard access.',
      color: 'error',
    })
  } finally {
    copying.value = false
  }
}
</script>
