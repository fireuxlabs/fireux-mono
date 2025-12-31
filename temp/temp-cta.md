# CTA Innards (Runtime)

Repo-truth snapshot (runtime only). Auto-generated.

- Included `CTA.vue` files: 9
- Included CTA-like root: `packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue`

---

## Core — App CTA

Path: `packages/core/fireux-core/src/runtime/components/organisms/App/CTA.vue`

```vue
<template>
  <div class="space-y-4">
    <OrganismsAppCardsPreview />

    <UPageCTA title="Manage apps" :description="ctaDescription" variant="naked">
      <template #links>
        <UButton color="primary" size="lg" :to="detailsLink">
          {{ detailsLabel }}
        </UButton>
      </template>
    </UPageCTA>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../../models/core/app.model'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app: runtimeApp } = useApp()

const current = computed<App | null>(() => runtimeApp.value ?? null)

const ctaDescription = computed(() =>
  current.value
    ? 'Inspect the current app or browse all apps available to this runtime.'
    : 'No app loaded. Browse all apps available to this runtime.'
)

const detailsLink = computed(() => {
  const id = current.value?.id
  return id ? `/apps/${id}` : '/apps'
})

const detailsLabel = computed(() =>
  current.value?.id ? 'View app details' : 'Browse apps'
)
</script>
```

## Core — User CTA

Path: `packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue`

```vue
<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <div class="space-y-6">
    <OrganismsUserCardsPreview />

    <OrganismsUserCreateSystem v-slot="slotProps">
      <div v-if="slotProps.shouldRender" class="space-y-3">
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
              v-else-if="slotProps.primary.kind === 'action'"
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
    </OrganismsUserCreateSystem>
  </div>
</template>

<script setup lang="ts">
// CTA logic lives in OrganismsUserCreateSystem.
</script>
```

## Ecosystem — Chef CTA

Path: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`

```vue
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
```

## Ecosystem — Supplier CTA

Path: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue`

```vue
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
```

## Extensions — Blog CTA

Path: `packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CTA.vue`

```vue
<template>
  <UPageCTA
    v-if="showCTA"
    title="Publish a post"
    :description="ctaDescription"
    variant="naked"
  >
    <template #links>
      <UButton color="primary" size="lg" to="/blog/create">
        Draft a post
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlogPermissions } from '../../../../composables/useBlogPermissions'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { canPublishBlog } = useBlogPermissions()
const { appName } = useFireUXConfig()

const showCTA = computed(() => canPublishBlog.value)
const ctaDescription = computed(
  () => `Share updates, releases, and stories for ${appName}.`
)
</script>
```

## Extensions — Job CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CTA.vue`

```vue
<template>
  <OrganismsProfilesAgentCTA v-if="!hasAgentProfile" />
  <UPageCTA
    v-else
    title="Post a job"
    description="Create a job posting to reach professionals across this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsProfileSectionsSingle :title="currentProfileTitle">
        <OrganismsProfilesAgentCardsCell
          v-if="cell"
          :agent="cell"
          class="cta-agent-cell"
        />
        <OrganismsProfilesAgentCardsPill v-if="pill" :agent="pill" />
      </OrganismsProfileSectionsSingle>
    </template>

    <template #links>
      <UButton
        color="primary"
        size="lg"
        to="/jobs/create"
      >
        Create job posting
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

const { pill, cell } = useAgent()
const { hasProfile } = useUser()

const hasAgentProfile = computed(() => hasProfile('agent'))
const currentProfileTitle = 'Your agent profile'
</script>

<style scoped>
.cta-agent-cell {
  margin-bottom: 1.5rem;
}
</style>
```

## Extensions — Agent CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/CTA.vue`

```vue
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
```

## Extensions — Professional CTA

Path: `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/CTA.vue`

```vue
<template>
	<OrganismsProfileCreateSystem
		profile-key="professional"
		:config="professionalConfig"
		title="Create your professional profile"
		description="Add a professional profile to your FireUX portfolio so agents can discover you more easily."
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
import { professionalConfig } from '../../../../models/profiles/Professional/supporting'
</script>
```

## Extensions — Product CTA

Path: `packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/CTA.vue`

```vue
<template>
  <UPageCTA
    v-if="showCTA"
    title="Add a product"
    description="List new offerings or updates for this runtime."
    variant="naked"
  >
    <template #default>
      <p class="text-sm text-gray-600">
        People with publish permissions can keep the catalog current.
      </p>
    </template>

    <template #links>
      <UButton color="primary" size="lg" to="/products/create">
        Create product
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductPermissions } from '../../../../composables/useProductPermissions'

const { canPublishProduct } = useProductPermissions()
const showCTA = computed(() => canPublishProduct.value)
</script>
```

---

## Core — Profile Root (CTA-like)

Path: `packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue`

```vue
<!-- packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue -->
<template>
  <div class="space-y-6">
    <slot name="current" :profile="current" />

    <div v-if="shouldShowCta">
      <UPageSection>
        <UPageCTA :title="cta" variant="naked">
          <template #links>
            <slot name="cta">
              <UButton
                size="lg"
                color="primary"
                :label="ctaLabel"
                @click="$emit('ensure')"
              />
            </slot>
          </template>
        </UPageCTA>
      </UPageSection>
    </div>

    <UPageSection>
      <div class="flex items-center gap-2 mb-3">
        <slot name="list-header" />
        <UButton
          v-if="more"
          size="xs"
          variant="ghost"
          @click="$emit('load-more')"
        >
          {{ moreLabel }}
        </UButton>
      </div>

      <div
        v-if="items?.length"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <slot
          v-for="it in items"
          name="item"
          :key="it?.id || it?.uid"
          :profile="it"
        />
      </div>
      <p v-else class="opacity-70">{{ emptyText }}</p>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current?: any | null
    items?: any[]
    cta?: string
    ctaLabel?: string
    emptyText?: string
    more?: boolean
    moreLabel?: string
    ctaVisible?: boolean
  }>(),
  {
    current: null,
    items: () => [],
    cta: 'Complete your profile',
    ctaLabel: 'Create',
    emptyText: 'Nothing to show yet.',
    more: false,
    moreLabel: 'Load more',
    ctaVisible: undefined,
  }
)

defineEmits<{ (e: 'ensure'): void; (e: 'load-more'): void }>()

const shouldShowCta = computed(() =>
  props.ctaVisible !== undefined ? props.ctaVisible : props.current == null
)
</script>
```
