#!/usr/bin/env node
/*
  One-off: update professional profile for WjqzWuxCtOQ2gRALFAzzOscUHTV2.

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login

  Required env:
    - FIREBASE_PROJECT_ID (or GCLOUD_PROJECT)
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID (or GCLOUD_PROJECT).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    return cert(json)
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

const uid = 'WjqzWuxCtOQ2gRALFAzzOscUHTV2'

const patch = {
  id: uid,
  job_title: 'Chef de Partie',
  title: 'Chef de Partie',
  subtitle: 'Alpine & Hotel Operations',
  tagline: 'Zuverlässiger Chef de Partie mit Erfahrung in Schweizer Hotel- und Bergbetrieben',
  tags: [
    'Chef de Partie',
    'Food & Beverage',
    'Alpine Operations',
    'Hotelküche',
    'Multi-Site Einsatz',
  ],
  summary: 'Chef de Partie mit starker Erfahrung in Schweizer Hotel- und Bergbetrieben. Regelmässig standortübergreifend eingesetzt, belastbar im Service und sicher im täglichen Küchenbetrieb.',
  bio: 'Erfahrener Gastronomiefachmann mit breiter Praxis in alpinen Hotel- und Restaurantküchen in der Schweiz. Wurde von Arbeitgebern mehrfach standortübergreifend eingesetzt und übernahm Verantwortung sowohl in der Küche als auch im operativen Tagesgeschäft. Zuverlässig, flexibel und schnell integriert – auch in hektischen Servicezeiten.',
  image: '',
  languages: [
    { language: 'Swiss German', proficiency: 'Native' },
    { language: 'German', proficiency: 'Fluent' },
  ],
  certifications: [],
  education: [],
  projects: [],
  volunteering: [],
  other_experience: [],
  relevant_experience: [
    {
      place_id: 'ChIJbb-8EJqkj0cRaTZzUz6bnsY',
      role: 'Chef de Partie',
      from_month: 'May',
      from_year: '2025',
      to_month: 'Feb',
      to_year: '2026',
      ongoing: false,
      responsibilities: '',
    },
    {
      place_id: 'ChIJmXacLZqkj0cRw7jhIozyjkE',
      role: 'Chef de Partie',
      from_month: 'Aug',
      from_year: '2021',
      to_month: 'Dec',
      to_year: '2023',
      ongoing: false,
      responsibilities: '',
    },
    {
      place_id: 'ChIJ0UF6GPmvj0cR__jYKy-J8pE',
      role: 'Chef de Partie / Betriebsassistent',
      from_month: 'Feb',
      from_year: '2023',
      to_month: 'Mar',
      to_year: '2025',
      ongoing: false,
      responsibilities: '',
    },
  ],
  updated_at: FieldValue.serverTimestamp(),
}

async function main() {
  initializeApp({ credential: await resolveCredential(), projectId })
  const db = getFirestore()
  const ref = db.collection('professionals').doc(uid)

  await ref.set(patch, { merge: true })
  console.log('[ok] updated professionals/' + uid)
}

main().catch((error) => {
  console.error('[error]', error)
  process.exit(1)
})
