<template>
  <ConsoleEntityCTA
    title="Project console"
    console-to="/console/projects"
    demo-label="Demo Projects"
    learn-more-to="/projects/learn-more"
  >
    <template #demoNote>
      <li>Uses bundled project demo scenarios only.</li>
    </template>

    <template #demo>
      <div v-if="scenarioCards.length" class="space-y-2">
        <ProjectCardsPill
          v-for="item in scenarioCards"
          :key="item.id"
          v-bind="item"
          :link="false"
          :action="true"
          :show-badges="false"
          class="cursor-pointer"
          @action="openScenario(item.id)"
        />
      </div>
      <p v-else class="text-sm text-dimmed">
        No demo projects.
      </p>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Project operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </ConsoleEntityCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { getDemoProjectScenarioList } from '~/composables/console/project/demo-scenarios'
import { useProjectSelection } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectSelection'

const router = useRouter()
const { setRuntimeProject } = useProjectSelection()

const scenarioCards = computed(() =>
  getDemoProjectScenarioList().map((entry) => ({
    id: String(entry.id || '').trim(),
    title: String(entry.name || '').trim(),
    subtitle: String(entry.label || '').trim(),
    imageUrl: String(entry.image_url || '').trim(),
    badges: [],
  }))
)

const openScenario = async (projectId: string) => {
  const resolvedId = String(projectId || '').trim()
  if (!resolvedId) return

  setRuntimeProject({ projectId: resolvedId, mode: 'demo' })
  await router.push('/console/projects')
}
</script>
