<template>
  <UCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <UAvatar
        :src="vm.avatar || undefined"
        :alt="vm.title"
        icon="i-lucide-truck"
        size="3xl"
      />

      <div class="min-w-0 flex-1 space-y-3">
        <div class="space-y-1">
          <div class="fx-type-label">
            Supplier
          </div>
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ vm.title }}
          </h2>
          <p v-if="vm.subtitle" class="max-w-3xl text-sm text-toned">
            {{ vm.subtitle }}
          </p>
          <p v-if="vm.prop" class="max-w-3xl text-sm text-muted">
            {{ vm.prop }}
          </p>
        </div>

        <div v-if="vm.badges.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="badge in vm.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
        </div>

        <dl class="grid gap-3 text-sm sm:grid-cols-2">
          <div v-if="vm.organizationName" class="space-y-1">
            <dt class="fx-type-label">
              Organization
            </dt>
            <dd class="text-default">{{ vm.organizationName }}</dd>
          </div>
          <div v-if="vm.locationsLabel" class="space-y-1">
            <dt class="fx-type-label">
              Coverage
            </dt>
            <dd class="text-default">{{ vm.locationsLabel }}</dd>
          </div>
          <div v-if="vm.headquartersLabel" class="space-y-1">
            <dt class="fx-type-label">
              Headquarters
            </dt>
            <dd class="text-default">{{ vm.headquartersLabel }}</dd>
          </div>
          <div v-if="vm.categoriesCsv" class="space-y-1">
            <dt class="fx-type-label">
              Categories
            </dt>
            <dd class="text-default">{{ vm.categoriesCsv }}</dd>
          </div>
        </dl>

        <p v-if="vm.summary" class="text-sm text-muted">
          {{ vm.summary }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  avatarSecondary?: string | null
  card?: SupplierCard.Card | null
  prop?: string
}>()

const resolvedCard = computed<SupplierCard.Card | null>(() => {
  return props.card ?? null
})

const vm = computed(() => {
  const card = resolvedCard.value

  const title = props.title ?? card?.title ?? ''
  const subtitle = props.subtitle ?? (card?.subtitle || undefined)
  const avatar = props.avatar ?? (card?.avatarUrl || null)
  const badges = card?.badges ?? []

  const prop = typeof props.prop === 'string' ? props.prop : ''
  const summary = String(card?.summary ?? '').trim()
  const organizationName = String(card?.organizationName ?? '').trim()
  const locationsLabel = String(card?.locationsLabel ?? '').trim()
  const headquartersLabel = String(card?.headquartersLabel ?? '').trim()
  const categoriesCsv = String(card?.categoriesCsv ?? '').trim()

  return {
    title,
    subtitle,
    avatar,
    badges,
    prop,
    summary,
    organizationName,
    locationsLabel,
    headquartersLabel,
    categoriesCsv,
  }
})
</script>
