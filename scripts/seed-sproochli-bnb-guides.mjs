#!/usr/bin/env node
/*
  Seed Sproochli BNB guide data into Firestore.

  Canon:
  - Sproochli standalone app data lives in the app database: sproochli
  - Sites are stored at sproochli_sites/{siteId}
  - Site maintainers live at sproochli_sites/{siteId}/maintainers/{maintainerId}
  - Guest-guide pages live at sproochli_sites/{siteId}/pages/{pageId}
  - Page sections live at sproochli_sites/{siteId}/pages/{pageId}/sections/{sectionId}

  Usage:
    node scripts/seed-sproochli-bnb-guides.mjs
    node scripts/seed-sproochli-bnb-guides.mjs --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const PROJECT_ID = 'fireux-2005'
const DATABASE_ID = 'sproochli'
const ACTOR = 'system:seed-sproochli-bnb-guides'
const APP_ID = 'sproochli'

const holidayWithNats = {
  id: 'holiday-with-nats',
  slug: 'holiday-with-nats',
  type: 'bnb',
  title: 'Holiday with Nats',
  status: 'draft',
  published: false,
  original_language: 'en',
  primary_language: 'en',
  property: {
    name: 'Penthouse Holiday Apartment',
    type: 'BNB / guest guide',
    manager: 'Apartment Manager Natalie',
    phone: '+41 78 604 69 00',
    email: 'bookwithnats@gmail.com',
    address: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
  },
  privacy_note:
    'Local proof content from the source manual. Phone and email should be confirmed before public deployment.',
  footer: 'Temporary Sproochli BNB demo.',
  standard_topic_ids: [
    'emergency',
    'wifi',
    'check-in',
    'checkout',
    'keys',
    'house-rules',
    'quiet-hours',
    'smoking',
    'heating-cooling',
    'kitchen',
    'appliances',
    'laundry',
    'bathroom',
    'parking',
    'rubbish-recycling',
    'shops',
    'restaurants',
    'transport',
    'things-to-do',
    'useful-contacts',
  ],
  guest_message: {
    title: 'Welcome Family Watson',
    subtitle: 'Today - 27th of March',
  },
  maintainers: [
    {
      id: 'natalie',
      display_name: 'Natalie',
      maintainer_type: 'host',
      role: 'owner',
      phone: '+41 78 604 69 00',
      email: 'bookwithnats@gmail.com',
      source: 'House Manual 2019.docx',
    },
  ],
  pages: [
    {
      id: 'guest-guide',
      slug: 'guest-guide',
      title: 'Guest Guide',
      page_type: 'bnb_guest_guide',
      language: 'en',
      sections: [
        {
          id: 'welcome',
          title: 'Welcome',
          summary: 'A quick welcome and the key host details for your stay.',
          icon: 'i-lucide-home',
          enabled: true,
          priority: false,
          items: [
            { value: 'Welcome to the Penthouse Holiday Apartment.' },
            { label: 'Apartment Manager', value: 'Natalie' },
            { label: 'Phone', value: '+41 78 604 69 00', tone: 'important' },
            { label: 'Email', value: 'bookwithnats@gmail.com', tone: 'important' },
            {
              label: 'Address',
              value:
                'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
            },
          ],
        },
        {
          id: 'emergency',
          title: 'Emergency',
          summary: 'Emergency equipment, medical contacts and urgent numbers.',
          icon: 'i-lucide-siren',
          priority: true,
          enabled: true,
          items: [
            { value: 'The apartment is fitted with smoke alarms.' },
            { value: 'Fire extinguisher: by the downstairs main entrance.' },
            { value: 'First aid kit: kitchen drawer to the right of the microwave.' },
            { value: 'Fire blanket: kitchen cupboard under the sink.' },
            { label: 'Police', value: '117', tone: 'important' },
            { label: 'Fire Department', value: '118', tone: 'important' },
            { label: 'Ambulance', value: '144', tone: 'important' },
            { label: 'Helicopter Rescue', value: '1414', tone: 'important' },
            { label: 'Interlaken Hospital', value: '+41 (0) 33 826 25 00', tone: 'important' },
            { label: 'Bahnhof Taxi', value: '+41 (0) 33 822 50 50' },
            { label: 'A Taxi', value: '+41 (0) 33 822 60 60' },
            {
              value:
                'Walk-in clinic: Interlaken West train station, Bahnhofstrasse 28, 3800 Interlaken.',
            },
            { value: 'HANI Emergency is available at Interlaken Hospital.' },
          ],
        },
        {
          id: 'wifi',
          title: 'Wi-Fi',
          summary: 'Internet access for guests.',
          icon: 'i-lucide-wifi',
          priority: true,
          enabled: true,
          items: [
            { label: 'Network', value: 'Penthouse', tone: 'important' },
            { label: 'Password', value: 'penthouse2020', tone: 'important' },
          ],
        },
        {
          id: 'house-rules',
          title: 'House Rules',
          summary: 'Simple rules to protect the apartment and respect neighbours.',
          icon: 'i-lucide-clipboard-check',
          enabled: true,
          priority: false,
          items: [
            { value: 'Close all windows and doors before going out.' },
            { value: 'Water damage caused by rain may be charged.', tone: 'warning' },
            { value: 'Bathrooms are not wet rooms; please mop up water from floors.' },
            { value: 'Do not eat in bed or on the sofa.' },
            { value: 'Be thoughtful to neighbours.' },
            { value: 'No loud noise after 22:00.', tone: 'important' },
            { value: 'Leave the balcony by 22:00 because noise travels.' },
            { value: 'This is a non-smoking apartment.' },
            { value: 'Smoking is only allowed on the balcony. Please use the ashtray.' },
          ],
        },
        {
          id: 'checkout',
          title: 'Checkout',
          summary: 'What to do before leaving the apartment.',
          icon: 'i-lucide-door-open',
          priority: true,
          enabled: true,
          items: [
            { value: 'Check out by 10:00 unless agreed otherwise.', tone: 'important' },
            { value: 'Put leftover dishes in the dishwasher and start the cleaning cycle.' },
            { value: 'Return the key where you found it.' },
            { value: 'Extra cleaning or damage caused by neglect may be charged.', tone: 'warning' },
          ],
        },
        {
          id: 'heating-cooling',
          title: 'Heating & Cooling',
          summary: 'How to use the radiators responsibly.',
          icon: 'i-lucide-thermometer',
          enabled: true,
          priority: false,
          items: [
            { value: 'Radiators have dials from 1 to 5.' },
            { value: 'Do not put the heating on high and open the windows.' },
            { value: 'Turn the heating off on departure.' },
          ],
        },
        {
          id: 'keys',
          title: 'Keys & Access',
          summary: 'Key safe instructions for going out and checking out.',
          icon: 'i-lucide-key-round',
          priority: true,
          enabled: true,
          items: [
            { value: 'The key safe box can be used when going out.' },
            { label: 'Code', value: '2020', tone: 'important' },
            { value: 'Never change the code.', tone: 'warning' },
          ],
        },
        {
          id: 'parking',
          title: 'Parking',
          summary: 'Parking and visitor parking information.',
          icon: 'i-lucide-car',
          enabled: true,
          priority: false,
          items: [
            { value: 'Underground parking is available.' },
            { value: 'Do not leave the car engine running unnecessarily.' },
            { value: 'Temporary visitor parking is to the right of the main entrance.' },
          ],
        },
        {
          id: 'rubbish-recycling',
          title: 'Rubbish & Recycling',
          summary: 'How to recycle and dispose of general household rubbish.',
          icon: 'i-lucide-recycle',
          enabled: true,
          priority: false,
          items: [
            { value: 'The recycling container is on the balcony.' },
            { value: 'Cardboard can go in recycling.' },
            { value: 'Do not put general garbage there.', tone: 'warning' },
            { value: 'No food containers.' },
            { value: 'Use the white AVAG bags provided under the sink.' },
            { value: 'Put full bags in the grey container outside by visitor parking.' },
            { value: 'Use the key to unlock the padlock.' },
            { value: 'Only white AVAG bags can go in the big bin.', tone: 'important' },
          ],
        },
        {
          id: 'apartment-info',
          title: 'Apartment Info',
          summary: 'Useful details about the apartment equipment and facilities.',
          icon: 'i-lucide-info',
          enabled: true,
          priority: false,
          items: [
            { value: 'USB chargers are supplied; do not take or move installed chargers.' },
            { value: 'Dishwasher: select a program, add a dishwasher tab, then press start.' },
            { value: 'Never put washing-up liquid in the dishwasher.', tone: 'warning' },
            { value: 'Games and books are available; please treat them with respect.' },
            { value: 'The ironing board is on the landing between the bedrooms.' },
            { value: 'Tap water is 100% drinkable.' },
            { value: 'Cable TV and DVDs are available.' },
          ],
        },
        {
          id: 'local-information',
          title: 'Local Information',
          summary: 'Nearby shops, post office and bus stop details.',
          icon: 'i-lucide-map-pin',
          enabled: true,
          priority: false,
          items: [
            { value: 'CO-OP supermarket is downstairs and open Mon-Sun 08:00-20:00.' },
            { value: 'The Post Office is inside CO-OP.' },
            { value: 'Lidl is open daily 08:00-21:00.' },
            { value: 'The bus stop is on the main street by Tells restaurant.' },
            { value: 'Use buses 104 and 105 for local connections.' },
          ],
        },
        {
          id: 'bike-rentals',
          title: 'Bike Rentals',
          summary: 'Bike and activity rental options nearby.',
          icon: 'i-lucide-bike',
          enabled: true,
          priority: false,
          items: [
            { value: 'Amacher Bike Shop rents electric bikes.' },
            {
              value:
                'Daniels Fun Rentals offers mountain bikes, scooters, ATVs, funcars, e-bikeboards and quads.',
            },
          ],
        },
        {
          id: 'grocery-shopping',
          title: 'Grocery Shopping',
          summary: 'Easy grocery options around the apartment.',
          icon: 'i-lucide-shopping-basket',
          enabled: true,
          priority: false,
          items: [
            { value: 'CO-OP supermarket is downstairs for everyday groceries.' },
            { value: 'Lidl is nearby and open daily 08:00-21:00.' },
            { value: 'Bring purchases back directly to the apartment and keep shared spaces clear.' },
          ],
        },
        {
          id: 'transport',
          title: 'Transport',
          summary: 'Simple walking directions and public transport pointers.',
          icon: 'i-lucide-train',
          enabled: true,
          priority: false,
          items: [
            {
              label: 'Interlaken West',
              value:
                'Walk from Hobachergassli towards the main road, continue towards central Interlaken and follow signs for Interlaken West station.',
            },
            {
              label: 'Interlaken Ost',
              value:
                'Walk towards the main road and continue east through Interlaken, or take a local bus connection towards Interlaken Ost.',
            },
            { value: 'Bus 104/105 details should be confirmed against the current timetable.' },
          ],
        },
      ],
    },
  ],
}

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

async function loadServiceAccount(pathLike) {
  const resolved = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolved}`)
  }
  return {
    resolvedPath: resolved,
    projectId: normalizeString(parsed.project_id),
    credential: cert(parsed),
  }
}

function stamp(now) {
  return {
    at: now,
    by: ACTOR,
    app_id: APP_ID,
  }
}

function sectionPatch(section, sortOrder, now) {
  return {
    id: section.id,
    title: section.title,
    summary: section.summary,
    icon: section.icon,
    enabled: section.enabled !== false,
    priority: Boolean(section.priority),
    items: Array.isArray(section.items) ? section.items : [],
    sort_order: sortOrder,
    updated: stamp(now),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : SERVICE_ACCOUNT_PATH
  const projectId =
    typeof args.project === 'string' ? normalizeString(args.project) : PROJECT_ID
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DATABASE_ID

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const adminApp = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId,
    },
    `seed-sproochli-bnb-guides-${Date.now()}`
  )
  const db = getFirestore(adminApp, databaseId)
  const now = Timestamp.now()

  const siteRef = db.collection('sproochli_sites').doc(holidayWithNats.id)
  const guidePage = holidayWithNats.pages[0]
  const pageRef = siteRef.collection('pages').doc(guidePage.id)

  const sitePatch = {
    id: holidayWithNats.id,
    slug: holidayWithNats.slug,
    type: holidayWithNats.type,
    title: holidayWithNats.title,
    status: holidayWithNats.status,
    published: holidayWithNats.published,
    original_language: holidayWithNats.original_language,
    primary_language: holidayWithNats.primary_language,
    property: holidayWithNats.property,
    privacy_note: holidayWithNats.privacy_note,
    footer: holidayWithNats.footer,
    standard_topic_ids: holidayWithNats.standard_topic_ids,
    source: {
      kind: 'static-proof',
      file: 'projects/fireux/sproochli/app/demo/bnbGuides.ts',
      original_file: 'House Manual 2019.docx',
    },
    updated: stamp(now),
  }

  const pagePatch = {
    id: guidePage.id,
    slug: guidePage.slug,
    title: guidePage.title,
    page_type: guidePage.page_type,
    language: guidePage.language,
    section_order: guidePage.sections.map((section) => section.id),
    updated: stamp(now),
  }

  const writes = [
    { ref: siteRef, patch: sitePatch },
    { ref: pageRef, patch: pagePatch },
    {
      ref: siteRef.collection('guest_messages').doc('current'),
      patch: {
        id: 'current',
        ...holidayWithNats.guest_message,
        active: true,
        updated: stamp(now),
      },
    },
    ...holidayWithNats.maintainers.map((maintainer) => ({
      ref: siteRef.collection('maintainers').doc(maintainer.id),
      patch: {
        ...maintainer,
        updated: stamp(now),
      },
    })),
    ...guidePage.sections.map((section, index) => ({
      ref: pageRef.collection('sections').doc(section.id),
      patch: sectionPatch(section, (index + 1) * 10, now),
    })),
  ]

  console.log('[seed] Sproochli BNB guides', {
    projectId,
    databaseId,
    commit,
    sitePath: siteRef.path,
    pagePath: pageRef.path,
    maintainers: holidayWithNats.maintainers.length,
    sections: guidePage.sections.length,
    writes: writes.length,
  })

  for (const write of writes) {
    if (!commit) {
      console.log('[dry-run] set', write.ref.path, write.patch)
      continue
    }
    await write.ref.set(write.patch, { merge: true })
  }

  console.log('[seed] complete', {
    commit,
    writes: writes.length,
    sitePath: siteRef.path,
    pagePath: pageRef.path,
  })
}

main().catch((error) => {
  console.error('[seed] Sproochli BNB guides failed')
  console.error(error)
  process.exit(1)
})
