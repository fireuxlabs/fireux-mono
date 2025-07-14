<template>
  <div v-if="hasContactInfo" class="contact-methods">
    <div
      v-for="contact in contactMethods"
      :key="contact.key"
      class="contact-item"
    >
      <UIcon :name="contact.icon" class="contact-icon" />
      <div class="contact-content">
        <span class="contact-label">{{ contact.label }}</span>
        <component
          :is="contact.component"
          :href="contact.href"
          class="contact-link"
        >
          {{ contact.value }}
        </component>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">
    <p>No contact information available</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: Record<string, any>
  config?: {
    fields?: string[]
  }
}

const props = defineProps<Props>()

interface ContactMethod {
  key: string
  label: string
  icon: string
  component: string
  href?: string
  value: string
}

const contactMethods = computed(() => {
  const methods: ContactMethod[] = []
  const fields = props.config?.fields || [
    'contactEmail',
    'email',
    'website',
    'phone',
  ]

  fields.forEach((field) => {
    const value = props.data?.[field]
    if (value) {
      methods.push(getContactMethod(field, value))
    }
  })

  return methods
})

const hasContactInfo = computed(() => contactMethods.value.length > 0)

function getContactMethod(field: string, value: string): ContactMethod {
  const configs = {
    contactEmail: {
      key: 'email',
      label: 'Email',
      icon: 'i-heroicons-envelope',
      component: 'a',
      href: `mailto:${value}`,
      value,
    },
    email: {
      key: 'email',
      label: 'Email',
      icon: 'i-heroicons-envelope',
      component: 'a',
      href: `mailto:${value}`,
      value,
    },
    website: {
      key: 'website',
      label: 'Website',
      icon: 'i-heroicons-globe-alt',
      component: 'a',
      href: value,
      value: formatWebsite(value),
    },
    phone: {
      key: 'phone',
      label: 'Phone',
      icon: 'i-heroicons-phone',
      component: 'a',
      href: `tel:${value}`,
      value,
    },
  }

  return (
    configs[field as keyof typeof configs] || {
      key: field,
      label: field,
      icon: 'i-heroicons-information-circle',
      component: 'span',
      href: undefined,
      value,
    }
  )
}

function formatWebsite(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>

<style scoped>
.contact-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.contact-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-600);
  margin-top: 0.125rem;
}

.contact-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  flex: 1;
}

.contact-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.contact-link {
  font-size: 0.875rem;
  color: var(--primary-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-secondary);
  font-style: italic;
}
</style>
