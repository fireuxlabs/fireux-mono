<!-- FILE: packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Chefs"
      description="Inspect your chef profile and browse all chefs resolved for this runtime."
    />

    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesChefSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
      </template>

      <UPageCTA
        v-else
        title="Create your chef profile"
        description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
        variant="naked"
        :links="chefCtaLinks"
      />

      <OrganismsProfilesChefSectionsGlobalCollection />
      <OrganismsProfilesChefSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import OrganismsProfilesChefSectionsSingle from '../../components/organisms/profiles/Chef/Sections/Single.vue'
import OrganismsProfilesChefSectionsGlobalCollection from '../../components/organisms/profiles/Chef/Sections/GlobalCollection.vue'
import OrganismsProfilesChefSectionsLocalCollection from '../../components/organisms/profiles/Chef/Sections/LocalCollection.vue'

definePageMeta({
  nav: {
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-egg-fried',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Chefs',
  description: 'Chef profiles resolved for this runtime.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const { coreProfile, appProfile, pill } = useChef()
const chefCtaLinks = [
  {
    label: 'Get started',
    color: 'neutral',
    to: '/dashboard/chef-profile',
  },
  {
    label: 'Learn more',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right',
    to: '/chefs/learn-more',
  },
]
const hasProfile = computed(() => Boolean(coreProfile.value))
const { isTenant } = useFireUXConfig()

useHead({ title: 'Chefs' })
</script>
