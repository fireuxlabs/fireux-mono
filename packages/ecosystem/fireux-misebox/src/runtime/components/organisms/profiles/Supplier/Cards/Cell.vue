<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierProfile } from '../../../../../models/profiles/Supplier/Supplier.model'
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface'
import { resolveSupplierCell } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  supplier?: SupplierCard.Cell | SupplierProfile | null
  prop?: string
}>()

const resolved = computed<SupplierCard.Cell | null>(() => {
  const source = props.supplier
  if (!source) return null
  if ('user' in source) return resolveSupplierCell(source)
  return source as SupplierCard.Cell
})

const resolvedTitle = computed(
  () => resolved.value?.company_name ?? resolved.value?.title ?? 'Supplier'
)
const resolvedSubtitle = computed(
  () => resolved.value?.tagline ?? resolved.value?.subtitle ?? undefined
)
const resolvedAvatar = computed(
  () => resolved.value?.company_avatar ?? resolved.value?.avatar ?? null
)

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
</script>
