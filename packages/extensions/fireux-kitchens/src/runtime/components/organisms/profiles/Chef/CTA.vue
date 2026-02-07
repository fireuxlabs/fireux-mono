<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
	<UPageCTA
		class="cta"
		title="Chef profile"
		description="Create your chef profile so venues can find you."
		variant="subtle"
		orientation="horizontal"
	>
		<div v-if="card()" class="cta__body space-y-4">
			<OrganismsProfilesChefCardsPreview v-bind="card()" :link="true" />
		</div>

		<div v-else class="cta__body space-y-2">
			<OrganismsProfilesChefCreateSystem />
		</div>
	</UPageCTA>
</template>

<script setup lang="ts">
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef';

const { card } = useChef()

</script>

