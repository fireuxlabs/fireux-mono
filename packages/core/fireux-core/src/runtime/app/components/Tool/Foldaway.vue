<template>
  <UCard variant="subtle">
    <details :open="open">
      <summary>
        <span>
          <span>
            {{ title }}
          </span>
          <span v-if="description">
            {{ description }}
          </span>
        </span>
        <span>
          <UBadge
            v-if="provider"
            :label="provider"
            color="neutral"
            variant="soft"
          />
          <UIcon name="i-lucide-chevron-down" />
        </span>
      </summary>

      <div>
        <slot />
      </div>
    </details>
  </UCard>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    provider?: string
    open?: boolean
  }>(),
  {
    description: '',
    provider: '',
    open: false,
  }
)
</script>
