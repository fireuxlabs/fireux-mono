<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">
          {{ vmSubtitle }}
        </div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Company } from '../../../../../models/objects/company.model'
import { useCompanyInterface } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  company?: Company | null
  prop?: string
}>()
const { cellProps } = useCompanyInterface()

const resolved = computed(() => cellProps(props.company ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value.website ?? resolved.value.subtitle ?? undefined
)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
