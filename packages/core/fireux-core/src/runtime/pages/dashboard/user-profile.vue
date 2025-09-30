<template>
  <UDashboardPanel id="profile">
    <template #header>
      <UDashboardNavbar title="Your Profile" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <client-only>
        <div v-if="user">
          <!-- Top row: profile preview + quick editor -->
          <div class="grid gap-4 md:grid-cols-2">
            <OrganismsUserCardsProfile :user="user" />
            <OrganismsUserEdit :user="user" />
          </div>

          <!-- Details rows: account, memberships, timestamps -->
          <div class="grid gap-4 md:grid-cols-2 mt-4">
            <!-- Account -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-user" class="w-5 h-5" />
                  <span>Account</span>
                </div>
              </template>
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <span class="text-gray-500">Email</span>
                  <span class="text-gray-900">{{ primaryEmail || '—' }}</span>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <span class="text-gray-500">Handle</span>
                  <span class="text-gray-900">{{ handleDisplay }}</span>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <span class="text-gray-500">Role</span>
                  <span class="text-gray-900">{{ roleDisplay }}</span>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <span class="text-gray-500">User ID</span>
                  <code class="text-gray-900 text-xs">{{ user.id }}</code>
                </div>
              </div>
            </UCard>

            <!-- Memberships -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-users" class="w-5 h-5" />
                  <span>Memberships</span>
                </div>
              </template>
              <div class="space-y-4">
                <div>
                  <div class="text-gray-500 mb-2">Admin of</div>
                  <div v-if="adminOf?.length" class="flex flex-wrap gap-2">
                    <UBadge v-for="appId in adminOf" :key="appId" color="primary" variant="soft">{{ appId }}</UBadge>
                  </div>
                  <div v-else class="text-gray-400">—</div>
                </div>
                <div>
                  <div class="text-gray-500 mb-2">User of</div>
                  <div v-if="userOf?.length" class="flex flex-wrap gap-2">
                    <UBadge v-for="appId in userOf" :key="appId" color="gray" variant="soft">{{ appId }}</UBadge>
                  </div>
                  <div v-else class="text-gray-400">—</div>
                </div>
              </div>
            </UCard>

            <!-- Contact -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-phone" class="w-5 h-5" />
                  <span>Contact</span>
                </div>
              </template>
              <div class="space-y-4">
                <MoleculesFormsFirestoreField
                  label="Phone"
                  type="phone"
                  :firebase-value="phoneValue"
                  placeholder="(555) 555-5555"
                  :update-function="onSavePhone"
                />
              </div>
            </UCard>

            <!-- About -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
                  <span>About</span>
                </div>
              </template>
              <div class="space-y-4">
                <MoleculesFormsFirestoreField
                  label="Bio"
                  type="textarea"
                  :rows="5"
                  :firebase-value="bioValue"
                  placeholder="Tell us about yourself"
                  :update-function="onSaveBio"
                />
                <MoleculesFormsFirestoreSocialLinks
                  :firebase-value="socialLinksValue"
                  :update-function="onSaveSocialLinks"
                />
              </div>
            </UCard>

            <!-- Profiles -->
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-rectangle-group" class="w-5 h-5" />
                  <span>Profiles</span>
                </div>
              </template>
              <div class="space-y-4">
                <div>
                  <div class="text-gray-500 mb-2">App Profiles</div>
                  <div v-if="appProfiles?.length" class="flex flex-wrap gap-2">
                    <UBadge v-for="p in appProfiles" :key="p" color="primary" variant="soft">{{ p }}</UBadge>
                  </div>
                  <div v-else class="text-gray-400">—</div>
                </div>
                <div>
                  <div class="text-gray-500 mb-2">Global Profiles</div>
                  <div v-if="globalProfiles?.length" class="flex flex-wrap gap-2">
                    <UBadge v-for="p in globalProfiles" :key="p" color="gray" variant="soft">{{ p }}</UBadge>
                  </div>
                  <div v-else class="text-gray-400">—</div>
                </div>
              </div>
            </UCard>

            <!-- Timestamps -->
            <UCard class="md:col-span-2">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-clock" class="w-5 h-5" />
                  <span>Timestamps</span>
                </div>
              </template>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <div class="font-medium">Core</div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Created</span>
                    <span class="text-gray-900">{{ formatTs(user.core?.created_at) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Updated</span>
                    <span class="text-gray-900">{{ formatTs(user.core?.updated_at) }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="font-medium">App</div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Created</span>
                    <span class="text-gray-900">{{ formatTs(user.app?.created_at) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Updated</span>
                    <span class="text-gray-900">{{ formatTs(user.app?.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
        <div v-else>
          <UCard>
            <div class="text-center py-8">
              <UIcon
                name="i-heroicons-user-circle"
                class="w-12 h-12 mx-auto mb-4 text-gray-400"
              />
              <p>Loading profile...</p>
            </div>
          </UCard>
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

useHead({ title: 'Your Profile' })

const { user, isAdmin } = useUser()
const { updateFields } = useUser()

const primaryEmail = computed(
  () => user.value?.app?.email || user.value?.core?.email || ''
)
const handleDisplay = computed(() => {
  const h = user.value?.app?.handle || user.value?.core?.handle || ''
  return h ? `@${h}` : '—'
})
const roleDisplay = computed(() => {
  const role = user.value?.app?.role
  if (isAdmin?.value) return 'Admin'
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'
})
const adminOf = computed(() => user.value?.core?.adminOf || [])
const userOf = computed(() => user.value?.core?.userOf || [])
const appProfiles = computed(() => user.value?.app?.app_profiles || [])
const globalProfiles = computed(() => user.value?.core?.global_profiles || [])

// Contact/About values
const phoneValue = computed(() => user.value?.app?.phone || user.value?.core?.phone || '')
const bioValue = computed(() => user.value?.app?.bio || user.value?.core?.bio || '')
const socialLinksValue = computed(() => user.value?.app?.social_links || user.value?.core?.social_links || {})

// Update handlers (generic)
const onSavePhone = (v) => updateFields({ phone: v })
const onSaveBio = (v) => updateFields({ bio: v })
const onSaveSocialLinks = (v) => updateFields({ social_links: v })

function formatTs(ts) {
  if (!ts) return '—'
  try {
    // Firebase Timestamp or Date
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString()
  } catch {
    return String(ts)
  }
}
</script>
