#!/usr/bin/env node

/**
 * FireUX Core User Migration Script
 *
 * Migrates missing data from App Users to Core Users across all Firebase projects.
 * Primary focus: Adding missing display_name field to Core Users.
 *
 * Usage: node scripts/migrate-core-users.js [project] [--dry-run] [--force]
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Project configurations
const PROJECTS = {
  fireux: {
    name: 'FireUX',
    serviceAccountPath: resolve(
      __dirname,
      '../projects/fireux/fireux-app/config/service-account.json'
    ),
    projectId: 'fireux-2005',
  },
  misebox: {
    name: 'MiseBox',
    serviceAccountPath: resolve(
      __dirname,
      '../packages/tenants/fireux-misebox/config/service-account.json'
    ),
    projectId: 'misebox-78f9c',
  },
  cleanbox: {
    name: 'CleanBox',
    serviceAccountPath: resolve(
      __dirname,
      '../packages/tenants/fireux-cleanbox/config/service-account.json'
    ),
    projectId: 'cleanbox-f15bc',
  },
}

// Migration statistics
const stats = {
  processed: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  changes: [],
}

/**
 * Initialize Firebase Admin SDK for a project
 */
function initializeFirebase(projectConfig) {
  try {
    const serviceAccount = JSON.parse(
      readFileSync(projectConfig.serviceAccountPath, 'utf8')
    )

    const app = initializeApp(
      {
        credential: cert(serviceAccount),
        projectId: projectConfig.projectId,
      },
      projectConfig.projectId
    )

    return getFirestore(app)
  } catch (error) {
    console.error(
      `❌ Failed to initialize ${projectConfig.name}:`,
      error.message
    )
    process.exit(1)
  }
}

/**
 * Get display name from App User data
 */
function getDisplayNameFromAppUser(appUser) {
  if (appUser.display_name && appUser.display_name !== appUser.email) {
    return appUser.display_name
  }

  if (appUser.first_name && appUser.last_name) {
    return `${appUser.first_name} ${appUser.last_name}`
  }

  if (appUser.first_name) {
    return appUser.first_name
  }

  if (appUser.handle && appUser.handle !== appUser.email) {
    return appUser.handle
  }

  return null // Use email as fallback (handled later)
}

/**
 * Normalize timestamp to Firestore timestamp format
 */
function normalizeTimestamp(timestamp) {
  if (!timestamp) return null

  // Already a Firestore timestamp
  if (timestamp.seconds !== undefined) {
    return timestamp
  }

  // ISO string - convert to Firestore timestamp
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp)
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
    }
  }

  return timestamp
}

/**
 * Create updated_at timestamp if missing
 */
function createUpdatedAt() {
  const now = new Date()
  return {
    seconds: Math.floor(now.getTime() / 1000),
    nanoseconds: (now.getTime() % 1000) * 1000000,
  }
}

/**
 * Migrate a single Core User
 */
async function migrateCoreUser(coreUser, appUser, db, dryRun = false) {
  const updates = {}
  const changes = []

  // 1. Add display_name if missing
  if (!coreUser.display_name) {
    const displayName = getDisplayNameFromAppUser(appUser) || appUser.email
    updates.display_name = displayName
    changes.push(`display_name: "${displayName}"`)
  }

  // 2. Normalize created_at timestamp
  if (coreUser.created_at) {
    const normalized = normalizeTimestamp(coreUser.created_at)
    if (JSON.stringify(normalized) !== JSON.stringify(coreUser.created_at)) {
      updates.created_at = normalized
      changes.push('created_at: normalized to Firestore timestamp')
    }
  }

  // 3. Add updated_at if missing
  if (!coreUser.updated_at) {
    updates.updated_at = createUpdatedAt()
    changes.push('updated_at: added current timestamp')
  } else {
    // Normalize existing updated_at
    const normalized = normalizeTimestamp(coreUser.updated_at)
    if (JSON.stringify(normalized) !== JSON.stringify(coreUser.updated_at)) {
      updates.updated_at = normalized
      changes.push('updated_at: normalized to Firestore timestamp')
    }
  }

  // Apply updates
  if (Object.keys(updates).length > 0) {
    if (!dryRun) {
      await db.collection('core-users').doc(coreUser.id).update(updates)
    }

    stats.updated++
    stats.changes.push({
      id: coreUser.id,
      email: coreUser.email,
      changes: changes,
    })

    console.log(`  ✅ ${coreUser.email}: ${changes.join(', ')}`)
    return true
  } else {
    stats.skipped++
    console.log(`  ⏭️  ${coreUser.email}: no changes needed`)
    return false
  }
}

/**
 * Migrate Core Users for a single project
 */
