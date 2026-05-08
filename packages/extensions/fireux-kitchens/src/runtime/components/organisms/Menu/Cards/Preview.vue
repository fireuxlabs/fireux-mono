<template>
  <UCard v-if="menu" variant="soft">
    <template #header>
      <div class="flex items-center gap-2">
        <UChip :color="menu.active === false ? 'error' : 'success'" inset />
        <div class="text-lg font-semibold">
          {{ menu.name || menu.id || 'Untitled menu' }}
        </div>
      </div>
    </template>

    <p v-if="availabilityText" class="mb-3 text-xs text-dimmed">
      {{ availabilityText }}
    </p>

    <div>
      <OrganismsMenuCardsSectionPreview
        v-if="sections.length"
        :sections="sections"
        :dishes="dishes"
        :show-section-headings="sections.length > 1"
      />

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No sections"
        description="This menu does not have any sections yet."
      />
    </div>
  </UCard>

  <UCard v-else class="overflow-hidden">
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
              <div class="truncate text-base font-semibold">{{ title }}</div>
              <div
                v-if="subtitle"
                class="truncate text-xs text-dimmed"
              >
                {{ subtitle }}
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-1">
              <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
                <UChip :color="isActiveNow ? 'success' : 'error'" inset />
                <span>{{ isActiveNow ? 'active' : 'inactive' }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="showBody"
            class="mt-1 line-clamp-2 text-xs text-dimmed"
          >
            <span v-if="description">{{ description }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>

      <div v-if="showBadges && (badges?.length ?? 0)" class="flex flex-wrap items-center gap-1">
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
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { Menu } from '../../../../models/menu.model'

type MenuPreviewDetail = {
  label: string
  value?: string | number | null
}

type Props = {
  menu?: Menu | null
  dishes?: Dish[]
  imageUrl?: string
  title?: string
  subtitle?: string
  isActiveNow?: boolean
  description?: string
  badges?: string[]
  details?: MenuPreviewDetail[]
  showBadges?: boolean
  showBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  menu: null,
  dishes: () => [],
  imageUrl: '',
  title: '',
  subtitle: '',
  isActiveNow: false,
  description: '',
  badges: () => [],
  details: () => [],
  showBadges: true,
  showBody: true,
})

const sections = computed(() =>
  Array.isArray(props.menu?.sections)
    ? [...props.menu.sections].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []
)

const availabilityText = computed(() =>
  String(
    (props.menu as Record<string, unknown> | null)?.availability_label ||
      (props.menu as Record<string, unknown> | null)?.availability_summary ||
      (props.menu as Record<string, unknown> | null)?.hours_label ||
      ''
  ).trim()
)

const formatValue = (value?: string | number | null) => {
  if (value == null) return '-'
  const str = String(value).trim()
  return str || '-'
}
</script>
