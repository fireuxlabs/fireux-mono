<template>
	<UPageCTA
		class="cta"
		title="Professional profile"
		:description="ctaDescription"
		variant="subtle"
		orientation="horizontal"
		>
			<div v-if="hasProfile" class="cta__body space-y-4">
				<ProfilesProfessionalCardsPreview
					v-if="professionalCard"
					v-bind="professionalCard"
					:link="false"
				/>

				<div class="flex flex-wrap gap-2">
					<UButton color="primary" @click="openProfessionalProfile">View profile</UButton>
					<UButton color="neutral" variant="soft" @click="openProfessionalConsole">Manage profile</UButton>
				</div>
			</div>

		<div v-else class="cta__body space-y-2">
			<ProfilesProfessionalCreateSystem />
		</div>
	</UPageCTA>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional'

const router = useRouter()
const { card } = useProfessional()
const { appName } = useFireUXConfig()

const professionalCard = computed(() => card())
const hasProfile = computed(() => Boolean(professionalCard.value?.id))
const ctaDescription = computed(() =>
	hasProfile.value
	    ? `Your professional profile is live on ${appName}.`
	    : 'Create your profile so agents can find and invite you.'
)

const openProfessionalProfile = () => {
	const to = String(professionalCard.value?.to || '').trim()
	if (!to) return
	router.push(to)
}


const openProfessionalConsole = () => {
	router.push('/dashboard/professional/profile')
}
</script>
