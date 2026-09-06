<template>
  <div
    class="grid items-start gap-4 md:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)]"
  >
    <UPageGrid aria-label="Team tools" class="grid-cols-1 gap-4">
      <UPageCard
        :as="derived.capability.primitives.create.available ? 'button' : 'div'"
        :title="createTool.label"
        :description="createTool.description"
        :icon="createTool.icon"
        class="text-left"
        :class="{
          'opacity-50': !derived.capability.primitives.create.available,
        }"
        :ui="{
          container: 'p-4 sm:p-4',
          title: 'line-clamp-2',
          description: 'line-clamp-3',
        }"
        :spotlight="derived.capability.primitives.create.available"
        @click="
          derived.capability.primitives.create.available && natives.openCreate()
        "
      />
    </UPageGrid>
    <section aria-label="Compound Team tools" class="space-y-3">
      <UCard class="border-primary/20 bg-primary/5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold">{{ kitchenTeamOnboarding.label }}</h3>
            <p class="text-sm text-muted">
              {{ kitchenTeamOnboarding.description }}
            </p>
          </div>
          <WorkspaceIntroInfo :intro="onboardInfo" />
        </div>
        <UButton
          class="mt-4"
          label="Enrol teammate"
          icon="i-lucide-user-round-plus"
          :disabled="!derived.capability.primitives.create.available"
          @click="emit('onboard')"
        />
      </UCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { kitchenTeamOnboarding } from '../../../models/team-onboarding'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useKitchenTeamTools } from '../../../composables/workspace/team/useKitchenTeamTools'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{ team: Workspace }>()
const { derived, natives } = props.team
const emit = defineEmits<{ onboard: [] }>()
const onboardInfo = computed(() => ({
  title: kitchenTeamOnboarding.label,
  purpose: kitchenTeamOnboarding.description,
  data: 'One person, their responsibility and an optional invitation link.',
  boundaries: kitchenTeamOnboarding.context,
  ai: 'AI prepares this same enrolment flow. You review and confirm it.',
  tools: [
    {
      id: kitchenTeamOnboarding.id,
      label: kitchenTeamOnboarding.label,
      description: kitchenTeamOnboarding.context,
      available: derived.value.capability.primitives.create.available,
    },
  ],
}))

const tools = useKitchenTeamTools()
const createTool = tools.find(
  (candidate) => candidate.id === 'kitchen.team.create-member'
)!
</script>
