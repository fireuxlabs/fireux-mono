<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="block w-full"
    @activate="emit('action')"
  >
    <div
      class="fx-card--cell"
    >
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ name }}</div>

            <div v-if="showSubtitle && resolvedAddress" class="flex items-center gap-1 truncate text-xs text-dimmed">
              <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
              <span class="truncate">{{ resolvedAddress }}</span>
            </div>
          </div>

          <UBadge
            v-if="showSource && sourceLabel"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0"
          >
            {{ sourceLabel }}
          </UBadge>
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</MoleculesActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CompanyCard } from '../../../composables/company/useCompanyInterface'

type Props = Pick<CompanyCard.Card, 'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'> & {
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showSource: false,
  showTagline: false,
  link: false,
  action: false,
})

const resolvedAddress = computed(() => props.formattedAddress || '')

const resolvedImageUrl = computed(() => props.imageUrl || '')

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const sourceLabel = computed(() =>
  props.source === 'fireux'
    ? 'FireUX'
    : props.source === 'manual'
      ? 'Manual'
      : props.source === 'google'
        ? 'Google'
        : ''
)

</script>
