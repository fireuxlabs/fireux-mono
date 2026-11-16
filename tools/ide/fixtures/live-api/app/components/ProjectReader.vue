<script setup lang="ts">
import { ref } from 'vue'
import { useProjectWorkspace } from 'fireux-projects/runtime/project/composables/workspace/useProjectWorkspace'
import { useProjectWorkspaceTeam } from 'fireux-projects/runtime/project/composables/workspace/useProjectWorkspaceTeam'
import { useProjectTeamSummary } from 'fireux-projects/runtime/project/composables/useProjectTeamSummary'
const workspace = useProjectWorkspace()
const team = useProjectWorkspaceTeam()
const summary = useProjectTeamSummary()
const { state } = team
const { members, error, pending } = summary
const outcome = workspace.outcome
const selectedId = workspace.id
const result = ref('')
async function create() {
  try {
    result.value = JSON.stringify(
      await team.primitives.create({ name: 'Created in browser' })
    )
  } catch (cause) {
    result.value = String(cause)
  }
}
</script>

<template>
  <section data-testid="project-team">
    <h2>{{ selectedId }}: {{ outcome }}</h2>
    <button @click="workspace.select('project-a')">Select Project A</button>
    <button @click="workspace.select('project-b')">Select Project B</button>
    <button @click="create">Create Team member</button>
    <p data-testid="team-command">{{ result }}</p>
    <p>Summary pending: {{ pending }}</p>
    <p v-if="error" data-testid="team-error">{{ String(error) }}</p>
    <p v-for="member in members" :key="member.id" data-testid="summary-member">
      {{ member.name }}
    </p>
    <p
      v-for="member in state.team.members"
      :key="member.id"
      data-testid="workspace-member"
    >
      {{ member.name }}
    </p>
  </section>
</template>
