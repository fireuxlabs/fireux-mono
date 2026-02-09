<template>
	<UPageCTA
		class="cta"
		title="Professional profile"
		:description="ctaDescription"
		variant="subtle"
		orientation="horizontal"
	>
		<div v-if="hasProfile" class="cta__body space-y-4">
			<ProfilesProfessionalCardsPreview v-bind="card()" :link="true" />
		</div>

		<div v-else class="cta__body space-y-2">
			<ProfilesProfessionalCreateSystem @created="handleCreated" />
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

const hasProfile = computed(() => Boolean(card()))
const ctaDescription = computed(() =>
  hasProfile.value
    ? `Your professional profile is live on ${appName}.`
    : 'Create your profile so agents can find and invite you.'
)

const handleCreated = () => {
	router.push('/dashboard/professional/profile')
}
</script>

