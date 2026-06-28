<template>
  <section class="space-y-4" aria-label="Public apps">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold text-default">Public app stories</h2>
        <p class="text-sm text-dimmed">
          Logos, descriptions, launch links, and case-study pages for apps in this ecosystem.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        {{ countLabel }}
      </UBadge>
    </div>

    <div v-if="cards.length" class="grid gap-4 lg:grid-cols-2">
      <AppCardsPublic
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
      />
    </div>

    <UPageCard
      v-else
      title="No public apps yet"
      description="App records will appear here once they have public catalog data."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAppCollection } from '../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import {
  useAppInterface,
  type AppCard,
} from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { AppModel } from '../../../models/core/app.model'

const fireux = useFireUXConfig()
const fetched = useAppCollection()
const { cell: toCard } = useAppInterface()

const publicApps = computed<AppModel[]>(() => {
  const ecosystem = String(fireux.ecosystem || '').trim()
  return (fetched.apps.value as AppModel[])
    .filter((app) => {
      const status = String(app.status || '').trim()
      return status !== 'draft' && status !== 'archived' && status !== 'retired'
    })
    .filter((app) => {
      if (!ecosystem) return true
      return (
        app.ecosystem === ecosystem ||
        app.ecosystem_id === ecosystem ||
        app.id === fireux.appId
      )
    })
    .sort((a, b) => {
      const aOrder = Number(a.fireux_repo?.launch_order ?? Number.MAX_SAFE_INTEGER)
      const bOrder = Number(b.fireux_repo?.launch_order ?? Number.MAX_SAFE_INTEGER)
      if (Number.isFinite(aOrder) && Number.isFinite(bOrder) && aOrder !== bOrder) {
        return aOrder - bOrder
      }
      return String(a.app_name || a.id).localeCompare(String(b.app_name || b.id))
    })
})

const cards = computed<AppCard.Card[]>(() =>
  publicApps.value
    .map((app) => toCard(app))
    .filter((card): card is AppCard.Card => Boolean(card))
)

const countLabel = computed(() => `${cards.value.length} app${cards.value.length === 1 ? '' : 's'}`)
</script>
