<template>
  <button type="button" class="pill" @click="emit('select')">
    <UAvatar
      :src="imageUrl || undefined"
      :alt="name"
      size="sm"
      icon="i-lucide-map-pin"
    />
    <div>
      <div>{{ name }}</div>
      <div v-if="address">{{ address }}</div>
    </div>
    <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
      Google
    </UBadge>
  </button>
</template>

<script setup lang="ts">
type Props = {
  name: string
  address: string
  imageUrl?: string
  showSource?: boolean
}

withDefaults(defineProps<Props>(), {
  imageUrl: '',
  showSource: true,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()
</script>
