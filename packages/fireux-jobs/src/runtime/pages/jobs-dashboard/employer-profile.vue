<template>
  <client-only>
    <div v-if="appUser">
      <UButton
        color="primary"
        size="lg"
        icon="i-heroicons-plus-circle"
      >
Create an Employer Profile
      </UButton>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from 'fireux-core/composables/utils/useRoutes'

const route = useRoute()
const { label, icon } = getRouteMetaForPath(route.path)

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: label,
  meta: [{ name: 'icon', content: icon }],
})

const { appUser } = useAppUser()
const router = useRouter()

</script>
