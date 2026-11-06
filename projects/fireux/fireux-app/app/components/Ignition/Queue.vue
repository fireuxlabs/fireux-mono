<!-- Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: show which public surface produced each request. -->
<template>
  <section class="pagebody">
    <UButton
      to="/workspace/project/ignition-reconciliation"
      label="Reconcile the Misebox reference build"
      icon="i-lucide-git-compare-arrows"
      variant="soft"
      color="neutral"
    />
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="fx-type-section-title">Ignition requests</h2>
        <p class="fx-type-caption">
          Accept a request, then work through its launch checklist.
        </p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        :loading="pending"
        @click="refresh()"
      >
        Refresh
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Ignition requests could not be loaded"
      description="Refresh the page and try again."
    />

    <UAlert
      v-if="mutationError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Request not updated"
      :description="mutationError"
    />

    <UCard v-if="pending && !items.length">
      <p class="fx-type-caption">Loading requests...</p>
    </UCard>

    <UCard v-else-if="!items.length && !error">
      <p class="fx-type-body">No Ignition requests yet.</p>
      <p class="mt-1 fx-type-caption">
        New requests from /get-started will appear here.
      </p>
    </UCard>

    <UCard v-for="request in items" :key="request.id">
      <template #header>
        <div class="card__header">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="fx-type-card-heading">
                {{ request.business.name || 'Unnamed business' }}
              </h3>
              <UBadge :color="statusColor(request.status)" variant="soft">
                {{ statusLabel(request.status) }}
              </UBadge>
              <NuxtLink
                v-if="request.origin"
                :to="originTo(request.origin)"
                class="hover:underline"
              >
                {{ originLabel(request.origin) }}
              </NuxtLink>
            </div>
            <p class="mt-1 fx-type-caption">
              {{ request.contact.name }} · {{ formatDate(request.created_at) }}
            </p>
          </div>

          <USelect
            :model-value="request.status"
            :items="statusOptions"
            :disabled="isUpdating(request.id, 'status')"
            @update:model-value="setStatus(request, String($event))"
          />
        </div>
      </template>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div class="fx-card-body-stack">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <p class="fx-type-caption">Contact</p>
              <a
                :href="`mailto:${request.contact.email}`"
                class="mt-1 block hover:underline"
              >
                {{ request.contact.email }}
              </a>
            </div>
            <div>
              <p class="fx-type-caption">Website</p>
              <a
                v-if="request.business.website"
                :href="request.business.website"
                class="mt-1 block break-all hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {{ request.business.website }}
              </a>
              <p v-else class="mt-1 fx-type-body">None</p>
            </div>
            <div>
              <p class="fx-type-caption">Branding</p>
              <p class="mt-1 fx-type-body">
                {{ brandingLabel(request.business.branding) }}
              </p>
            </div>
            <div>
              <p class="fx-type-caption">Pages</p>
              <p class="mt-1 fx-type-body">
                {{ request.pages.join(', ') || 'None' }}
              </p>
            </div>
          </div>

          <div>
            <p class="fx-type-caption">One job</p>
            <p class="mt-1 whitespace-pre-wrap fx-type-body">
              {{ request.app_job }}
            </p>
          </div>

          <div>
            <p class="fx-type-caption">Access</p>
            <p class="mt-1 whitespace-pre-wrap fx-type-body">
              {{ request.access }}
            </p>
          </div>
        </div>

        <div class="space-y-3 rounded-lg border border-default p-4">
          <div class="card__header">
            <h4 class="fx-type-card-heading">Delivery</h4>
            <UBadge color="neutral" variant="soft">
              {{ completedCount(request) }}/{{ checklist.length }}
            </UBadge>
          </div>

          <p v-if="request.status === 'new'" class="fx-type-caption">
            Accept this request to start delivery.
          </p>

          <div class="fx-card-body-stack">
            <UCheckbox
              v-for="step in checklist"
              :key="step.key"
              :model-value="request.delivery[step.key]"
              :label="step.label"
              :disabled="
                request.status === 'new' ||
                request.status === 'declined' ||
                isUpdating(request.id, step.key)
              "
              @update:model-value="
                setChecklist(request, step.key, Boolean($event))
              "
            />
          </div>
        </div>
      </div>

      <template #footer>
        <p class="fx-type-code">{{ request.id }}</p>
      </template>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useIgnitionQueue } from '../../composables/useIgnitionQueue'

const {
  brandingLabel,
  checklist,
  completedCount,
  error,
  formatDate,
  isUpdating,
  items,
  mutationError,
  originLabel,
  originTo,
  pending,
  refresh,
  setChecklist,
  setStatus,
  statusColor,
  statusLabel,
  statusOptions,
} = useIgnitionQueue()
</script>
