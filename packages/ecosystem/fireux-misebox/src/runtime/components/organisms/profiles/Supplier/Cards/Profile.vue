<template>
  <UCard class="space-y-6">
    <div class="flex items-start gap-4">
      <UAvatarGroup v-if="vm.avatarSecondary" size="lg">
        <UAvatar :src="vm.avatar || undefined" :alt="vm.title" size="lg" />
        <UAvatar :src="vm.avatarSecondary || undefined" :alt="vm.title" size="sm" />
      </UAvatarGroup>
      <UAvatar v-else :src="vm.avatar || undefined" :alt="vm.title" size="lg" />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="truncate text-lg font-semibold">{{ vm.title }}</div>
            <div v-if="vm.subtitle" class="truncate text-sm text-dimmed">{{ vm.subtitle }}</div>
          </div>

          <div v-if="vm.badges.length" class="flex flex-wrap justify-end gap-1">
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

        <div class="text-sm text-dimmed">
          <span v-if="vm.prop">{{ vm.prop }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="vm.line1">{{ vm.line1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Specialties</div>
        <div class="text-sm">
          <span v-if="vm.line2">{{ vm.line2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Locations</div>
        <div class="text-sm">
          <span v-if="vm.line3">{{ vm.line3 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
    SupplierCard,
    SupplierProfile,
} from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier';
import { useSupplier } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier';

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  avatarSecondary?: string | null
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
  const avatar = props.avatar ?? (card?.avatarUrl || null)
  const avatarSecondary = props.avatarSecondary ?? (card?.secondaryAvatarUrl || null)
  const badges = card?.badges ?? []

  const prop = typeof props.prop === 'string' ? props.prop : ''

  const line1 = String(card?.line1 ?? '').trim()
  const line2 = String(card?.line2 ?? '').trim()
  const line3 = String(card?.line3 ?? '').trim()

  return { title, subtitle, avatar, avatarSecondary, badges, prop, line1, line2, line3 }
})
</script>
