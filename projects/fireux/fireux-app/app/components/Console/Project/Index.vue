<!-- ConsoleProject.vue -->
<template>
  <section class="space-y-6">
    <UAlert
      v-if="!liveProjects.length"
      color="neutral"
      variant="soft"
      title="No live projects found"
      description="No live FireUX projects are currently available in this workspace."
    />

    <div v-if="liveProjects.length" class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            {{ project ? 'Selected Project' : 'Select a project' }}
          </div>

          <UButton
            v-if="project"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </div>

        <ProjectCardsPill
          v-if="project"
          v-bind="project"
          :link="false"
          :show-badges="false"
        />

        <p v-else class="text-sm text-dimmed">
          Choose a project below to load it into the console.
        </p>
      </div>

      <ProjectCollectionManager
        :collection="liveProjects"
        title="Choose Project"
        description="Select the live project you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="selectProject"
      />
    </div>

    <section v-if="demoProjects.length" class="w-full max-w-xl space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-default/60" />
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Or</div>
        <div class="h-px flex-1 bg-default/60" />
      </div>

      <div class="space-y-2">
        <div class="text-sm font-medium text-highlighted">Try a project simulation</div>

        <USwitch
          v-model="showSimulations"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Show project simulations"
        />
      </div>

      <div v-if="showSimulations" class="space-y-2">
        <div class="text-sm text-dimmed">
          Read-only demo projects wired into the same console stack.
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <UButton
            v-for="scenario in demoProjects"
            :key="scenario.id"
            color="neutral"
            variant="soft"
            class="justify-between"
            @click="selectDemoProject(scenario.id)"
          >
            <span>{{ scenario.name }}</span>
            <span class="text-xs text-dimmed">{{ scenario.label }}</span>
          </UButton>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProjectConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsoleIndex'

const {
  project,
  liveProjects,
  demoProjects,
  clearSelection,
  selectProject,
  selectDemoProject,
} = useProjectConsoleIndex({ publishHeader: true })

const showSimulations = ref(false)
</script>