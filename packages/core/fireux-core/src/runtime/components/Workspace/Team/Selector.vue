<template>
  <section class="flex items-center gap-2" :aria-label="`${label} controls`">
    <UTabs
      v-if="items.length"
      :model-value="selectedMemberId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="emit('select', String($event))"
    />
    <UButton
      v-if="canCreate"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      :aria-label="`Create ${label} member`"
      @click="emit('create')"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTeamMember } from '../../../composables/fireux/workspace/useWorkspaceTeam'

const props = defineProps<{
  label: string
  members: readonly WorkspaceTeamMember[]
  selectedMemberId: string
  canCreate: boolean
}>()

const emit = defineEmits<{
  (event: 'select', memberId: string): void
  (event: 'create'): void
}>()

const items = computed(() =>
  props.members.map((member) => ({ label: member.name, value: member.id }))
)
</script>
