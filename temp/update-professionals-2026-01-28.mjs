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

const updates = [
  {
    id: 'FoPLMYVPirSiMm2eDskwsZja0q42',
    job_title: 'Chef de Partie',
    summary:
      'Experienced Chef de Partie with strong background in Michelin-recommended restaurants, private chalet dining, and high-volume hotel kitchens.',
    bio:
      'Chef de Partie with experience across fine dining, hotels, and high-volume operations. Has led sections independently, covered head chef duties, managed ordering, and trained junior staff while maintaining high standards and hygiene compliance.',
    image: '',
    positions: ['Chef de Partie', 'Sous Chef', 'Head Chef'],
  },
  {
    id: 'OnLDg1ZcGqh30aaopCZggBIyhbS2',
    job_title: 'Sous Chef',
    summary:
      'Sous Chef with extensive international experience in hotels and restaurants, covering à la carte, banqueting, and high-volume service.',
    bio:
      'Sous Chef with a long career across Switzerland, Portugal, and international hotels. Experienced in kitchen leadership, menu execution, staff supervision, and maintaining quality and hygiene standards in demanding environments.',
    image: '',
    positions: [
      'Sous Chef',
      'Chef de Partie',
      'Cook',
      'Commis de Cuisine',
      'Apprentice',
    ],
  },
  {
    id: 'WShQtlmVVVdqajd9muSHBLnm9kD2',
    job_title: '',
    summary: '',
    bio: '',
    image: '',
    positions: [],
  },
  {
    id: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
    job_title: 'Freelance Chef',
    summary:
      'Freelance chef and application developer with experience across Swiss hospitality, relief work, and kitchen leadership.',
    bio:
      'Freelance chef with experience as Chef de Partie, Sous Chef, Head Chef, and relief agent in Switzerland and the UK. Background includes fine dining, hotels, high-volume service, and seasonal work, alongside building digital tools for the hospitality industry.',
    image: '',
    positions: ['Chef de Partie', 'Sous Chef', 'Head Chef', 'Relief Chef'],
  },
  {
    id: 'rEssOnUA8wVHdNKE2JETqWAdwdm1',
    job_title: 'Kitchen Cleaner',
    summary:
      'Kitchen and service area cleaner with experience maintaining hygiene standards in hospitality environments.',
    bio:
      'Worked as a kitchen and service area cleaner, responsible for dishwashing, deep cleaning, and maintaining hygiene standards in busy hospitality settings.',
    image: '',
    positions: ['Kitchen Cleaner'],
  },
  {
    id: 's9hKBxO7mJSFC5vHNOo3mt9Dgi42',
    job_title: 'Head Chef',
    summary:
      'Head Chef with experience leading teams in hotels and restaurants, including fine dining and seasonal resort kitchens.',
    bio:
      'Head Chef with experience managing kitchen teams, designing menus, and delivering consistent service in hotels, restaurants, and resort environments. Background includes sous chef and freelance roles supporting high-volume operations.',
    image: '',
    positions: ['Head Chef', 'Sous Chef', 'Freelance Sous Chef'],
  },
  {
    id: 'xdu83J77YeOROlePJdibPekxkDp2',
    job_title: '',
    summary: '',
    bio: '',
    image: '',
    positions: [],
  },
]

const batch = db.batch()
for (const item of updates) {
  const ref = db.collection('professionals').doc(item.id)
  batch.update(ref, {
    job_title: item.job_title,
    summary: item.summary,
    bio: item.bio,
    image: item.image,
    positions: item.positions,
  })
}

await batch.commit()
console.log('[update-professionals] updated', updates.length)
