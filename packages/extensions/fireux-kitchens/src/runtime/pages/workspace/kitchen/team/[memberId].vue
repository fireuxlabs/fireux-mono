<template>
  <UDashboardPanel id="workspace-kitchen-team-member-detail">
    <template #header><WorkspaceNavbar title="Team member" /></template>
    <template #body>
      <UButton
        to="/workspace/kitchen/team"
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
      <KitchenTeam
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
import { useKitchenTeam } from '../../../../kitchen/composables/team/useKitchenTeam'
const route = useRoute()
const team = useKitchenTeam()
const memberId = computed(() => String(route.params.memberId || ''))
const member = computed(() =>
  team.state.value.team.members.find((member) => member.id === memberId.value)
)
definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
