<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="block w-full"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="imageUrl || undefined"
        icon="i-lucide-carrot"
        size="md"
        class="fx-card__badge"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">{{ name }}</div>

            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
            <code v-if="showSlug && slug" class="fx-type-code fx-truncate">
              {{ slug }}
            </code>
          </div>

          <div class="card__badges">
            <UTooltip
              v-if="warningLabel && warningDescription"
              :text="warningDescription"
              :popper="{ placement: 'top' }"
            >
              <UBadge
                color="warning"
                variant="soft"
                size="xs"
                class="fx-card__badge"
              >
                <UIcon name="i-lucide-triangle-alert" />
                {{ warningLabel }}
              </UBadge>
            </UTooltip>
            <UBadge
              v-else-if="warningLabel"
              color="warning"
              variant="soft"
              size="xs"
              class="fx-card__badge"
            >
              <UIcon name="i-lucide-triangle-alert" />
              {{ warningLabel }}
            </UBadge>

            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
              class="fx-card__badge"
            >
              {{ status }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IngredientCard } from '../../composables/useIngredientInterface'

type Props = Partial<
  Pick<
    IngredientCard.Card,
    'slug' | 'to' | 'name' | 'subtitle' | 'status' | 'imageUrl'
  >
> & {
  warning?: string
  showSlug?: boolean
  showSubtitle?: boolean
  showStatus?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  slug: '',
  to: '',
  name: '',
  subtitle: '',
  status: '',
  imageUrl: '',
  showSlug: false,
  showSubtitle: true,
  showStatus: true,
  link: false,
  action: false,
})

const warningLabel = computed(() => String(props.warning || '').trim())

const warningDescription = computed(() => {
  const value = String(props.warning || '').trim()
  if (!value) return ''

  const normalized = value.toLowerCase()
  if (normalized === 'unused') {
    return 'Not used in recipes, mise, or published menu dishes'
  }
  if (normalized === 'off menu') {
    return 'Used in prep or recipes, but not on any published menu dish'
  }

  return ''
})
</script>
