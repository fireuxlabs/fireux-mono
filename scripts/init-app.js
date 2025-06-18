#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  rmSync,
} from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve))

// App configuration templates - based on existing working apps
const APP_CONFIGS = {
  cleanbox: {
    name: 'cleanbox',
    displayName: 'CleanBox',
    description: 'Cleaning industry platform',
    primaryColor: 'blue',
    neutralColor: 'slate',
    firebaseProject: 'cleanbox-f15bc',
    firebaseSite: 'cleanbox',
    industry: 'cleaning',
    contentTitle: 'My First CleanBox Page',
    contentDescription:
      'Hello World! This is CleanBox.\n\nHere is some content for the cleaning industry platform.',
  },
  misebox: {
    name: 'misebox',
    displayName: 'MiseBox',
    description: 'Culinary industry platform',
    primaryColor: 'violet',
    neutralColor: 'gray',
    firebaseProject: 'misebox-78f9c',
    firebaseSite: 'misebox-78f9c',
    industry: 'culinary',
    contentTitle: 'My First MiseBox Page',
    contentDescription:
      'Hello World! This is MiseBox.\n\nHere is some content for the culinary industry platform.',
  },
  fireux: {
    name: 'fireux',
    displayName: 'FireUX',
    description: 'Developer and business platform',
    primaryColor: 'yellow',
    neutralColor: 'zinc',
    firebaseProject: 'fireux-2005',
    firebaseSite: 'fireux-2005',
    industry: 'development',
    contentTitle: 'Hello FireUX!',
    contentDescription:
      'Welcome to the FireUX ecosystem - the ultimate platform for developers and businesses.\n\nThis content is now being loaded from a markdown file!',
  },
}

// Template files
const TEMPLATES = {
  'nuxt.config.ts': (config) => `import { defineNuxtConfig } from 'nuxt/config'

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
  css: [
    'fireux-core/assets/css/main.css',
    'fireux-core/assets/design-system/main.scss',
  ],
  modules: [
    'fireux-core',
    '@nuxt/content',
    [
      'nuxt-vuefire',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
        },
        auth: { enabled: true },
      },
    ],
    '@nuxt/ui',
  ],
  nitro: {
    firebase: {
      gen: 2,
    },
  },
})
`,

  'firebase.json': (config) =>
    JSON.stringify(
      {
        functions: {
          source: '.output/server',
        },
        hosting: {
          site: config.firebaseSite,
          public: '.output/public',
          cleanUrls: true,
          ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
          rewrites: [{ source: '**', function: 'server' }],
        },
      },
      null,
      2
    ),

  'app/app.config.ts': (config) => `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${config.primaryColor}',
      neutral: '${config.neutralColor}',
    },
    icons: {
      size: '22px',
    },
  },
})
`,

  'app/app.vue': () => `<template>
  <UApp>
    <FireAppDebug />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UModal
      :open="!isInitialized"
      prevent-close
      title="🚫 Blocked"
      description="This app needs to be initialized."
    >
      <template #body>
        <FireOrganismsAppOnboarding />
      </template>
    </UModal>
  </UApp>
</template>

<script setup>
import { useAppState } from 'fireux-core/runtime/composables/useAppState'

const { isInitialized } = useAppState()
</script>
`,

  'app/pages/index.vue': () => `<script setup lang="ts">
// Fetch the content for the index page
const { data: page } = await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
)
</script>

<template>
  <div class="page">
    <FireLogoBrand size="hero" />
    <div v-if="page" class="content">
      <ContentRenderer :value="page" />
    </div>
    <div v-else class="content">
      <h1>Welcome!</h1>
      <p>Loading content...</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  @apply flex flex-col items-center justify-center min-h-screen p-8;
}

.content {
  @apply max-w-4xl mx-auto prose prose-lg;
}
</style>
`,

  'content/index.md': (config) => `# ${config.contentTitle}

${config.contentDescription}
`,

  'content.config.ts': () => `export default defineContentConfig({})
`,

  'tsconfig.json': () =>
    JSON.stringify(
      {
        extends: './.nuxt/tsconfig.json',
      },
      null,
      2
    ),
}

