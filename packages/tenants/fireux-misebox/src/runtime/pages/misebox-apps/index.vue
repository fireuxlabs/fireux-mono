<template>
  <div>
    <UCard>
      <template #header>
        <div>
          <h2>Apps & Users</h2>
          <UBadge color="blue" variant="soft">
            {{ apps?.length || 0 }} apps
          </UBadge>
        </div>
      </template>

      <div>
        <UCard v-for="app in apps" :key="app.id">
          <template #header>
            <div>
              <div>
                <h3>{{ app.app_name }}</h3>
                <p>{{ app.id }}</p>
              </div>
              <div>
                <UBadge color="green" variant="soft">
                  {{ getAppUsers(app.id)?._value?.length || 0 }} users
                </UBadge>
                <UBadge color="blue" variant="soft">
                  {{ app.admin_ids?.length || 0 }} admin{{
                    app.admin_ids?.length === 1 ? '' : 's'
                  }}
                </UBadge>
              </div>
            </div>
          </template>

          <div>
            <!-- App Info -->
            <div>
              <UBadge
                v-if="app.created_at"
                color="gray"
                variant="soft"
                size="sm"
              >
                Created {{ new Date(app.created_at).toLocaleDateString() }}
              </UBadge>
              <UBadge
                v-if="app.created_by"
                color="purple"
                variant="soft"
                size="sm"
              >
                By {{ app.created_by }}
              </UBadge>
            </div>

            <!-- Users -->
            <div>
              <h4>Users</h4>

              <div v-if="getAppUsers(app.id)?._value?.length">
                <UCard
                  v-for="user in getAppUsers(app.id)._value.slice(0, 6)"
                  :key="user.uid"
                >
                  <div>
                    <UAvatar
                      :src="user.avatar"
                      :alt="user.display_name || user.handle"
                      size="sm"
                    />
                    <div>
                      <p>
                        {{ user.display_name || user.handle || user.email }}
                      </p>
                      <div>
                        <UBadge
                          :color="user.role === 'admin' ? 'red' : 'gray'"
                          variant="soft"
                          size="xs"
                        >
                          {{ user.role || 'user' }}
                        </UBadge>
                        <UBadge
                          v-if="user.profiles?.length"
                          color="blue"
                          variant="soft"
                          size="xs"
                        >
                          {{ user.profiles[0] }}
                        </UBadge>
                        <UBadge
                          v-if="user.subscription?.is_pro"
                          color="yellow"
                          variant="soft"
                          size="xs"
                        >
                          pro
                        </UBadge>
                      </div>
                    </div>
                  </div>
                </UCard>
              </div>

              <!-- Show More Users -->
              <div v-if="getAppUsers(app.id)?._value?.length > 6">
                <UButton variant="ghost" size="sm">
                  +{{ getAppUsers(app.id)._value.length - 6 }} more users
                </UButton>
              </div>

              <!-- No Users State -->
              <div v-else-if="getAppUsers(app.id)?._value?.length === 0">
                <p>No users in this app yet</p>
                <UButton variant="ghost" size="sm">Add first user</UButton>
              </div>

              <!-- Loading State -->
              <div v-else>
                <p>Loading users...</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- No Apps State -->
      <div v-if="!apps?.length">
        <p>No apps found</p>
        <UButton variant="soft">Create first app</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
const { apps, getAppUsers } = await useMiseApp()
</script>
