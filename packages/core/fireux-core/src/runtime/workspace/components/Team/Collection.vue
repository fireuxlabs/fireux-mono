<template>
  <section class="space-y-4" aria-label="Team collection">
    <header class="workspace-panel-header">
      <h2 class="fx-type-card-title">{{ title || 'Team' }}</h2>
      <UButton
        icon="i-lucide-plus"
        label="Add person"
        :disabled="!available"
        @click="openCreate()"
      />
    </header>
    <slot />
    <WorkspaceTeamCrudCreate
      v-model:open="createOpen"
      :initial-name="createName"
      :create="primitives.create"
      :available="available"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TeamContext } from '../../composables/useWorkspaceTeam'
const props = defineProps<{ title?: string; team: TeamContext }>()
const { derived, primitives } = props.team
const available = computed(
  () => derived.value.capability.primitives.create.available
)
const createOpen = ref(false)
const createName = ref('')
function openCreate(name = '') {
  createName.value = name
  createOpen.value = true
}
defineExpose({ openCreate })
</script>
