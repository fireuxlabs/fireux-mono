#!/usr/bin/env node

/**
 * Chef Profile Migration Script
 *
 * Migrates chef data to comply with the strong Profile model:
 * - Ensures required fields: uid, chef_name, avatarUrl
 * - Preserves existing rich data (gallery, kitchens, etc.)
 * - Generates UI Avatars for consistent branding
 */

const { initializeApp } = require('firebase/app')
const {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} = require('firebase/firestore')

// Firebase config (these should match your actual project)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'your-api-key',
  authDomain: 'misebox-78f9c.firebaseapp.com',
  projectId: 'misebox-78f9c',
  storageBucket: 'misebox-78f9c.appspot.com',
  messagingSenderId: '102749723716',
  appId: 'your-app-id',
}

// Known chef data
const KNOWN_CHEFS = {
  PWu17mL3cTX9ia3OlAdI0Rux6Ek2: {
    chef_name: 'Shane Dickinson',
    title: 'Executive Chef',
    bio_short: 'Award-winning chef specializing in modern Australian cuisine',
  },
  jMK33p5XlhYS8rBCEf8qUiogfMg2: {
    chef_name: 'Chef Deano',
    title: 'Head Chef',
    bio_short: 'Creative chef known for innovative fusion dishes',
  },
  xdu83J77YeOROlePJdibPekxkDp2: {
    chef_name: 'Tahneeq',
    title: 'Sous Chef',
    bio_short:
      'Rising culinary talent with expertise in Middle Eastern cuisine',
  },
}

function generateChefAvatar(chefName) {
  const name = encodeURIComponent(chefName)
  return `https://ui-avatars.com/api/?name=${name}&background=f97316&color=fff&size=200&format=png`
}

async function initializeFirestore() {
  const app = initializeApp(firebaseConfig)
  return getFirestore(app)
}

async function getAllChefs(db) {
  console.log('📊 Fetching all chefs from Firestore...')

  try {
    const chefsCollection = collection(db, 'chefs')
    const snapshot = await getDocs(chefsCollection)

    const chefs = []
    snapshot.forEach((doc) => {
      chefs.push({
        id: doc.id,
        data: doc.data(),
      })
    })

    console.log(`Found ${chefs.length} chef documents`)
    return chefs
  } catch (error) {
    console.error('Error fetching chefs:', error)
    return []
  }
}

async function updateChef(db, chefId, updates) {
  console.log(`📝 Updating chef ${chefId}...`)

  const isDryRun = process.argv.includes('--dry-run')
  if (isDryRun) {
    console.log('  🔍 DRY RUN - Would update with:', updates)
    return true
  }

  try {
    const chefRef = doc(db, 'chefs', chefId)
    await setDoc(chefRef, updates, { merge: true })
    console.log(`  ✅ Successfully updated chef ${chefId}`)
    return true
  } catch (error) {
    console.error(`  ❌ Failed to update chef ${chefId}:`, error.message)
    return false
  }
}

async function migrateChefs() {
  console.log('🚀 Starting chef migration...')

  const isDryRun = process.argv.includes('--dry-run')
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }

  try {
    const db = await initializeFirestore()
    const allChefs = await getAllChefs(db)

    console.log('\n🔄 MIGRATION PHASE')
    let successCount = 0

    // Process known chefs
    for (const [chefId, knownData] of Object.entries(KNOWN_CHEFS)) {
      console.log(
        `\n👨‍🍳 Processing known chef: ${knownData.chef_name} (${chefId})`
      )

      // Check if chef exists
      const existingChef = allChefs.find((chef) => chef.id === chefId)
      if (existingChef) {
        console.log('  📋 Existing data:', existingChef.data)
      }

      const updates = {
        uid: chefId,
        chef_name: knownData.chef_name,
        title: knownData.title,
        bio_short: knownData.bio_short,
        avatarUrl: generateChefAvatar(knownData.chef_name),
        updated_at: new Date().toISOString(),
      }

      console.log('  📝 Updates to apply:', updates)

      if (await updateChef(db, chefId, updates)) {
        successCount++
      }
    }

    // Process any existing chefs that aren't in our known list
    const unknownChefs = allChefs.filter((chef) => !KNOWN_CHEFS[chef.id])
    if (unknownChefs.length > 0) {
      console.log(`\n🔍 Found ${unknownChefs.length} unknown chef(s):`)

      for (const chef of unknownChefs) {
        console.log(`  - ${chef.id}: ${JSON.stringify(chef.data, null, 2)}`)

        // Ensure basic required fields
        const updates = {}
        if (!chef.data.uid) updates.uid = chef.id
        if (!chef.data.avatarUrl && !chef.data.avatar) {
          const name = chef.data.chef_name || chef.data.displayName || 'Chef'
          updates.avatarUrl = generateChefAvatar(name)
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString()
          console.log(`  📝 Adding missing fields:`, updates)

          if (await updateChef(db, chef.id, updates)) {
            successCount++
          }
        }
      }
    }

    console.log('\n📊 MIGRATION SUMMARY')
    console.log(`  ✅ Successfully processed: ${successCount}`)
    console.log(`  📊 Total chefs: ${allChefs.length}`)

    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

function showUsage() {
  console.log(`
Chef Migration Script Usage:

  node scripts/migrate-chef.js           # Run migration
  node scripts/migrate-chef.js --dry-run # Show what would be done
  node scripts/migrate-chef.js --help    # Show this help

This script migrates chef data to the strong Profile model.
  `)
}

if (process.argv.includes('--help')) {
  showUsage()
  process.exit(0)
}

// Run migration
if (require.main === module) {
  migrateChefs().then(() => process.exit(0))
}

module.exports = { migrateChefs, KNOWN_CHEFS }
