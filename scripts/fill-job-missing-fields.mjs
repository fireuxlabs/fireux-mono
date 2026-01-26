#!/usr/bin/env node
import admin from 'firebase-admin'
import fs from 'fs'

const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!credsPath) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON path')
  process.exit(1)
}

const project = process.argv[2] || process.env.FIREBASE_PROJECT || 'misebox-78f9c'
const ids = process.argv[3] ? process.argv[3].split(',') : ['SY1Y1b7e0kxAZy9AwPah','k6QWI9hAmhmHFj1Iq9hT']
const updates = {
  employment_type: 'permanent',
  starts_on: 'asap',
  source_url: ''
}

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
admin.initializeApp({ credential: admin.credential.cert(creds), projectId: project })
const db = admin.firestore()

async function run() {
  for (const id of ids) {
    const ref = db.collection('jobs').doc(id)
    try {
      await ref.set(updates, { merge: true })
      console.log('Updated job', id)
    } catch (err) {
      console.error('Failed updating', id, err)
    }
  }
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
