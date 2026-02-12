<template>
  <UCard class="overflow-hidden">
    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <UAvatar
          :src="imageUrl || undefined"
          icon="i-lucide-book-open-check"
          size="xl"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-base font-semibold">{{ name }}</div>
              <div
                v-if="subtitle"
                class="truncate text-xs text-dimmed"
              >
                {{ subtitle }}
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
                <UChip :color="isActiveNow ? 'success' : 'error'" inset />
                <span>{{ isActiveNow ? 'active' : 'inactive' }}</span>
              </div>
              <UBadge
                v-if="status"
                variant="soft"
                color="neutral"
                size="xs"
              >
                {{ status }}
              </UBadge>
            </div>
          </div>

          <div
            v-if="showBody"
            class="mt-1 line-clamp-2 text-xs text-dimmed"
          >
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>

      <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
        <UBadge
          v-for="badge in badges"
          :key="badge"
          variant="soft"
          color="neutral"
          size="xs"
        >
          {{ badge }}
        </UBadge>
      </div>

      <div
        v-if="details?.length"
        class="space-y-2 text-xs text-dimmed"
      >
        <div
          v-for="item in details"
          :key="item.label"
          class="grid gap-0.5"
        >
          <div class="text-[11px] font-medium uppercase tracking-wide text-muted">
            {{ item.label }}
          </div>
          <div class="truncate">
            {{ formatValue(item.value) }}
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="pt-1">
        <slot name="actions" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type MenuPreviewDetail = {
  label: string
  value?: string | number | null
}

type Props = {
  imageUrl: string
  name: string
  subtitle: string
  status: string
  isActiveNow: boolean
  prop?: string
  badges?: string[]
  details?: MenuPreviewDetail[]
  showBadges?: boolean
  showBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  badges: () => [],
  details: () => [],
  showBadges: true,
  showBody: true,
})

const formatValue = (value?: string | number | null) => {
  if (value == null) return '—'
  const str = String(value).trim()
  return str || '—'
}
</script>
