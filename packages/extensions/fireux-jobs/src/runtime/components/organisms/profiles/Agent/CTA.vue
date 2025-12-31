<template>
	<OrganismsProfileCreateSystem
		profile-key="agent"
		:config="agentConfig"
		title="Create your agent profile"
		description="Add an agent profile to your FireUX portfolio so talent knows who is hiring."
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
import { agentConfig } from '../../../../models/profiles/Agent/Agent.model'
</script>

