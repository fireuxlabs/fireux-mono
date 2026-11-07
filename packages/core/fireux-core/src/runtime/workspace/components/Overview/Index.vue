<template>
  <div class="pagebody">
    <UCard>
      <div>
        <div>
          <UAvatar
            :src="image || undefined"
            :alt="title"
            :ui="
              imageFit === 'contain' ? { image: 'object-contain' } : undefined
            "
            :icon="icon"
            size="3xl"
          />
          <div>
            <p v-if="label">{{ label }}</p>
            <h1>{{ title }}</h1>
            <p v-if="description">
              {{ description }}
            </p>
          </div>
        </div>
        <slot name="badge" />
      </div>
      <template #footer>
        <nav aria-label="Workspace capabilities">
          <UButton
            v-for="link in links"
            :key="link.to"
            v-bind="link"
            color="neutral"
            variant="ghost"
          />
        </nav>
      </template>
    </UCard>
    <div>
      <div>
        <slot />
      </div>
      <UCard v-if="$slots.attention">
        <template #header><h2>Needs attention</h2></template>
        <div class="fx-card-body-stack"><slot name="attention" /></div>
      </UCard>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title: string
  label?: string
  description?: string
  image?: string
  imageFit?: 'contain' | 'cover'
  icon?: string
  links: { label: string; to: string; icon?: string }[]
}>()
</script>
