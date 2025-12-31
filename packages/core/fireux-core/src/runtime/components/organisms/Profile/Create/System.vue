<template>
	<slot v-bind="slotProps" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProfileConfig } from '../../../../models/core/profile.model'
import { useProfileEnsure } from '../../../../composables/fireux/firestore/core/profile/mutations/useProfileEnsure'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser'

type Primary =
	| { kind: 'link'; to: string; label: string }
	| {
			kind: 'action'
			label: string
			disabled: boolean
			loading: boolean
			onClick: () => Promise<void>
	  }

type SlotProps = {
	shouldRender: boolean
	title: string
	description: string
	primary: Primary
	error: string
}

const props = defineProps<{
	profileKey: string
	config: ProfileConfig
	title: string
	description: string
}>()

const { hasProfile, cta } = useUser()
const { ensure } = useProfileEnsure(props.config)

const isEnsuring = ref(false)
const errorMessage = ref('')

const shouldRender = computed(() => !hasProfile(props.profileKey))

const ctaKey = computed(() => cta.value?.key ?? 'avatar')
const isSignIn = computed(() => ctaKey.value === 'sign-in')

const actionLabel = computed(() => {
	const typeLabel = (props.config.profileType || props.profileKey).toLowerCase()
	return `Create ${typeLabel} profile`
})

const handleEnsure = async () => {
	if (isEnsuring.value) return

	isEnsuring.value = true
	errorMessage.value = ''

	try {
		await ensure()
	} catch (error) {
		errorMessage.value =
			error instanceof Error
				? error.message
				: 'Unable to create this profile. Please try again.'
	} finally {
		isEnsuring.value = false
	}
}

const primary = computed<Primary>(() => {
	if (isSignIn.value) {
		return {
			kind: 'link',
			to: cta.value?.to ?? '/auth',
			label: cta.value?.label ?? 'Sign in',
		}
	}

	return {
		kind: 'action',
		label: actionLabel.value,
		disabled: isEnsuring.value,
		loading: isEnsuring.value,
		onClick: handleEnsure,
	}
})

const slotProps = computed<SlotProps>(() => ({
	shouldRender: shouldRender.value,
	title: props.title,
	description: props.description,
	primary: primary.value,
	error: errorMessage.value,
}))
</script>
