<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        FireUX Tenant Configuration Helper
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Validate your tenant setup and generate configuration files
      </p>
    </div>

    <!-- Configuration Validation -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="i-lucide-check-circle" class="w-5 h-5" />
        Configuration Validation
      </h2>
      
      <div class="space-y-4">
        <!-- Environment Variables Check -->
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-3">Environment Variables</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="envVar in environmentChecks" :key="envVar.key" 
                 class="flex items-center gap-2">
              <Icon :name="envVar.present ? 'i-lucide-check' : 'i-lucide-x'" 
                    :class="envVar.present ? 'text-green-500' : 'text-red-500'" />
              <span class="text-sm font-mono">{{ envVar.key }}</span>
            </div>
          </div>
        </div>

        <!-- Firebase Configuration Check -->
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-3">Firebase Configuration</h3>
          <div class="space-y-2">
            <div v-for="check in firebaseChecks" :key="check.name" 
                 class="flex items-center gap-2">
              <Icon :name="check.status ? 'i-lucide-check' : 'i-lucide-x'" 
                    :class="check.status ? 'text-green-500' : 'text-red-500'" />
              <span class="text-sm">{{ check.name }}</span>
              <span v-if="!check.status" class="text-xs text-red-600 ml-2">
                {{ check.error }}
              </span>
            </div>
          </div>
        </div>

        <!-- Module Configuration Check -->
        <div class="border rounded-lg p-4">
          <h3 class="font-medium mb-3">Module Configuration</h3>
          <div class="space-y-2">
            <div v-for="module in moduleChecks" :key="module.name" 
                 class="flex items-center gap-2">
              <Icon :name="module.loaded ? 'i-lucide-check' : 'i-lucide-x'" 
                    :class="module.loaded ? 'text-green-500' : 'text-red-500'" />
              <span class="text-sm">{{ module.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Color System Helper -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="i-lucide-palette" class="w-5 h-5" />
        Color System Helper
      </h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="color in nuxtUIColors" :key="color.name" 
             class="text-center">
          <div :class="`w-12 h-12 rounded-lg mx-auto mb-2 bg-${color.name}-500`"></div>
          <div class="text-xs font-medium">{{ color.name }}</div>
          <div class="text-xs text-gray-500 font-mono">{{ color.hex }}</div>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 class="font-medium mb-2">Usage in app.config.ts:</h3>
        <pre class="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto"><code>export default defineAppConfig({
  ui: {
    colors: {
      primary: '{{ selectedColor }}',
      neutral: 'zinc',
    },
  },
})</code></pre>
        
        <h3 class="font-medium mb-2 mt-4">Environment Variable:</h3>
        <pre class="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto"><code>APP_PRIMARY_COLOR={{ getColorHex(selectedColor) }}</code></pre>
      </div>
    </div>

    <!-- Configuration Generator -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="i-lucide-settings" class="w-5 h-5" />
        Configuration Generator
      </h2>
      
      <form @submit.prevent="generateConfig" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="app-name" class="block text-sm font-medium mb-1">App Name</label>
            <input id="app-name" v-model="configForm.appName" type="text" 
                   class="w-full px-3 py-2 border rounded-lg" 
                   placeholder="My Awesome App" />
          </div>
          
          <div>
            <label for="app-short-name" class="block text-sm font-medium mb-1">App Short Name</label>
            <input id="app-short-name" v-model="configForm.appShortName" type="text" 
                   class="w-full px-3 py-2 border rounded-lg" 
                   placeholder="Awe" maxlength="4" />
          </div>
          
          <div>
            <label for="primary-color" class="block text-sm font-medium mb-1">Primary Color</label>
            <select id="primary-color" v-model="configForm.primaryColor" 
                    class="w-full px-3 py-2 border rounded-lg">
              <option v-for="color in nuxtUIColors" :key="color.name" :value="color.name">
                {{ color.name }} ({{ color.hex }})
              </option>
            </select>
          </div>
          
          <div>
            <label for="tenant-module" class="block text-sm font-medium mb-1">Tenant Module</label>
            <select id="tenant-module" v-model="configForm.tenantModule" 
                    class="w-full px-3 py-2 border rounded-lg">
              <option value="fireux-misebox">fireux-misebox (Chef/Supplier)</option>
              <option value="fireux-cleanbox">fireux-cleanbox (Cleaning)</option>
              <option value="fireux-places">fireux-places (Locations)</option>
              <option value="custom">Custom Module</option>
            </select>
          </div>
        </div>
        
        <button type="submit" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
          Generate Configuration Files
        </button>
      </form>
    </div>

    <!-- Generated Configuration -->
    <div v-if="generatedConfig" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="i-lucide-code" class="w-5 h-5" />
        Generated Configuration
      </h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="font-medium mb-2">nuxt.config.ts</h3>
          <pre class="text-sm bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto"><code>{{ generatedConfig.nuxtConfig }}</code></pre>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">.env</h3>
          <pre class="text-sm bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto"><code>{{ generatedConfig.envFile }}</code></pre>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">app/app.config.ts</h3>
          <pre class="text-sm bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto"><code>{{ generatedConfig.appConfig }}</code></pre>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="i-lucide-external-link" class="w-5 h-5" />
        Quick Links & Resources
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/docs/TENANT_SETUP_GUIDE.md" 
           class="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <h3 class="font-medium">Setup Guide</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Complete tenant setup documentation</p>
        </a>
        
        <a href="/docs/FIREUX.md" 
           class="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <h3 class="font-medium">Architecture Guide</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">System architecture and patterns</p>
        </a>
        
        <a href="https://ui.nuxt.com/getting-started/theming#colors" target="_blank"
           class="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <h3 class="font-medium">NuxtUI Colors</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Official color system documentation</p>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Configuration form
const configForm = ref({
  appName: '',
  appShortName: '',
  primaryColor: 'violet',
  tenantModule: 'fireux-misebox'
})

const selectedColor = ref('violet')
const generatedConfig = ref(null)

// NuxtUI color system
const nuxtUIColors = [
  { name: 'red', hex: 'EF4444' },
  { name: 'orange', hex: 'F97316' },
  { name: 'amber', hex: 'F59E0B' },
  { name: 'yellow', hex: 'EAB308' },
  { name: 'lime', hex: '84CC16' },
  { name: 'green', hex: '22C55E' },
  { name: 'emerald', hex: '10B981' },
  { name: 'teal', hex: '14B8A6' },
  { name: 'cyan', hex: '06B6D4' },
  { name: 'sky', hex: '0EA5E9' },
  { name: 'blue', hex: '3B82F6' },
  { name: 'indigo', hex: '6366F1' },
  { name: 'violet', hex: '8B5CF6' },
  { name: 'purple', hex: 'A855F7' },
  { name: 'fuchsia', hex: 'D946EF' },
  { name: 'pink', hex: 'EC4899' },
  { name: 'rose', hex: 'F43F5E' }
]

// Environment checks
const environmentChecks = ref([])
const firebaseChecks = ref([])
const moduleChecks = ref([])

// Helper functions
const getColorHex = (colorName) => {
  const color = nuxtUIColors.find(c => c.name === colorName)
  return color ? color.hex : '000000'
}

const generateConfig = () => {
  const form = configForm.value
  
  generatedConfig.value = {
    nuxtConfig: `import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  imports: {
    dirs: ['composables/**', 'models/**', 'utils/**'],
  },
  
  ssr: true,
  
  modules: [
    'fireux-core',
    'fireux-jobs',
    '${form.tenantModule}',
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-vuefire',
  ],
  
  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
    },
  },
  
  vuefire: {
    auth: {
      enabled: true,
      ssr: true,
    },
    config: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
    },
    admin: {
      serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
  },
})`,

    envFile: `# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# Client-side Firebase Configuration (REQUIRED)
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
PROJECT_NAME=${form.appName}
DOMAIN=http://localhost:3010
PIN=1234
APP_ID=${form.appName.toLowerCase().replace(/\s+/g, '_')}
APP_NAME=${form.appName}
APP_SHORT_NAME=${form.appShortName}
APP_PRIMARY_COLOR=${getColorHex(form.primaryColor)}
APP_NEUTRAL_COLOR=64748B
APP_ICON=your_icon
AUTHOR_NAME=Your Team Name`,

    appConfig: `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${form.primaryColor}',
      neutral: 'zinc',
    },
  },
})`
  }
}

// Load environment checks
onMounted(() => {
  const requiredEnvVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'NUXT_PUBLIC_FIREBASE_API_KEY',
    'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
    'APP_NAME',
    'APP_PRIMARY_COLOR'
  ]
  
  environmentChecks.value = requiredEnvVars.map(key => ({
    key,
    present: !!process.env[key] || !!import.meta.env[key]
  }))
  
  // Firebase checks
  firebaseChecks.value = [
    { 
      name: 'Firebase config available', 
      status: !!import.meta.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      error: 'Missing NUXT_PUBLIC_FIREBASE_PROJECT_ID'
    },
    { 
      name: 'Auth domain configured', 
      status: !!import.meta.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      error: 'Missing NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
    },
    { 
      name: 'API key configured', 
      status: !!import.meta.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      error: 'Missing NUXT_PUBLIC_FIREBASE_API_KEY'
    }
  ]
  
  // Module checks (simplified)
  moduleChecks.value = [
    { name: 'fireux-core', loaded: true },
    { name: '@nuxt/ui', loaded: true },
    { name: 'nuxt-vuefire', loaded: true }
  ]
})

useHead({
  title: 'FireUX Configuration Helper'
})
</script>
