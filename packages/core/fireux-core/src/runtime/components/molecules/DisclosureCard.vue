<template>
  <div v-bind="$attrs" class="card card--cell">
    <UCollapsible v-model:open="open" class="fx-card-body-stack">
      <UButton
        color="neutral"
        variant="ghost"
        block
        :icon="icon || undefined"
        :trailing-icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
      >
        <span class="fx-card__content fx-card__stack">
          <span class="fx-type-card-title">{{ title }}</span>
          <span v-if="description" class="fx-type-caption">
            {{ description }}
          </span>
        </span>
      </UButton>

      <template #content>
        <div class="fx-card-body-stack">
          <slot />
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  title: string
  description?: string
  icon?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>
