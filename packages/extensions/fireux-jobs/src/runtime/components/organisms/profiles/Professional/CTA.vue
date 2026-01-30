<template>
	<UPageCTA
		class="cta"
		title="Professional profile"
		:description="ctaDescription"
		variant="subtle"
		orientation="horizontal"
	>
		<div v-if="card()" class="cta__body space-y-4">
			<OrganismsProfilesProfessionalCardsPreview v-bind="card()" :link="false" />
		</div>

		<div v-else class="cta__body space-y-2">
			<OrganismsProfilesProfessionalCreateSystem />
		</div>
	</UPageCTA>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import { computed } from 'vue';
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional';

const { card } = useProfessional()
const { appName } = useFireUXConfig()

const hasProfileCard = computed(() => Boolean(card()))
const ctaDescription = computed(() =>
	hasProfileCard.value
		? `Your professional profile is live on ${appName}.`
		: `Add a professional profile to your ${appName} portfolio so agents can discover you more easily.`
)
</script>

