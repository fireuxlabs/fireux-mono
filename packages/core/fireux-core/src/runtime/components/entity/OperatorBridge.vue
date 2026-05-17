<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #links>
        <UButton
          v-if="publicTo"
          :to="publicTo"
          color="neutral"
          variant="soft"
          icon="i-lucide-eye"
        >
          Public page
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UCard>
        <div class="space-y-5">
          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft">
              Operator bridge
            </UBadge>
            <UBadge
              :color="authorityColor"
              variant="soft"
            >
              {{ authorityLabel }}
            </UBadge>
          </div>

          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-highlighted">
              {{ entityTitle || entityLabel }}
            </h2>
            <p class="text-sm leading-6 text-muted">
              This page checks whether you can operate this {{ entityLowerLabel }}.
              Editing stays inside the selected console workspace.
            </p>
          </div>

          <UAlert
            v-if="missing"
            color="warning"
            variant="soft"
            title="Public target not found"
            :description="`This ${entityLowerLabel} could not be found from the public route key.`"
          />
          <UAlert
            v-else-if="!signedIn"
            color="neutral"
            variant="soft"
            title="Sign in to continue"
            :description="`Sign in to request or use operator access for this ${entityLowerLabel}.`"
          />
          <UAlert
            v-else-if="hasAuthority"
            color="success"
            variant="soft"
            title="You can operate this target"
            :description="`Open the ${entityLowerLabel} console to manage it in the private runtime workspace.`"
          />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Operator access required"
            :description="`You are signed in, but your user id is not listed as an operator for this ${entityLowerLabel}.`"
          />

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="!signedIn"
              to="/auth"
              color="primary"
              icon="i-lucide-log-in"
            >
              Sign in
            </UButton>
            <UButton
              v-if="signedIn && hasAuthority"
              :to="consoleTo"
              color="primary"
              icon="i-lucide-layout-dashboard"
            >
              Open console
            </UButton>
            <UButton
              v-if="signedIn && !hasAuthority && !missing"
              color="neutral"
              variant="soft"
              icon="i-lucide-key-round"
              disabled
            >
              Request access
            </UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  entityLabel: string
  entityTitle?: string
  publicTo?: string
  consoleTo: string
  signedIn?: boolean
  hasAuthority?: boolean
  missing?: boolean
}>(), {
  entityTitle: '',
  publicTo: '',
  signedIn: false,
  hasAuthority: false,
  missing: false,
})

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'target').trim().toLowerCase()
)
const pageTitle = computed(() => `${props.entityLabel} operator`)
const pageDescription = computed(
  () => 'Public-to-private bridge for operating this target.'
)
const authorityLabel = computed(() => {
  if (props.missing) return 'Not found'
  if (!props.signedIn) return 'Signed out'
  return props.hasAuthority ? 'Operator' : 'No access'
})
const authorityColor = computed(() => {
  if (props.missing || (props.signedIn && !props.hasAuthority)) return 'warning'
  if (props.hasAuthority) return 'success'
  return 'neutral'
})
</script>
