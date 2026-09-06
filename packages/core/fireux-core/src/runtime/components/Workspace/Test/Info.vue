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
            {{ context.collection.records.length }} records ·
            {{ context.derived.status }}
          </p>
        </section>

        <section v-for="section in sections" :key="section.key">
          <h3 class="font-semibold">{{ section.label }}</h3>
          <pre class="overflow-auto text-xs">{{
            JSON.stringify(context[section.key], null, 2)
          }}</pre>
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
import { useRoute, useToast } from '#imports'
import type { TestPacket, useTest } from '../../../composables/fireux/useTest'
import { useTestAI } from '../../../composables/fireux/useTestAI'
type Test = ReturnType<typeof useTest>
const props = defineProps<{
  context: {
    workspace: { id: string }
    collection: { records: TestPacket[] }
    selected: TestPacket | null
    derived: Test['derived']['value']
  }
}>()
const sections = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'collection', label: 'Collection' },
  { key: 'selected', label: 'Selected individual' },
  { key: 'derived', label: 'Derived' },
] as const
const route = useRoute()
const open = ref(false)
const copying = ref(false)
const toast = useToast()
const { description, tools } = useTestAI(() => props.context.derived)

async function copyContext() {
  if (copying.value) return
  copying.value = true
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          page: {
            path: route.path,
            workspace: props.context.derived.capability.id.split('.')[0],
          },
          state: props.context,
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
