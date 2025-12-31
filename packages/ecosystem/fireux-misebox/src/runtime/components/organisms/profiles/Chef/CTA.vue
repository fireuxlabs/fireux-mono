<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
	<OrganismsProfileCreateSystem
		profile-key="chef"
		:config="chefConfig"
		title="Create your chef profile"
		description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
		v-slot="slotProps"
	>
		<div v-if="slotProps.shouldRender">
			<UPageCTA
				:title="slotProps.title"
				:description="slotProps.description"
				variant="naked"
			>
				<template #links>
					<UButton
						v-if="slotProps.primary.kind === 'link'"
						color="primary"
						size="lg"
						:to="slotProps.primary.to"
					>
						{{ slotProps.primary.label }}
					</UButton>

					<UButton
						v-else
						color="primary"
						size="lg"
						:loading="slotProps.primary.loading"
						:disabled="slotProps.primary.disabled"
						@click="slotProps.primary.onClick"
					>
						{{ slotProps.primary.label }}
					</UButton>
				</template>
			</UPageCTA>

			<p v-if="slotProps.error" class="text-sm text-red-600">
				{{ slotProps.error }}
			</p>
		</div>
	</OrganismsProfileCreateSystem>
</template>

<script setup lang="ts">
import { chefConfig } from '../../../../models/profiles/Chef/Chef.model'
</script>

