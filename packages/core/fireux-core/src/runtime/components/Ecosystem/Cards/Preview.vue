<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar
        :src="item.imageUrl || undefined"
        :alt="item.name"
        :text="avatarText"
        icon="i-lucide-orbit"
        size="sm"
      />

      <div class="preview__main">
        <div class="preview__top">
          <div class="min-w-0">
            <div class="preview__title">
              {{ item.name }}
            </div>
            <div class="preview__subtitle">
              {{ item.id }}
            </div>
          </div>

          <div class="preview__badges">
            <UBadge v-if="item.status" variant="soft" color="neutral" size="xs">
              {{ item.status }}
            </UBadge>
            <UBadge variant="soft" color="neutral" size="xs">
              {{ item.appCount }} app{{ item.appCount === 1 ? '' : 's' }}
            </UBadge>
          </div>
        </div>

        <div class="preview__body">
          <div class="preview__line">
            <span v-if="item.description">{{ item.description }}</span>
            <span v-else class="italic">missing</span>
          </div>
          <div v-if="item.id" class="preview__meta">
            <span class="break-all font-mono text-xs text-dimmed">{{ item.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'

type EcosystemPreviewItem = {
  id?: string
  name?: string
  description?: string
  status?: string
  appCount?: number
  imageUrl?: string
}

const props = withDefaults(defineProps<{
  item?: EcosystemPreviewItem
}>(), {
  item: () => ({
    id: '',
    name: '',
    description: '',
    status: '',
    appCount: 0,
    imageUrl: '',
  }),
})

const item = computed(() => ({
  id: props.item?.id || '',
  name: props.item?.name || '',
  description: props.item?.description || '',
  status: props.item?.status || '',
  appCount: props.item?.appCount || 0,
  imageUrl: props.item?.imageUrl || '',
}))

const avatarText = computed(() => item.value.name || item.value.id || 'E')
</script>
