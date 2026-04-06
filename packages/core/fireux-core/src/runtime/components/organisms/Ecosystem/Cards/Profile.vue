<template>
  <UCard class="space-y-4">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <UAvatar
            :src="imageUrl || undefined"
            :alt="name"
            :text="avatarText"
            icon="i-lucide-orbit"
            size="md"
          />

          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-default">
              {{ name }}
            </div>
            <div class="truncate text-xs text-dimmed">
              <span v-if="slug">{{ slug }}</span>
              <span v-else class="italic">missing slug</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          <UBadge v-if="status" variant="soft" color="neutral" size="xs">
            {{ status }}
          </UBadge>
          <UBadge v-if="team" variant="soft" color="neutral" size="xs">
            {{ team }}
          </UBadge>
          <UBadge variant="soft" color="neutral" size="xs">
            {{ appCount }} app{{ appCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <section class="space-y-1">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Description</div>
        <div class="text-sm text-default">
          <span v-if="description">{{ description }}</span>
          <span v-else class="italic text-dimmed">missing</span>
        </div>
      </section>

      <section class="grid gap-3 text-sm sm:grid-cols-3">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Ecosystem ID</div>
          <div class="font-mono text-xs break-all text-default">
            <span v-if="id">{{ id }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Slug</div>
          <div class="text-sm text-default">
            <span v-if="slug">{{ slug }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Team</div>
          <div class="text-sm text-default">
            <span v-if="team">{{ team }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>
      </section>

      <section class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Connected Apps</div>
        <div v-if="appLabels.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="app in appLabels"
            :key="app"
            color="neutral"
            variant="soft"
            size="xs"
          >
            {{ app }}
          </UBadge>
        </div>
        <div v-else class="text-sm italic text-dimmed">
          No apps listed yet.
        </div>
      </section>
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
  appLabels?: string[]
  imageUrl?: string
}>(), {
  id: '',
  slug: '',
  name: '',
  description: '',
  status: '',
  team: '',
  appCount: 0,
  appLabels: () => [],
  imageUrl: '',
})

const avatarText = computed(() => props.name || props.slug || props.id || 'E')
</script>
