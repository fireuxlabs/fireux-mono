import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!serviceAccountPath) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS')
}

const raw = await readFile(serviceAccountPath, 'utf8')
initializeApp({ credential: cert(JSON.parse(raw)), projectId: 'misebox-78f9c' })
const db = getFirestore()

const hqId = 'OnLDg1ZcGqh30aaopCZggBIyhbS2'
const davidId = 's9hKBxO7mJSFC5vHNOo3mt9Dgi42'
const tahneeqId = 'xdu83J77YeOROlePJdibPekxkDp2'

const batch = db.batch()

// Henrique: remove junior roles from positions
batch.update(db.collection('professionals').doc(hqId), {
  positions: ['Sous Chef', 'Chef de Partie', 'Cook'],
})

// Tahneeq: apply provided fields
batch.update(db.collection('professionals').doc(tahneeqId), {
  job_title: 'Sous Chef',
  summary:
    'Sous Chef / Küchenchef with Swiss experience across à la carte, seminars, banquets, and daily operations, including ordering, menu planning, and leading small teams.',
  bio:
    'Experienced Sous Chef and Küchenchef with hands-on leadership in Swiss hospitality. Covers day-to-day operations, mise en place, ordering, supplier coordination, service execution, and hygiene standards, with experience in hotels and restaurants.',
  image: '',
  positions: ['Sous Chef', 'Küchenchef', 'Chef de Partie'],
  languages: [
    { language: 'German', proficiency: 'fluent' },
    { language: 'Swiss German', proficiency: 'good understanding' },
    { language: 'English', proficiency: 'native/fluency' },
    { language: 'Punjabi', proficiency: 'native' },
    { language: 'Hindi', proficiency: 'native' },
  ],
})

// David: fix HeadChef role -> Head Chef in relevant_experience
const davidRef = db.collection('professionals').doc(davidId)
const davidSnap = await davidRef.get()
if (!davidSnap.exists) {
  throw new Error(`Missing professional ${davidId}`)
}
const davidData = davidSnap.data() || {}
const relevant = Array.isArray(davidData.relevant_experience)
  ? davidData.relevant_experience
  : []
const normalizedRelevant = relevant.map((entry) => {
  if (!entry || typeof entry !== 'object') return entry
  if (entry.role === 'HeadChef') {
    return { ...entry, role: 'Head Chef' }
  }
  return entry
})

batch.update(davidRef, { relevant_experience: normalizedRelevant })

await batch.commit()
console.log('[update-professionals-fixes] updated 3 professionals')
