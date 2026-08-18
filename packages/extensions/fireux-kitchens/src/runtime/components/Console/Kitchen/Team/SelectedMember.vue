<template>
  <div class="flex items-center gap-3 rounded-lg border border-default p-3">
    <UAvatar :alt="name" :text="initials" />
    <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ name }}</span>
    <UButton
      label="Change"
      color="neutral"
      variant="ghost"
      size="sm"
      @click="emit('change')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenTeamMember } from '../../../../models/kitchen/team.model'

const props = defineProps<{ member: KitchenTeamMember }>()
const emit = defineEmits<{ change: [] }>()
const name = computed(() =>
  String(props.member.display_name || props.member.name || 'Team member').trim()
)
const initials = computed(() =>
  name.value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
)
</script>
