<template>
  <UCard class="preview">
    <div class="fx-card__stack fx-card__stack--spaced">
      <div class="fx-card__media">
        <UAvatar
          :src="imageUrl || undefined"
          icon="i-lucide-clipboard-check"
          size="xl"
        />

        <div class="fx-card__content">
          <div class="fx-card__header">
            <div class="fx-card__content">
              <div class="fx-card__title fx-card__title--lg">{{ name }}</div>
              <div v-if="subtitle" class="fx-card__subtitle">
                {{ subtitle }}
              </div>
            </div>

            <UBadge
              v-if="status"
              variant="soft"
              color="neutral"
              size="xs"
              class="fx-card__badge"
            >
              {{ status }}
            </UBadge>
          </div>

          <div v-if="showBody" class="fx-card__body">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>

      <div v-if="showBadges && (badges?.length ?? 0)" class="fx-card__chips">
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

      <div v-if="details?.length" class="fx-card__stack fx-card__stack--tight">
        <div v-for="item in details" :key="item.label" class="fx-card__stack">
          <div class="fx-card__label">
            {{ item.label }}
          </div>
          <div class="fx-truncate">
            {{ formatValue(item.value) }}
          </div>
        </div>
      </div>

      <div v-if="$slots.actions" class="fx-card__actions">
        <slot name="actions" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type MisePreviewDetail = {
  label: string
  value?: string | number | null
}

type Props = {
  imageUrl: string
  name: string
  subtitle: string
  status: string
  prop?: string
  badges?: string[]
  details?: MisePreviewDetail[]
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
