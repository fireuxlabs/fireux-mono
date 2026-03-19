<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="pill"
    @click="onClick"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        :text="avatarText || title || ''"
        icon="i-lucide-orbit"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
          <UBadge v-for="badge in badges" :key="badge" variant="soft" color="neutral" size="xs">
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
type EcosystemPillProps = {
  to?: string
  imageUrl?: string
  avatarText?: string
  title: string
  subtitle?: string
  badges?: string[]
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<EcosystemPillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
