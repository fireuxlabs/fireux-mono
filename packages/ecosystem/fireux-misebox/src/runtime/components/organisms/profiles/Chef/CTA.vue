<!-- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue -->
<template>
	<UPageCTA
		class="fx-cta"
		title="Chef profile"
		description="Showcase your culinary strengths so kitchens can match you to the right stations and menus."
		variant="naked"
	>
		<template #default>
			<div v-if="!hasChefProfile" class="space-y-2">
				<OrganismsProfilesChefCreateSystem />
			</div>

			<div v-else class="fx-cta__body space-y-4">
				<div class="fx-cta__toolbar flex justify-end">
					<UButton v-if="canToggle" size="xs" variant="ghost" @click="toggleView">
						{{ showCellView ? 'Show pill' : 'Show cell' }}
					</UButton>
				</div>

				<div class="fx-cta__panel space-y-4">
					<OrganismsProfilesChefCardsCell
						v-if="showCellCard && cell"
						v-bind="cell"
						:link="Boolean(cell.to)"
						class="block"
					/>
					<OrganismsProfilesChefCardsPill
						v-else-if="pill"
						v-bind="pill"
						:link="Boolean(pill.to)"
						class="block"
					/>
					<p v-else class="fx-cta__empty text-sm text-slate-500">No chef profile loaded.</p>
				</div>
			</div>
		</template>
	</UPageCTA>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed, ref, watch } from 'vue'
import { useChef } from '../../../../composables/fireux/firestore/profiles/Chef/useChef'

const { card } = useChef()
const { hasProfile } = useUser()

const hasChefProfile = computed(() => hasProfile('chef'))

const cell = computed(() => card())
const pill = computed(() => card())
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

