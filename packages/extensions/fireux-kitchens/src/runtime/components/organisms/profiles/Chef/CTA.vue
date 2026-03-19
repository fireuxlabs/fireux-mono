<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
	<UPageCTA
		class="cta"
		title="Chef profile"
		:description="ctaDescription"
		variant="subtle"
		orientation="horizontal"
	>
		<div v-if="hasProfile && chefCard" class="cta__body space-y-4">
			<ProfilesChefCardsPreview v-bind="chefCard" :link="false" />

			<div class="flex flex-wrap gap-2">
				<UButton color="primary" @click="openProfile">View profile</UButton>
				<UButton color="neutral" variant="soft" @click="openConsole">Manage profile</UButton>
			</div>
		</div>

		<div v-else class="cta__body space-y-2">
			<ProfilesChefCreateSystem />
		</div>
	</UPageCTA>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'

const router = useRouter()
const { appName } = useFireUXConfig()
const { card } = useChef()

const chefCard = computed(() => card())
const hasProfile = computed(() => Boolean(chefCard.value?.id))
const ctaDescription = computed(() =>
	hasProfile.value
		? `Your chef profile is live on ${appName}.`
		: 'Create your chef profile so venues can find you.'
)

const openProfile = () => {
	const to = String(chefCard.value?.to || '').trim()
	if (!to) return
	router.push(to)
}

const openConsole = () => {
	router.push('/dashboard/chef/profile')
}

</script>

