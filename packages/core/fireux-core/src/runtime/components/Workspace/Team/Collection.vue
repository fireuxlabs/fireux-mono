<template>
  <section class="space-y-4" aria-label="Team collection">
    <header class="flex items-center justify-between gap-3">
      <h2 class="font-semibold">Team</h2>
      <UButton
        icon="i-lucide-plus"
        label="Create"
        size="sm"
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
    <UCard v-if="available">
      <template #header
        ><h3 class="font-semibold">Add team member</h3></template
      >
      <WorkspaceTeamCrudCreatePerson
        :create="primitives.create"
        @created="created"
      />
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TeamContext } from '../../../composables/fireux/useTeam'
const props = defineProps<{ team: TeamContext }>()
const { derived, primitives } = props.team
const available = computed(
  () => derived.value.capability.primitives.create.available
)
const createOpen = ref(false)
const createName = ref('')
const toast = useToast()
function openCreate(name = '') {
  createName.value = name
  createOpen.value = true
}
function created() {
  toast.add({ title: 'Team member added', color: 'success' })
}
defineExpose({ openCreate })
</script>
