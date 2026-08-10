<template>
  <button type="button" class="pill justify-start text-left" @click="emit('select')">
    <UUser
      :name="primaryLabel"
      :description="address || undefined"
      :avatar="{ src: imageUrl || undefined, alt: '', text: '' }"
      size="sm"
    >
      <template #default>
        <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
          {{ sourceLabel }}
        </UBadge>
      </template>
    </UUser>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  name: string
  shortName?: string
  address: string
  imageUrl?: string
  source: 'fireux' | 'manual'
  showSource?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shortName: '',
  imageUrl: '',
  showSource: false,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()

const primaryLabel = computed(() => props.shortName || props.name)

const sourceLabel = computed(() => (props.source === 'manual' ? 'Manual' : 'FireUX'))
</script>
