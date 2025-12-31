<template>
	<OrganismsProfileCreateSystem
		profile-key="supplier"
		:config="supplierConfig"
		title="Create your supplier profile"
		description="Introduce your products to chefs and venues across the FireUX network."
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
import { supplierConfig } from '../../../../models/profiles/Supplier/Supplier.model'
</script>