async function createApp(appName, customConfig = {}) {
  const projectsDir = join(__dirname, '../projects')
  const appDir = join(projectsDir, appName, `${appName}-app`)

  console.log(`🚀 Creating ${appName} app...`)

  // Check if app already exists
  if (existsSync(appDir)) {
    const overwrite = await question(
      `⚠️  App ${appName} already exists. Overwrite? (y/N): `
    )
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Cancelled')
      rl.close()
      return
    }
    rmSync(appDir, { recursive: true, force: true })
  }

  // Merge custom config with defaults or use predefined
  const config = APP_CONFIGS[appName] || {
    name: appName,
    displayName: appName.charAt(0).toUpperCase() + appName.slice(1),
    description: `${appName} application`,
    primaryColor: 'blue',
    neutralColor: 'slate',
    firebaseProject: `${appName}-project`,
    firebaseSite: appName,
    industry: 'general',
    contentTitle: `Welcome to ${appName}`,
    contentDescription: `This is your new ${appName} application.`,
    ...customConfig,
  }

  // Create directory structure
  mkdirSync(join(projectsDir, appName), { recursive: true })
  mkdirSync(appDir, { recursive: true })
  mkdirSync(join(appDir, 'app'), { recursive: true })
  mkdirSync(join(appDir, 'app/components'), { recursive: true })
  mkdirSync(join(appDir, 'app/composables'), { recursive: true })
  mkdirSync(join(appDir, 'app/layouts'), { recursive: true })
  mkdirSync(join(appDir, 'app/pages'), { recursive: true })
  mkdirSync(join(appDir, 'config'), { recursive: true })
  mkdirSync(join(appDir, 'content'), { recursive: true })
  mkdirSync(join(appDir, 'public'), { recursive: true })
  mkdirSync(join(appDir, 'public/img'), { recursive: true })
  mkdirSync(join(appDir, 'server'), { recursive: true })

  // Create package.json
  const packageJson = {
    name: `${appName}-app`,
    private: true,
    type: 'module',
    scripts: {
      build: 'nuxt build',
      dev: 'nuxt dev',
      generate: 'nuxt generate',
      preview: 'nuxt preview',
      postinstall: 'nuxt prepare',
      clean: 'rimraf dist',
    },
    dependencies: {
      '@nuxt/content': '^3.6.0',
      '@nuxt/ui': '3.1.3',
      'firebase-admin': '^13.4.0',
      'fireux-core': 'workspace:../packages/fireux-core',
      nuxt: '^3.17.4',
      'nuxt-vuefire': '^1.0.5',
      vue: '^3.5.15',
      'vue-router': '^4.5.1',
    },
  }

  writeFileSync(
    join(appDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create nuxt.config.ts
  const nuxtConfig = `import { defineNuxtConfig } from 'nuxt/config'

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
  css: [
    'fireux-core/assets/css/main.css',
    'fireux-core/assets/design-system/main.scss',
  ],
  modules: [
    'fireux-core',
    '@nuxt/content',
    [
      'nuxt-vuefire',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
        },
        auth: { enabled: true },
      },
    ],
    '@nuxt/ui',
  ],
  nitro: {
    firebase: {
      gen: 2,
    },
  },
})
`

  writeFileSync(join(appDir, 'nuxt.config.ts'), nuxtConfig)

  // Create app.config.ts
  const appConfig = `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${config.primaryColor}',
      neutral: '${config.neutralColor}',
    },
    icons: {
      size: '22px',
    },
  },
})
`

  writeFileSync(join(appDir, 'app/app.config.ts'), appConfig)

  // Create app.vue
  const appVue = `<template>
  <UApp>
    <FireAppDebug />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UModal
      :open="!isInitialized"
      prevent-close
      title="🚫 Blocked"
      description="This app needs to be initialized."
    >
      <template #body>
        <FireOrganismsAppOnboarding />
      </template>
    </UModal>
  </UApp>
</template>

<script setup>
// App initialization logic
const isInitialized = ref(true) // Set to false for onboarding
</script>
`

  writeFileSync(join(appDir, 'app/app.vue'), appVue)

  // Create pages/index.vue
  const indexPage = `<script setup lang="ts">
// Fetch the content for the index page
const { data: page } = await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
)
</script>

<template>
  <div class="page">
    <FireLogoBrand size="hero" />
    <div v-if="page" class="content">
      <ContentRenderer :value="page" />
    </div>
    <div v-else class="content">
      <h1>Welcome to ${config.displayName}!</h1>
      <p>${config.description}</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem;
  text-align: center;
}

.content {
  margin-top: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
</style>
`

  writeFileSync(join(appDir, 'app/pages/index.vue'), indexPage)

  // Create content based on industry
  let contentMd = ''
  if (config.industry === 'cleaning') {
    contentMd = `# My First ${config.displayName} Page

Hello World! This is ${config.displayName}.

Here is some content for the cleaning industry platform.

## For Cleaning Professionals

- **Find Work** - Access a network of cleaning opportunities
- **Manage Business** - Tools for scheduling, invoicing, and client management
- **Build Reputation** - Reviews and ratings system to grow your business
- **Professional Network** - Connect with other cleaning professionals

## For Property Managers & Clients

- **Find Cleaners** - Access vetted cleaning professionals and businesses
- **Schedule Services** - Easy booking and scheduling system
- **Quality Assurance** - Ratings and reviews for peace of mind
- **Manage Multiple Properties** - Streamlined management tools

## Services Covered

- Residential cleaning
- Commercial cleaning
- Move-in/move-out cleaning
- Deep cleaning
- Regular maintenance cleaning
- Post-construction cleanup
`
  } else if (config.industry === 'culinary') {
    contentMd = `# Welcome to ${config.displayName}!

The ultimate platform for culinary professionals and food service industry.

## For Chefs & Culinary Professionals

- **Find Opportunities** - Access restaurant jobs and catering gigs
- **Showcase Skills** - Build your culinary portfolio and reputation
- **Network** - Connect with other chefs and industry professionals
- **Manage Career** - Tools for scheduling, contracts, and client management

## For Restaurants & Food Service

- **Find Talent** - Access skilled chefs and kitchen staff
- **Manage Staff** - Scheduling and workforce management tools
- **Quality Control** - Reviews and ratings system
- **Menu Development** - Collaborative tools for menu planning

## Services & Specialties

- Restaurant operations
- Catering services
- Private chef services
- Menu development
- Kitchen consulting
- Food safety training
`
  } else {
    contentMd = `# Hello ${config.displayName}!

Welcome to the ${config.displayName} ecosystem - the ultimate platform for developers and businesses.

This content is now being loaded from a markdown file!
`
  }

  writeFileSync(join(appDir, 'content/index.md'), contentMd)

  // Create firebase.json
  const firebaseJson = {
    functions: {
      source: '.output/server',
    },
    hosting: {
      site: config.firebaseSite,
      public: '.output/public',
      cleanUrls: true,
      ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
      rewrites: [{ source: '**', function: 'server' }],
    },
  }

  writeFileSync(
    join(appDir, 'firebase.json'),
    JSON.stringify(firebaseJson, null, 2)
  )

  // Create .firebaserc
  const firebaserc = {
    projects: {
      default: config.firebaseProject,
    },
  }

  writeFileSync(
    join(appDir, '.firebaserc'),
    JSON.stringify(firebaserc, null, 2)
  )

  // Create other config files
  writeFileSync(
    join(appDir, 'tsconfig.json'),
    `{
  "extends": "../../../tsconfig.json"
}
`
  )

  writeFileSync(
    join(appDir, 'content.config.ts'),
    `export default defineContentConfig({
  // Content configuration
})
`
  )

  // Create basic public files
  writeFileSync(join(appDir, 'public/favicon.ico'), '')
  writeFileSync(
    join(appDir, 'public/robots.txt'),
    `User-agent: *
Allow: /
`
  )

  // Create .gitkeep files
  writeFileSync(join(appDir, 'app/components/.gitkeep'), '')
  writeFileSync(join(appDir, 'app/composables/.gitkeep'), '')
  writeFileSync(join(appDir, 'app/layouts/.gitkeep'), '')
  writeFileSync(join(appDir, 'config/.gitkeep'), '')
  writeFileSync(join(appDir, 'server/.gitkeep'), '')

  console.log(`✅ ${config.displayName} app created successfully!`)
  console.log(`📁 Location: ${appDir}`)
  console.log(`🎨 Colors: ${config.primaryColor}/${config.neutralColor}`)
  console.log(`🔥 Firebase: ${config.firebaseProject} (${config.firebaseSite})`)
}

// Main execution
const args = process.argv.slice(2)
const appName = args[0]

if (!appName) {
  console.log('Usage: node init-app.js <app-name>')
  console.log('Available apps: cleanbox, misebox, fireux')
  console.log('Or create a new app by providing a custom configuration')
  process.exit(1)
}

if (APP_CONFIGS[appName]) {
  createApp(appName, APP_CONFIGS[appName])
} else {
  console.log(`❌ Unknown app: ${appName}`)
  console.log('Available apps:', Object.keys(APP_CONFIGS).join(', '))
  process.exit(1)
}
