<template>
	<component
		:is="link && to ? 'NuxtLink' : 'div'"
		:to="link && to ? to : undefined"
		@click="onClick"
		class="pill"
	>
		<div class="flex min-w-0 items-start gap-2">
			<UAvatar
				:src="avatarUrl || undefined"
				:alt="title || ''"
				size="sm"
			/>

			<div class="min-w-0 flex-1 space-y-1">
				<p class="truncate text-sm font-medium text-highlighted">
					{{ title }}
				</p>
				<p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
					{{ subtitle }}
				</p>
				<div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
					<UBadge v-for="badge in badges" :key="badge" variant="soft" color="neutral" size="xs">
						{{ badge }}
					</UBadge>
				</div>
			</div>
		</div>
	</component>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface';

const emit = defineEmits<{
	(event: 'action'): void
}>()

const props = withDefaults(
	defineProps<
		Pick<SupplierCard.Card, 'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'> & {
			showSubtitle?: boolean
			showBadges?: boolean
			link?: boolean
			action?: boolean
		}
	>(),
	{
		badges: () => [],
		showSubtitle: true,
		showBadges: true,
		link: false,
		action: false,
	}
)

const onClick = () => {
	if (props.action) emit('action')
}
</script>