async function migrateProject(projectName, dryRun = false, force = false) {
  const projectConfig = PROJECTS[projectName]
  if (!projectConfig) {
    console.error(`❌ Unknown project: ${projectName}`)
    console.log(`Available projects: ${Object.keys(PROJECTS).join(', ')}`)
    return false
  }

  console.log(
    `\n🚀 Migrating ${projectConfig.name} (${projectConfig.projectId})`
  )
  console.log(`📁 Service Account: ${projectConfig.serviceAccountPath}`)

  if (dryRun) {
    console.log('🧪 DRY RUN MODE - No actual changes will be made')
  }

  const db = initializeFirebase(projectConfig)

  try {
    // Get Core Users
    const coreUsersSnapshot = await db.collection('core-users').get()
    const coreUsers = coreUsersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Get App Users by app ID patterns
    const appCollectionName = await getAppUsersCollection(db, projectName)
    const appUsersSnapshot = await db.collection(appCollectionName).get()
    const appUsers = appUsersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }))

    console.log(
      `📊 Found ${coreUsers.length} Core Users and ${appUsers.length} App Users`
    )

    // Create App User lookup by UID
    const appUserMap = new Map(appUsers.map((user) => [user.uid, user]))

    // Process each Core User
    for (const coreUser of coreUsers) {
      stats.processed++

      const appUser = appUserMap.get(coreUser.id)
      if (!appUser) {
        console.log(`  ⚠️  ${coreUser.email}: No corresponding App User found`)
        stats.skipped++
        continue
      }

      try {
        await migrateCoreUser(coreUser, appUser, db, dryRun)
      } catch (error) {
        console.error(
          `  ❌ ${coreUser.email}: Migration failed:`,
          error.message
        )
        stats.errors++
      }
    }

    return true
  } catch (error) {
    console.error(
      `❌ Migration failed for ${projectConfig.name}:`,
      error.message
    )
    return false
  }
}

/**
 * Get App Users collection name based on project with auto-detection
 */
async function getAppUsersCollection(db, projectName) {
  const appId = getAppId(projectName)
  const possibleCollections = [
    `apps/${appId}/users`, // Subcollection pattern
    'app-users', // Top-level collection
    'users', // Simple collection
  ]

  for (const collectionName of possibleCollections) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get()
      if (!snapshot.empty) {
        console.log(`📁 Found App Users in collection: ${collectionName}`)
        return collectionName
      }
    } catch (error) {
      // Collection doesn't exist or access denied, try next one
      console.log(`   Tried ${collectionName}: ${error.message}`)
    }
  }

  console.log(
    `⚠️  No App Users collection found, tried: ${possibleCollections.join(', ')}`
  )
  return 'app-users' // fallback
}

/**
 * Get App ID based on project name
 */
function getAppId(projectName) {
  const appIds = {
    fireux: 'fireux-app',
    misebox: 'misebox-app',
    cleanbox: 'cleanbox-app',
  }
  return appIds[projectName] || `${projectName}-app`
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n📈 Migration Summary:')
  console.log(`   Processed: ${stats.processed}`)
  console.log(`   Updated: ${stats.updated}`)
  console.log(`   Skipped: ${stats.skipped}`)
  console.log(`   Errors: ${stats.errors}`)

  if (stats.changes.length > 0) {
    console.log('\n📝 Detailed Changes:')
    stats.changes.forEach((change) => {
      console.log(`   ${change.email} (${change.id}):`)
      change.changes.forEach((c) => console.log(`     - ${c}`))
    })
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)
  const projectName = args[0]
  const dryRun = args.includes('--dry-run')
  const force = args.includes('--force')

  console.log('🔥 FireUX Core User Migration Script')
  console.log('=====================================')

  if (!projectName || projectName === '--help') {
    console.log(
      '\nUsage: node scripts/migrate-core-users.js [project] [options]'
    )
    console.log('\nProjects:')
    Object.entries(PROJECTS).forEach(([key, config]) => {
      console.log(`  ${key.padEnd(10)} - ${config.name} (${config.projectId})`)
    })
    console.log('\nOptions:')
    console.log(
      '  --dry-run    Show what would be changed without making actual updates'
    )
    console.log('  --force      Skip confirmation prompts')
    console.log('  --help       Show this help message')
    console.log('\nExamples:')
    console.log('  node scripts/migrate-core-users.js fireux --dry-run')
    console.log('  node scripts/migrate-core-users.js misebox')
    console.log('  node scripts/migrate-core-users.js cleanbox --force')
    return
  }

  if (projectName === 'all') {
    // Migrate all projects
    console.log('🌟 Migrating ALL projects\n')

    for (const project of Object.keys(PROJECTS)) {
      const success = await migrateProject(project, dryRun, force)
      if (!success) {
        console.error(`❌ Failed to migrate ${project}`)
        break
      }
    }
  } else {
    // Migrate single project
    await migrateProject(projectName, dryRun, force)
  }

  printSummary()

  if (stats.errors > 0) {
    console.log('\n⚠️  Some migrations failed. Check the errors above.')
    process.exit(1)
  } else if (stats.updated > 0) {
    console.log('\n✅ Migration completed successfully!')
  } else {
    console.log('\n✨ No changes were needed!')
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error)
  process.exit(1)
})

// Run the script
main().catch(console.error)
