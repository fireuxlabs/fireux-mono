<template>
  <NuxtLink :to="vm.to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="vm.avatar || undefined" :alt="vm.title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ vm.title }}</div>
            <div v-if="vm.subtitle" class="fx-cell__subtitle">{{ vm.subtitle }}</div>
          </div>

          <div v-if="vm.badges.length" class="fx-cell__badges">
            <UBadge
              v-for="badge in vm.badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div class="fx-cell__tagline">
          <span v-if="vm.line1">{{ vm.line1 }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplier } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import type {
  SupplierCard,
  SupplierProfile,
} from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  supplier?: SupplierProfile | SupplierCard.Card | null
  card?: SupplierCard.Card | null
  prop?: string
}>()

const { coreProfile, card: toCard } = useSupplier()

const isSupplierCard = (value: unknown): value is SupplierCard.Card => {
  if (!value || typeof value !== 'object') return false
  return 'to' in value && 'title' in value && 'badges' in value && 'line1' in value
}

const resolvedCard = computed<SupplierCard.Card | null>(() => {
  if (props.card) return props.card

  const supplied = props.supplier ?? null
  if (supplied) {
    return isSupplierCard(supplied) ? supplied : toCard(supplied)
  }

  return coreProfile.value ? toCard(coreProfile.value) : null
})

const vm = computed(() => {
  const card = resolvedCard.value

  const title = props.title ?? card?.title ?? 'Supplier'
  const subtitle = props.subtitle ?? (card?.subtitle || undefined)
  const avatar = props.avatar ?? (card?.avatar || null)
  const badges = card?.badges ?? []
  const to = card?.to || '#'
  const line1 = String((typeof props.prop === 'string' ? props.prop : card?.line1) ?? '').trim()

  return { title, subtitle, avatar, badges, to, line1 }
})
</script>
