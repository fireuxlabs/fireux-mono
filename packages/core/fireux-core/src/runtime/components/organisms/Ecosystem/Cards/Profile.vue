<template>
  <UCard class="space-y-4">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <UAvatar
            :src="item.imageUrl || undefined"
            :alt="item.name"
            :text="avatarText"
            icon="i-lucide-orbit"
            size="md"
          />

          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-default">
              {{ item.name }}
            </div>
            <div class="truncate text-xs text-dimmed">
              <span v-if="item.slug">{{ item.slug }}</span>
              <span v-else class="italic">missing slug</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          <UBadge v-if="item.status" variant="soft" color="neutral" size="xs">
            {{ item.status }}
          </UBadge>
          <UBadge v-if="item.team" variant="soft" color="neutral" size="xs">
            {{ item.team }}
          </UBadge>
          <UBadge variant="soft" color="neutral" size="xs">
            {{ item.appCount }} app{{ item.appCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <section class="space-y-1">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Description</div>
        <div class="text-sm text-default">
          <span v-if="item.description">{{ item.description }}</span>
          <span v-else class="italic text-dimmed">missing</span>
        </div>
      </section>

      <section class="grid gap-3 text-sm sm:grid-cols-3">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Ecosystem ID</div>
          <div class="font-mono text-xs break-all text-default">
            <span v-if="item.id">{{ item.id }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Slug</div>
          <div class="text-sm text-default">
            <span v-if="item.slug">{{ item.slug }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">Team</div>
          <div class="text-sm text-default">
            <span v-if="item.team">{{ item.team }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>
      </section>

      <section class="space-y-2">
        <div class="text-xs uppercase tracking-[0.16em] text-toned">Connected Apps</div>
        <div v-if="item.appLabels.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="app in item.appLabels"
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

type EcosystemProfileItem = {
  id?: string
  slug?: string
  name?: string
  description?: string
  status?: string
  team?: string
  appCount?: number
  appLabels?: string[]
  imageUrl?: string
}

const props = withDefaults(defineProps<{
  item?: EcosystemProfileItem
}>(), {
  item: () => ({
    id: '',
    slug: '',
    name: '',
    description: '',
    status: '',
    team: '',
    appCount: 0,
    appLabels: [],
    imageUrl: '',
  }),
})

const item = computed(() => ({
  id: props.item?.id || '',
  slug: props.item?.slug || '',
  name: props.item?.name || '',
  description: props.item?.description || '',
  status: props.item?.status || '',
  team: props.item?.team || '',
  appCount: props.item?.appCount || 0,
  appLabels: props.item?.appLabels || [],
  imageUrl: props.item?.imageUrl || '',
}))

const avatarText = computed(() => item.value.name || item.value.slug || item.value.id || 'E')
</script>
