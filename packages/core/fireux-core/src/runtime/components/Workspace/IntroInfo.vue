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
        <WorkspaceCapabilityInfo />
        <section>
          <h3 class="font-semibold">Data and scope</h3>
          <p>{{ intro.data }}</p>
          <p v-if="intro.recordCount !== undefined" class="text-sm text-muted">
            {{ intro.recordCount }} records · {{ intro.status }}
          </p>
        </section>
        <section>
          <h3 class="font-semibold">Boundaries</h3>
          <p>{{ intro.boundaries }}</p>
        </section>
        <section v-if="intro.tools?.length">
          <h3 class="font-semibold">Tools</h3>
          <dl class="grid gap-3">
            <div v-for="tool in intro.tools" :key="tool.id">
              <dt class="font-medium">
                {{ tool.label }}
                <UBadge
                  v-if="tool.available !== undefined"
                  :color="tool.available ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                  >{{ tool.available ? 'Available' : 'Unavailable' }}</UBadge
                >
              </dt>
              <dd>{{ tool.description }}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3 class="font-semibold">AI</h3>
          <p>{{ intro.ai }}</p>
        </section>
      </div></template
    >
    <template #footer
      ><UButton
        label="Copy page JSON"
        :disabled="!pageState"
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
import { useWorkspaceNav } from '../../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspacePageState } from '../../composables/fireux/workspace/useWorkspacePageState'
defineProps<{
  intro: {
    title: string
    purpose: string
    data: string
    boundaries: string
    ai: string
    status?: string
    recordCount?: number
    tools?: readonly {
      id: string
      label: string
      description: string
      available?: boolean
    }[]
  }
}>()
const { state: pageState, copy: copyPage } = useWorkspacePageState(
  useWorkspaceNav().currentWorkspace.value
)
const open = ref(false)
const toast = useToast()
async function copy() {
  try {
    await copyPage()
    toast.add({ title: 'Page JSON copied', color: 'success' })
  } catch {
    toast.add({
      title: 'Copy failed',
      description: 'The browser did not allow clipboard access.',
      color: 'error',
    })
  }
}
</script>
