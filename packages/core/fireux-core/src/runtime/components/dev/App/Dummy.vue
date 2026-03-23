<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dummy app surfaces
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Preview Pill, Cell, Preview, and Profile surfaces using shared core app dummy data.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <AppCardsPill
          v-for="item in pillItems"
          :key="item.id"
          v-bind="item.card"
          action
          @action="selectedId = item.id"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Pill</div>
          <AppCardsPill v-if="currentCard" v-bind="currentCard" />
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Cell</div>
          <AppCardsCell
            v-if="currentCard"
            :to="currentCard.to"
            :thumbnail-url="currentCard.thumbnailUrl"
            :display-name="currentCard.displayName"
            :badges="currentCard.badges"
            :tagline="currentCard.tagline"
            :user-count="currentCard.userCount"
          />
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Preview</div>
          <AppCardsPreview
            v-if="currentCard"
            :id="currentCard.id"
            :short-name="currentCard.shortName"
            :thumbnail-url="currentCard.thumbnailUrl"
            :display-name="currentCard.displayName"
            :ecosystem="currentCard.ecosystem"
            :tagline="currentCard.tagline"
            :user-count="currentCard.userCount"
            :badges="currentCard.badges"
          />
        </div>

        <div class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Profile</div>
          <AppCardsProfile
            v-if="currentCard && currentApp"
            :app="currentApp"
            :id="currentCard.id"
            :short-name="currentCard.shortName"
            :role="currentCard.role"
            :user-count="currentCard.userCount"
            :tagline="currentCard.tagline"
            :wordmark-light="currentCard.wordmarkLightUrl"
            :wordmark-dark="currentCard.wordmarkDarkUrl"
            :thumbnail-url="currentCard.thumbnailUrl"
            :display-name="currentCard.displayName"
            :ecosystem="currentCard.ecosystem"
            :badges="currentCard.badges"
            :social-links="currentCard.socialLinks"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyAppList } from '../../../../../../../../dummy/app.dummy'
import { useAppInterface } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { AppModel } from '../../../models/core/app.model'

defineOptions({ name: 'DevAppDummy' })

const { interface: appCard } = useAppInterface()

const selectedId = ref(String(dummyAppList[0]?.id ?? ''))

const currentApp = computed<AppModel | null>(() => {
  return (
    dummyAppList.find((app) => String(app.id) === selectedId.value) ??
    dummyAppList[0] ??
    null
  )
})

const currentCard = computed(() => {
  return currentApp.value ? appCard(currentApp.value) : null
})

const pillItems = computed(() =>
  dummyAppList
    .map((app) => {
      const card = appCard(app)
      if (!card) return null
      return {
        id: String(app.id ?? ''),
        app,
        card,
      }
    })
    .filter(Boolean) as Array<{ id: string; app: AppModel; card: NonNullable<ReturnType<typeof appCard>> }>
)
</script>

