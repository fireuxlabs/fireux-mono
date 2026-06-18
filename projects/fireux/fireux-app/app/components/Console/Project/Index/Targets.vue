<template>
  <section class="space-y-2">
    <pre>ConsoleProjectIndexTargets</pre>

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Choose Project</h2>
            <p>Select the Project console target you want to work on.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">Loading projects...</p>

      <div v-else-if="cards.length" class="space-y-3">
        <ProjectCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="false"
          action
          :show-badges="false"
          @action="selectProject(card.id)"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No Project targets found.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = withDefaults(
  defineProps<{
    collection?: ProjectSurface[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const consoleIds = computed(() =>
  props.collection
    .map((project) => String(project.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
const { cell } = useProjectInterface()
const cards = computed(() =>
  props.collection
    .map((project) => cell(project))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)

function selectProject(id: string) {
  const projectId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(projectId)) return
  emit('select', projectId)
}
</script>
