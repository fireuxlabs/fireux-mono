<template>
  <UDashboardPanel id="workspace-project-team-member-detail">
    <template #header><LayoutsWorkspaceNavbar title="Team member" /></template>
    <template #body>
      <UButton
        to="/workspace/project/team"
        label="Back to Team"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        class="w-fit"
      />
      <p v-if="team.derived.value.status === 'loading'" role="status">
        Loading person…
      </p>
      <UAlert
        v-else-if="team.derived.value.status === 'error'"
        color="error"
        title="Team could not be loaded"
      >
        <template #description><MoleculesCopyError message="Team could not be loaded" /></template>
      </UAlert>
      <WorkspaceProjectTeam
        v-else-if="member"
        :key="memberId"
        :team="team"
        :member-id="memberId"
      />
      <UAlert
        v-else
        color="neutral"
        title="Team member not found"
        description="Return to Team and choose an available person."
      />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useProjectTeam } from '../../../../project/composables/useProjectTeam'
const route = useRoute()
const team = useProjectTeam()
const memberId = computed(() => String(route.params.memberId || ''))
const member = computed(() =>
  team.state.value.team.members.find((member) => member.id === memberId.value)
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
