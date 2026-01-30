<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
	<UPageCTA
		class="cta"
		title="Chef profile"
		description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
		variant="subtle"
		orientation="horizontal"
	>
		<template #default>
			<div v-if="card()" class="cta__body space-y-4">
				<OrganismsProfilesChefCardsPreview v-bind="card()" />
			</div>

			<div v-else class="cta__body space-y-2">
				<OrganismsProfilesChefCreateSystem />
			</div>
		</template>
	</UPageCTA>
</template>

<script setup lang="ts">
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef';

const { card } = useChef()

</script>

