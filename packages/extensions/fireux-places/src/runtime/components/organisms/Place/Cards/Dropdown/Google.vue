<template>
  <button type="button" class="pill" @click="emit('select')">
    <UUser
      :name="name"
      :description="address || undefined"
      :avatar="{ src: imageUrl || undefined, alt: '', text: '' }"
      size="sm"
    >
      <template #default>
        <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
          Google
        </UBadge>
      </template>
    </UUser>
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
  showSource: false,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()
</script>
