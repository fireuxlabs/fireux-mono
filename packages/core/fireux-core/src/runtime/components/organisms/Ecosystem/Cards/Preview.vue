<template>
  <UCard class="space-y-3">
    <div class="flex items-start gap-3">
      <UAvatar
        :src="item.imageUrl || undefined"
        :alt="item.name"
        :text="avatarText"
        icon="i-lucide-orbit"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-default">
              {{ item.name }}
            </div>
            <div class="truncate text-xs text-dimmed">
              <span v-if="item.slug">{{ item.slug }}</span>
              <span v-else class="italic">missing slug</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            <UBadge v-if="item.status" variant="soft" color="neutral" size="xs">
              {{ item.status }}
            </UBadge>
            <UBadge variant="soft" color="neutral" size="xs">
              {{ item.appCount }} app{{ item.appCount === 1 ? '' : 's' }}
            </UBadge>
          </div>
        </div>

        <div class="text-sm text-dimmed">
          <span v-if="item.description">{{ item.description }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
          <span v-if="item.team">team: {{ item.team }}</span>
          <span v-if="item.id" class="font-mono break-all">{{ item.id }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'

type EcosystemPreviewItem = {
  id?: string
  slug?: string
  name?: string
  description?: string
  status?: string
  team?: string
  appCount?: number
  imageUrl?: string
}

const props = withDefaults(defineProps<{
  item?: EcosystemPreviewItem
}>(), {
  item: () => ({
    id: '',
    slug: '',
    name: '',
    description: '',
    status: '',
    team: '',
    appCount: 0,
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
  imageUrl: props.item?.imageUrl || '',
}))

const avatarText = computed(() => item.value.name || item.value.slug || item.value.id || 'E')
</script>
