<template>
  <UDashboardPanel id="workspace-project-team-member-detail">
    <template #header>
      <WorkspaceProjectNav />
    </template>
    <template #body>
      <section class="workspace-surface workspace-surface--compact">
        <UButton
          to="/workspace/project/team"
          label="Back to Team"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          class="w-fit"
        />
        <template v-if="member">
          <p class="text-sm font-medium text-muted">Project Team member</p>
          <h1 class="text-2xl font-semibold text-highlighted">
            {{ member.name }}
          </h1>
          <UBadge color="neutral" variant="subtle" class="w-fit">
            {{ member.role }}
          </UBadge>
        </template>
        <USkeleton
          v-else-if="derived.status === 'loading'"
          class="h-24 w-full"
        />
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-lucide-file-question"
          title="Team member not found"
          description="Return to Project Team and choose an available member."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

const route = useRoute()
const { state, derived } = useProjectWorkspaceTeam()
const memberId = computed(() => String(route.params.memberId || ''))
const member = computed(() =>
  state.value.team.members.find((candidate) => candidate.id === memberId.value)
)

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'detail',
  visibility: { ecosystems: ['fireux'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
