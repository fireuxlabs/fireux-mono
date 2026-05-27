<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/ecosystems"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="loading"
        color="neutral"
        variant="soft"
        title="Loading ecosystem"
      />

      <UAlert
        v-else-if="!ecosystem"
        color="warning"
        variant="soft"
        title="Ecosystem not found"
        description="This ecosystem could not be found by its public slug."
      />

      <EcosystemCardsProfile
        v-else-if="profile"
        :item="profile"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, useRoute } from '#imports'
import { useEcosystemCollection } from '../../composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection'
import { useEcosystemSeo } from '../../composables/fireux/firestore/core/ecosystem/utils/useEcosystemSeo'
import { useEcosystemInterface } from '../../composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View a FireUX ecosystem.',
  name: 'EcosystemDetailPage',
})

const route = useRoute()
const routeSlug = computed(() => String(route.params.slug || '').trim())
const { ecosystems, pending } = useEcosystemCollection()
const { profile: makeProfile } = useEcosystemInterface()

const ecosystem = computed(() =>
  ecosystems.value.find((entry) => String(entry.slug || '').trim() === routeSlug.value) ?? null
)
const loading = computed(() => Boolean(routeSlug.value) && pending.value)
const profile = computed(() => makeProfile(ecosystem.value))
const pageTitle = computed(() => profile.value?.name || 'Ecosystem')
const pageDescription = computed(() =>
  profile.value?.description || 'FireUX ecosystem details.'
)

useEcosystemSeo(ecosystem)
</script>
