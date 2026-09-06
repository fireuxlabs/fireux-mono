<template>
  <div>
    <section class="flex items-center gap-2" :aria-label="`${label} controls`">
      <UTabs
        v-if="items.length"
        :model-value="selectedMemberId"
        :items="items"
        :content="false"
        variant="link"
        size="sm"
        class="w-fit min-w-0 max-w-full overflow-x-auto"
        @update:model-value="team.natives.select(String($event))"
      />
      <UButton
        v-if="canCreate"
        class="shrink-0"
        icon="i-lucide-plus"
        color="neutral"
        variant="soft"
        size="sm"
        :aria-label="`Create ${label} member`"
        @click="createOpen = true"
      />
    </section>
    <WorkspaceTeamCrudCreate
      v-model:open="createOpen"
      :create="team.primitives.create"
      :available="canCreate"
      @created="team.natives.selectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TeamContext } from '../../../composables/fireux/useTeam'
const props = defineProps<{ label: string; team: TeamContext }>()
const createOpen = ref(false)
const selectedMemberId = computed(
  () => props.team.state.value.team.selectedTeamMemberId
)
const canCreate = computed(
  () => props.team.derived.value.capability.primitives.create.available
)
const items = computed(() =>
  props.team.state.value.team.members.map((member) => ({
    label: member.name,
    value: member.id,
  }))
)
</script>
