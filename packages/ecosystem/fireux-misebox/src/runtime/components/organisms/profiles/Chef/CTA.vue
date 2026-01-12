<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
	<UPageCTA
		title="Chef profile"
		description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
		variant="naked"
	>
		<template #default>
			<div v-if="!hasChefProfile" class="space-y-2">
				<OrganismsProfilesChefCreateSystem />
			</div>

			<div v-else class="space-y-4">
				<div class="flex justify-end">
					<UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
						{{ showCellView ? 'Show pill' : 'Show cell' }}
					</UButton>
				</div>

				<div class="space-y-4">
					<OrganismsProfilesChefCardsCell v-if="showCellCard && cell" :chef="cell" />
					<OrganismsProfilesChefCardsPill v-else-if="pill" v-bind="pill" />
					<p v-else class="text-sm text-slate-500">No chef profile loaded.</p>
				</div>
			</div>
		</template>
	</UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'

const { pill, cell } = useChef()
const { hasProfile } = useUser()

const hasChefProfile = computed(() => hasProfile('chef'))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)
const toggleView = () => {
	if (!canToggle.value) return
	showCellView.value = !showCellView.value
}

watch(canToggle, (enabled: boolean) => {
	if (!enabled) showCellView.value = false
})
</script>

