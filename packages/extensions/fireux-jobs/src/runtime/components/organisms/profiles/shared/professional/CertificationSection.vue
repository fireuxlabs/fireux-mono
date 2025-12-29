<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100"
    >
      <UIcon name="i-lucide-award" class="h-5 w-5 text-gray-400" />
      <h2>Certifications</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-gray-100 p-4 shadow-sm dark:border-gray-800"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="item.logo"
            :src="item.logo"
            :alt="item.name || 'Certification logo'"
            class="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
          />

          <div class="flex-1 space-y-2">
            <div class="space-y-1">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {{ item.name }}
              </h3>
              <p
                v-if="item.issuer"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                {{ item.issuer }}
              </p>
            </div>

            <p
              v-if="item.year"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              Issued {{ item.year }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CertificationItem {
  id: string
  name: string | null
  issuer: string | null
  year: string | null
  logo: string | null
}

defineProps<{ items: CertificationItem[] }>()
</script>
