<template>
  <ConsoleEntityCTA
    title="Project console"
    my-label="My Project"
    test-label="Test Project"
    read-only-label="Read-only Projects"
    learn-more-to="/projects/learn-more"
  >
    <template #my>
          <ProjectCardsPill
            v-if="liveProjectCard"
            :to="''"
            :title="liveProjectCard.title"
            :subtitle="liveProjectCard.subtitle"
            :badges="liveProjectCard.badges"
            :action="true"
            @action="goToProject('live', liveProjectId)"
          />
          <UButton
            v-else
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-plus"
            @click="goToProject('live', liveProjectId)"
          >
            Create project
          </UButton>
    </template>

    <template #test>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-flask-conical"
            @click="goToProject('test')"
          >
            Open test project
          </UButton>
    </template>

    <template #readOnly>
          <div v-if="readOnlyScenarios.length" class="space-y-2">
            <ProjectCardsPill
              v-for="item in readOnlyScenarios"
              :key="item.id"
              :to="''"
              :title="item.name"
              :subtitle="item.label"
              :image-url="item.image_url"
              :link="false"
              :action="true"
              @action="goToProject('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only projects.
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
import ConsoleEntityCTA from 'fireux-core/runtime/components/entities/console/ConsoleEntityCTA.vue'
import { getReadOnlyProjectScenarioList } from 'fireux-core/runtime/composables/fireux/app/runtime-project/read-only-scenarios/index'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'
import { useRuntimeProject } from 'fireux-core/runtime/composables/fireux/app/runtime-project/useRuntimeProject'
import type { RuntimeMode } from 'fireux-core/runtime/composables/fireux/runtime/runtime.types'
import ProjectCardsPill from './Cards/Pill.vue'

const router = useRouter()
const runtimeProject = useRuntimeProject()
const liveProject = useRuntimeProject({
  mode: 'live',
  projectId: runtimeProject.firebaseProjectId,
})
const { setRuntimeProject } = useRuntimeProjectSelection()

const readOnlyScenarios = computed(() => getReadOnlyProjectScenarioList())
const liveProjectId = computed(() =>
  String(liveProject.id.value || liveProject.firebaseProjectId.value || '').trim()
)
const liveProjectCard = computed(() => {
  if (!liveProject.hasDoc.value) return null

  return {
    title: String(liveProject.name.value || 'Project').trim(),
    subtitle: liveProjectId.value,
    badges: [String((liveProject.doc.value as any)?.status || 'active').trim()],
  }
})

const goToProject = async (mode: RuntimeMode, projectId?: string) => {
  const fallback = String(
    projectId ||
    liveProjectId.value ||
    runtimeProject.id.value ||
    runtimeProject.firebaseProjectId.value ||
    ''
  ).trim()
  const resolvedId = fallback
  setRuntimeProject({ projectId: resolvedId, mode })
  await router.push('/console/projects/overview')
}
</script>
