<template>
  <UCard class="space-y-3">
    <div class="flex items-start gap-3">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="name"
        :text="avatarText"
        icon="i-lucide-orbit"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-default">
              {{ name }}
            </div>
            <div class="truncate text-xs text-dimmed">
              <span v-if="slug">{{ slug }}</span>
              <span v-else class="italic">missing slug</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            <UBadge v-if="status" variant="soft" color="neutral" size="xs">
              {{ status }}
            </UBadge>
            <UBadge variant="soft" color="neutral" size="xs">
              {{ appCount }} app{{ appCount === 1 ? '' : 's' }}
            </UBadge>
          </div>
        </div>

        <div class="text-sm text-dimmed">
          <span v-if="description">{{ description }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
          <span v-if="team">team: {{ team }}</span>
          <span v-if="id" class="font-mono break-all">{{ id }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'

const props = withDefaults(defineProps<{
  id?: string
  slug?: string
  name?: string
  description?: string
  status?: string
  team?: string
  appCount?: number
  imageUrl?: string
}>(), {
  id: '',
  slug: '',
  name: '',
  description: '',
  status: '',
  team: '',
  appCount: 0,
  imageUrl: '',
})

const avatarText = computed(() => props.name || props.slug || props.id || 'E')
</script>
