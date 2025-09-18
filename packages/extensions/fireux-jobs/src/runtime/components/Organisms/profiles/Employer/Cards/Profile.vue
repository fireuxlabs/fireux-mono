<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="
          (employer as any)?.avatar ||
          (employer as any)?.avatarUrl ||
          (employer as any)?.profile_image?.url
        "
        :alt="
          (employer as any)?.name ||
          (employer as any)?.company_name ||
          'Employer'
        "
        size="lg"
      />
      <div class="profile-info">
        <h4
          v-if="(employer as any)?.name || (employer as any)?.company_name"
          class="profile-name"
        >
          {{ (employer as any)?.name || (employer as any)?.company_name }}
        </h4>
        <p v-if="(employer as any)?.business_type" class="profile-subtitle">
          {{ (employer as any).business_type }}
        </p>
        <div
          v-if="(employer as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon name="i-lucide-map-pin" />
          <span>{{ (employer as any).locations[0]?.formatted_address }}</span>
        </div>
        <div v-if="(employer as any)?.years_established" class="profile-meta">
          Est. {{ (employer as any).years_established }}
        </div>
      </div>
    </div>
    <p
      v-if="
        (employer as any)?.bioLong ||
        (employer as any)?.bio_long ||
        (employer as any)?.bioShort ||
        (employer as any)?.bio_short
      "
      class="profile-bio"
    >
      {{
        (employer as any)?.bioLong ||
        (employer as any)?.bio_long ||
        (employer as any)?.bioShort ||
        (employer as any)?.bio_short
      }}
    </p>

    <div
      v-if="
        employer?.specialties?.length ||
        (employer as any)?.cuisine_types?.length
      "
      class="profile-tags"
    >
      <span
        v-for="specialty in (
          (employer?.specialties ??
            (employer as any)?.cuisine_types ??
            []) as string[]
        ).slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span
        v-if="
          (
            (employer?.specialties ??
              (employer as any)?.cuisine_types ??
              []) as string[]
          ).length > 3
        "
        class="tag-more"
      >
        +{{
          (
            (employer?.specialties ??
              (employer as any)?.cuisine_types ??
              []) as string[]
          ).length - 3
        }}
        more
      </span>
    </div>

    <div v-if="(employer as any)?.benefits?.length" class="profile-section">
      <strong class="section-label">Benefits:</strong>
      <span
        v-for="benefit in (employer as any).benefits.slice(0, 2)"
        :key="benefit"
        class="tag"
      >
        {{ benefit }}
      </span>
      <span v-if="(employer as any).benefits.length > 2" class="tag-more">
        +{{ (employer as any).benefits.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="(employer as any)?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ (employer as any).employee_count }} employees</span>
      </div>
      <div v-if="(employer as any)?.active_jobs?.length" class="profile-stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ (employer as any).active_jobs.length }} open positions</span>
      </div>
      <div v-if="(employer as any)?.company_size" class="profile-stat">
        <UIcon name="i-lucide-building" />
        <span>{{ (employer as any).company_size }} company</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Employer } from '../../../../../models/profiles/Employer.model'

const props = defineProps<{
  employer?: Partial<Employer>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.employer) {
    props.navigate(props.employer)
  }
}
</script>
