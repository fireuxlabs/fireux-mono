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
              {{ item.id }}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          <UBadge v-if="item.status" variant="soft" color="neutral" size="xs">
            {{ item.status }}
          </UBadge>
          <UBadge variant="soft" color="neutral" size="xs">
            {{ item.appCount }} app{{ item.appCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <section class="space-y-1">
        <div class="fx-type-label">Description</div>
        <div class="text-sm text-default">
          <span v-if="item.description">{{ item.description }}</span>
          <span v-else class="italic text-dimmed">missing</span>
        </div>
      </section>

      <section class="grid gap-3 text-sm sm:grid-cols-2">
        <div class="space-y-1">
          <div class="fx-type-label">Ecosystem ID</div>
          <div class="font-mono text-xs break-all text-default">
            <span v-if="item.id">{{ item.id }}</span>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="fx-type-label">Website</div>
          <div class="text-sm text-default">
            <UButton
              v-if="item.websiteUrl"
              :to="item.websiteUrl"
              target="_blank"
              size="xs"
              variant="link"
              class="p-0"
            >
              Open website
            </UButton>
            <span v-else class="italic text-dimmed">missing</span>
          </div>
        </div>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'

type EcosystemProfileItem = {
  id?: string
  name?: string
  description?: string
  status?: string
  appCount?: number
  imageUrl?: string
  websiteUrl?: string
}

const props = withDefaults(defineProps<{
  item?: EcosystemProfileItem
}>(), {
  item: () => ({
    id: '',
    name: '',
    description: '',
    status: '',
    appCount: 0,
    imageUrl: '',
    websiteUrl: '',
  }),
})

const item = computed(() => ({
  id: props.item?.id || '',
  name: props.item?.name || '',
  description: props.item?.description || '',
  status: props.item?.status || '',
  appCount: props.item?.appCount || 0,
  imageUrl: props.item?.imageUrl || '',
  websiteUrl: props.item?.websiteUrl || '',
}))

const avatarText = computed(() => item.value.name || item.value.id || 'E')
</script>
