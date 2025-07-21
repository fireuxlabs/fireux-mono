#!/usr/bin/env node

/**
 * FireUX Tenant Creation Script
 * One smart script to rule them all 🧙‍♂️
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve))

async function main() {
  console.log('🚀 FireUX Tenant Creation Wizard\n')

  try {
    // Discover available systems
    const systems = discoverSystems()
    console.log('📦 Available systems:')
    systems.forEach((system, index) => {
      console.log(
        `   ${index + 1}. ${system.name} (${system.modules.join(', ')})`
      )
    })

    // Select system
    const systemChoice = await prompt(
      '\nSelect system (1-' + systems.length + '): '
    )
    const selectedSystem = systems[parseInt(systemChoice) - 1]

    if (!selectedSystem) {
      throw new Error('Invalid system selection')
    }

    console.log(`\n✅ Selected: ${selectedSystem.name}`)
    console.log(`📦 Modules: ${selectedSystem.modules.join(', ')}`)

    // Get tenant details
    const config = await gatherTenantConfig(selectedSystem)

    // Confirm creation
    console.log('\n📋 Tenant Configuration:')
    console.log(`   System: ${config.system}`)
    console.log(`   Name: ${config.displayName} → ${config.name}`)
    console.log(`   Port: ${config.port}`)
    console.log(`   Theme: ${config.primaryColor}/${config.secondaryColor}`)
    console.log(`   Modules: ${config.modules.join(', ')}`)
    console.log(
      `   Stripe: ${config.copyStripeKeys ? 'Copy from parent' : 'Blank (separate account)'}`
    )

    const confirm = await prompt('\nCreate tenant? (y/N): ')
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled')
      rl.close()
      return
    }

    // Create the tenant
    await createTenant(config)

    console.log(`\n✅ Successfully created ${config.name}!`)
    console.log(`🌐 Run: pnpm dev:${config.name}`)
    console.log(`📱 Open: http://localhost:${config.port}`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

function discoverSystems() {
  const projectsDir = 'projects'
  const systems = []

  // Find all system directories
  const systemDirs = fs
    .readdirSync(projectsDir)
    .filter((dir) => fs.statSync(path.join(projectsDir, dir)).isDirectory())

  for (const systemDir of systemDirs) {
    const appPath = path.join(projectsDir, systemDir, `${systemDir}-app`)

    if (fs.existsSync(appPath)) {
      const packageJsonPath = path.join(appPath, 'package.json')

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

        // Extract FireUX modules
        const modules = Object.keys(packageJson.dependencies || {})
          .filter((dep) => dep.startsWith('fireux-'))
          .sort()

        systems.push({
          name: systemDir,
          path: appPath,
          modules,
          dependencies: packageJson.dependencies,
        })
      }
    }
  }

  return systems
}

function suggestPort(existingTenants) {
  const usedPorts = new Set()

  // Check existing tenant ports
  existingTenants.forEach((tenant) => {
    if (tenant.port) usedPorts.add(tenant.port)
  })

  // Check root package.json scripts for ports
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  Object.values(rootPackage.scripts || {}).forEach((script) => {
    const portMatch = script.match(/--port\s+(\d+)/)
    if (portMatch) {
      usedPorts.add(portMatch[1])
    }
  })

  // Suggest next available port starting from 3010
  for (let port = 3010; port < 3100; port++) {
    if (!usedPorts.has(port.toString())) {
      return port.toString()
    }
  }

  return '3050' // fallback
}

async function gatherTenantConfig(system) {
  // Get existing tenants to suggest port
  const existingTenants = getExistingTenants(system.name)
  const suggestedPort = suggestPort(existingTenants)

  const name = await prompt('Tenant name: ')
  const normalizedName = normalizeTenantName(name)

  if (normalizedName !== name) {
    console.log(`   → Normalized to: ${normalizedName}`)
  }

  const port =
    (await prompt(`Port (suggested: ${suggestedPort}): `)) || suggestedPort
  const primaryColor =
    (await prompt(
      'Primary color (violet, blue, green, red, yellow, purple, pink, indigo): '
    )) || 'blue'
  const secondaryColor =
    (await prompt('Secondary color (slate, gray, zinc, neutral, stone): ')) ||
    'slate'

  // Additional environment configuration
  const domain =
    (await prompt(`Domain (e.g., ${normalizedName}.web.app): `)) ||
    `${normalizedName}.web.app`
  const pin = (await prompt('PIN (4 digits for security): ')) || '1234'

  // Stripe configuration choice
  const copyStripeKeys = await prompt(
    'Copy Stripe keys from parent app? (y/N): '
  )
  const shouldCopyStripe = copyStripeKeys.toLowerCase() === 'y'

  return {
    system: system.name,
    name: normalizedName,
    displayName: name, // Keep original for display purposes
    port,
    primaryColor,
    secondaryColor,
    domain,
    pin,
    copyStripeKeys: shouldCopyStripe,
    parentPath: system.path,
    tenantPath: `projects/${system.name}/${normalizedName}`,
    modules: system.modules,
    dependencies: system.dependencies,
  }
}

function getExistingTenants(systemName) {
  const systemPath = `projects/${systemName}`
  const tenants = []

  if (fs.existsSync(systemPath)) {
    const items = fs
      .readdirSync(systemPath)
      .filter((item) => fs.statSync(path.join(systemPath, item)).isDirectory())
      .filter((item) => item !== `${systemName}-app`) // Exclude parent app

    items.forEach((tenantDir) => {
      const packageJsonPath = path.join(systemPath, tenantDir, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        const devScript = packageJson.scripts?.dev || ''
        const portMatch = devScript.match(/--port\s+(\d+)/)

        tenants.push({
          name: tenantDir,
          port: portMatch ? portMatch[1] : null,
        })
      }
    })
  }

  return tenants
}

async function createTenant(config) {
  console.log('\n🏗️  Creating MINIMAL tenant...')

  // Create directories
  createDirectories(config)

  // Copy assets
  copyAssets(config)

  // Create config files
  createConfigFiles(config)

  // Update root package.json
  updateRootPackage(config)

  // Install dependencies
  console.log('📥 Installing dependencies...')
  execSync('pnpm install', { stdio: 'inherit' })
}

function createDirectories(config) {
  const dirs = [
    config.tenantPath,
    `${config.tenantPath}/app`,
    `${config.tenantPath}/app/pages`,
    `${config.tenantPath}/app/layouts`,
    `${config.tenantPath}/config`,
    `${config.tenantPath}/public`,
  ]

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

function copyAssets(config) {
  // Copy public directory
  if (fs.existsSync(`${config.parentPath}/public`)) {
    execSync(
      `cp -r "${config.parentPath}/public/"* "${config.tenantPath}/public/"`,
      { stdio: 'inherit' }
    )
  }

  // Copy service account
  if (fs.existsSync(`${config.parentPath}/config/service-account.json`)) {
    fs.copyFileSync(
      `${config.parentPath}/config/service-account.json`,
      `${config.tenantPath}/config/service-account.json`
    )
  }
}

function createConfigFiles(config) {
  createPackageJson(config)
  createTsConfig(config)
  createAppConfig(config)
  createAppVue(config)
  createLayouts(config)
  createIndexPage(config)
  createNuxtConfig(config)
  createEnvFile(config)
}

function createPackageJson(config) {
  const packageJson = {
    name: config.name,
    private: true,
    type: 'module',
    scripts: {
      build: 'nuxi build',
      dev: `nuxi dev --port ${config.port}`,
      generate: 'nuxi generate',
      preview: 'nuxi preview',
      postinstall: 'nuxi prepare',
      clean: 'rimraf dist',
    },
    dependencies: {
      '@nuxt/content': '^3.6.1',
      '@nuxt/ui': '^3.4.4',
      '@vite-pwa/nuxt': '^0.11.10',
      '@vueuse/core': '^11.5.3',
      '@vueuse/nuxt': '^11.5.3',
      firebase: '^11.2.0',
      'firebase-admin': '^13.4.0',
      'fireux-core': 'workspace:*',
      'fireux-jobs': 'workspace:*',
      [`fireux-${config.system}`]: 'workspace:*',
      nuxt: '^3.17.5',
      'nuxt-vuefire': '^1.0.5',
      stripe: '^18.3.0',
    },
    devDependencies: {
      '@nuxt/devtools': '^1.7.4',
      '@nuxtjs/tailwindcss': '^6.13.1',
      rimraf: '^6.0.1',
    },
  }

  fs.writeFileSync(
    `${config.tenantPath}/package.json`,
    JSON.stringify(packageJson, null, 2)
  )
}

function createTsConfig(config) {
  const tsConfig = {
    extends: ['../../tsconfig.json'],
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '~/*': ['./app/*'],
        '@/*': ['./app/*'],
        '~~/*': ['./*'],
        '@@/*': ['./*'],
      },
    },
  }

  fs.writeFileSync(
    `${config.tenantPath}/tsconfig.json`,
    JSON.stringify(tsConfig, null, 2)
  )
}

function createAppConfig(config) {
  const appConfig = `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${config.primaryColor}',
      neutral: '${config.secondaryColor}',
    },
  },
})`
  fs.writeFileSync(`${config.tenantPath}/app/app.config.ts`, appConfig)
}

function createAppVue(config) {
  const appVue = `<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
// Tenant: ${config.name} | Modules: ${config.modules.join(', ')}
</script>`
  fs.writeFileSync(`${config.tenantPath}/app/app.vue`, appVue)
}

function createLayouts(config) {
  // Determine layout prefix from primary domain module
  let layoutPrefix = 'Fire' // default

  if (config.modules.includes('fireux-misebox')) {
    layoutPrefix = 'Misebox'
  } else if (config.modules.includes('fireux-cleanbox')) {
    layoutPrefix = 'Cleanbox'
  } else if (config.modules.includes('fireux-jobs')) {
    layoutPrefix = 'Job'
  }

  // Default layout
  const defaultLayout = `<template>
  <${layoutPrefix}Default />
</template>
`
  fs.writeFileSync(
    `${config.tenantPath}/app/layouts/default.vue`,
    defaultLayout
  )

  // Dashboard layout
  const dashboardLayout = `<template>
  <${layoutPrefix}Dashboard />
</template>
`
  fs.writeFileSync(
    `${config.tenantPath}/app/layouts/dashboard.vue`,
    dashboardLayout
  )
}

function createIndexPage(config) {
  const indexVue = `<template>
  <div class="min-h-screen bg-gradient-to-br from-${config.primaryColor}-50 to-${config.secondaryColor}-100">
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
            <span class="text-${config.primaryColor}-600">${capitalizeFirst(config.displayName)}</span>
            <br />
            <span class="text-3xl md:text-5xl font-medium text-slate-600">
              ${capitalizeFirst(config.system)} Tenant
            </span>
          </h1>
          
          <p class="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Powered by: ${config.modules.join(', ')}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/dashboard"
              class="bg-${config.primaryColor}-600 hover:bg-${config.primaryColor}-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: '${capitalizeFirst(config.displayName)} - ${capitalizeFirst(config.system)} Tenant',
  meta: [
    { name: 'description', content: 'Powered by: ${config.modules.join(', ')}' }
  ]
})

definePageMeta({
  layout: 'default'
})
</script>`
  fs.writeFileSync(`${config.tenantPath}/app/pages/index.vue`, indexVue)
}

function createNuxtConfig(config) {
  // Use standardized configuration template
  const standardConfig = `import { defineNuxtConfig } from 'nuxt/config'

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
  
  // Explicitly configure SSR for consistency
  ssr: true,
  
  modules: [
    'fireux-core',
    'fireux-jobs',
    'fireux-${config.system}',
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
  },
  
  runtimeConfig: {
    // Server-side runtime config
    firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
      /\\\\n/g,
      '\\n'
    ),
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    
    // Client-side runtime config (exposed to frontend)  
    public: {
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
      appName: '${capitalizeFirst(config.displayName)}',
      appShortName: '${config.name.slice(0, 4)}',
      primaryColor: '${getColorHex(config.primaryColor)}',
    },
  },
})`

  fs.writeFileSync(`${config.tenantPath}/nuxt.config.ts`, standardConfig)
}

function createEnvFile(config) {
  const colorHex = getColorHex(config.primaryColor).slice(1)

  // Read Firebase config from parent app
  const parentEnvPath = `${config.parentPath}/.env`
  let firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  }

  let stripeConfig = {
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
  }

  if (fs.existsSync(parentEnvPath)) {
    const parentEnv = fs.readFileSync(parentEnvPath, 'utf8')

    // Extract Firebase config
    firebaseConfig.apiKey = parentEnv.match(/FIREBASE_API_KEY=(.+)/)?.[1] || ''
    firebaseConfig.authDomain =
      parentEnv.match(/FIREBASE_AUTH_DOMAIN=(.+)/)?.[1] || ''
    firebaseConfig.projectId =
      parentEnv.match(/FIREBASE_PROJECT_ID=(.+)/)?.[1] || ''
    firebaseConfig.storageBucket =
      parentEnv.match(/FIREBASE_STORAGE_BUCKET=(.+)/)?.[1] || ''
    firebaseConfig.messagingSenderId =
      parentEnv.match(/FIREBASE_MESSAGING_SENDER_ID=(.+)/)?.[1] || ''
    firebaseConfig.appId = parentEnv.match(/FIREBASE_APP_ID=(.+)/)?.[1] || ''

    // Extract Stripe config if requested
    if (config.copyStripeKeys) {
      stripeConfig.publishableKey =
        parentEnv.match(/STRIPE_PUBLISHABLE_KEY=(.+)/)?.[1] || ''
      stripeConfig.secretKey =
        parentEnv.match(/STRIPE_SECRET_KEY=(.+)/)?.[1] || ''
      stripeConfig.webhookSecret =
        parentEnv.match(/STRIPE_WEBHOOK_SECRET=(.+)/)?.[1] || ''
    }
  }

  const envContent = `# ${capitalizeFirst(config.displayName)} Tenant Environment

# Firebase Admin Credentials
GOOGLE_APPLICATION_CREDENTIALS=/Users/danielwatson/Dev/fireux/projects/${config.system}/${config.name}/config/service-account.json

# Firebase Configuration (inherited from ${config.system}-app)
FIREBASE_API_KEY=${firebaseConfig.apiKey}
FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
FIREBASE_APP_ID=${firebaseConfig.appId}

# App Settings
PROJECT_NAME=${capitalizeFirst(config.system)}
APP_NAME=${capitalizeFirst(config.displayName)}
APP_ID=${config.name}
APP_SHORT_NAME=${config.name.slice(0, 4)}
APP_PRIMARY_COLOR=${colorHex}
APP_NEUTRAL_COLOR=64748B
AUTHOR_NAME=Daniel Watson (fireux)
DOMAIN=https://${config.domain}

# OpenAI
OPENAI_API_KEY_NAME=
OPENAI_API_KEY=

# Node Environment
NODE_ENV=development
DEV_DOMAIN=${config.port}

# Stripe Keys${config.copyStripeKeys ? ' (inherited from ' + config.system + '-app)' : ' (blank - configure separately)'}
STRIPE_PUBLISHABLE_KEY=${stripeConfig.publishableKey}
STRIPE_SECRET_KEY=${stripeConfig.secretKey}
STRIPE_WEBHOOK_SECRET=${stripeConfig.webhookSecret}

# GitHub
GITHUB_TOKEN=

# Consolidated PIN environment variable
PIN=${config.pin}
`
  fs.writeFileSync(`${config.tenantPath}/.env`, envContent)
}

function updateRootPackage(config) {
  const rootPackagePath = 'package.json'
  const packageJson = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'))

  packageJson.scripts[`dev:${config.name}`] =
    `pnpm --filter ./projects/${config.system}/${config.name} dev`

  fs.writeFileSync(rootPackagePath, JSON.stringify(packageJson, null, 2))
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function normalizeTenantName(name) {
  // Convert to lowercase and replace spaces/special chars with hyphens
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-)|(-$)/g, '')
}

function getColorHex(color) {
  const colorMap = {
    violet: '#8B5CF6',
    blue: '#3B82F6',
    green: '#22C55E',
    red: '#EF4444',
    yellow: '#EAB308',
    purple: '#A855F7',
    pink: '#EC4899',
    indigo: '#6366F1',
  }
  return colorMap[color] || '#3B82F6'
}

// Start the wizard
main()
