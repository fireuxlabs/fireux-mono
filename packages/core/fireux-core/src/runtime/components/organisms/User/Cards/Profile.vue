<template>
  <UCard>
    <div class="profile">
      <!-- Header: avatar, name, email, role badge -->
      <div class="header">
        <UAvatar
          :src="user?.avatar || ''"
          :alt="
            user?.display_name ||
            user?.handle ||
            user?.email ||
            user?.id ||
            'User'
          "
          size="lg"
        />
        <div class="id-block">
          <h2 class="name">
            {{
              user?.display_name ||
              user?.handle ||
              user?.email ||
              user?.id ||
              'User'
            }}
          </h2>
          <div class="sub">
            <span v-if="user?.email" class="email">{{ user.email }}</span>
          </div>
        </div>
      </div>

      <USeparator class="my-3" />

      <!-- Context chips -->
      <div class="chips">
        <UBadge v-if="user?.appId" variant="subtle" color="neutral"
          >App: {{ user.appId }}</UBadge
        >
        <UBadge v-if="user?.created_in" variant="subtle" color="neutral"
          >Created in: {{ user.created_in }}</UBadge
        >
      </div>

      <!-- Memberships -->
      <div class="grid memberships">
        <div>
          <h3 class="section">Admin of</h3>
          <div class="chip-row">
            <template
              v-if="Array.isArray(user?.adminOf) && user.adminOf.length"
            >
              <UBadge
                v-for="a in user.adminOf"
                :key="`admin-${a}`"
                size="xs"
                variant="soft"
                >{{ a }}</UBadge
              >
            </template>
            <span v-else class="muted">—</span>
          </div>
        </div>
        <div>
          <h3 class="section">Member of</h3>
          <div class="chip-row">
            <template v-if="Array.isArray(user?.userOf) && user.userOf.length">
              <UBadge
                v-for="m in user.userOf"
                :key="`member-${m}`"
                size="xs"
                variant="soft"
                >{{ m }}</UBadge
              >
            </template>
            <span v-else class="muted">—</span>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="details">
        <div class="row">
          <span class="label">User ID</span>
          <span class="value mono">{{ user?.id }}</span>
        </div>
        <div class="row" v-if="user?.created_at">
          <span class="label">Created</span>
          <span class="value flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="size-4 text-dimmed" />
            {{ String(user.created_at) }}
          </span>
        </div>
        <div class="row" v-if="user?.updated_at">
          <span class="label">Updated</span>
          <span class="value flex items-center gap-1">
            <UIcon name="i-lucide-refresh-cw" class="size-4 text-dimmed" />
            {{ String(user.updated_at) }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Accept any user-like shape for now; template is resilient to partials
defineProps<{ user: any }>()
</script>

<style scoped>
.header {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.id-block .name {
  font-weight: 800;
}
.sub .email {
  opacity: 0.8;
  font-size: 0.9rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.memberships {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}
.section {
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.timestamps {
  opacity: 0.7;
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
.details {
  margin-top: 1rem;
  display: grid;
  gap: 0.5rem;
}
.details .row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.details .label {
  opacity: 0.7;
}
.details .value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}
.muted {
  opacity: 0.6;
}
</style>
