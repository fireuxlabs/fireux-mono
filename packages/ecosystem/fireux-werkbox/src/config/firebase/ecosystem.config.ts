// Concurrent edit — 2026-07-21 12:19 CEST — Cleanbox to Werkbox migration: bind logical Werkbox identity to the existing physical Firebase authority.
import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: 'fireux-werkbox',
  name: 'werkbox',
  description: 'FireUX Werkbox - Practical work ecosystem',
  firebase: {
    apiKey: 'AIzaSyBr8HyfrjHGdWA6EAbBddpLL-c4qddMh4A',
    authDomain: 'cleanbox-f15bc.firebaseapp.com',
    projectId: 'cleanbox-f15bc',
    storageBucket: 'cleanbox-f15bc.firebasestorage.app',
    messagingSenderId: '1083929507377',
    databaseId: 'cleanbox',
  },
  ssr: {
    region: 'europe-west1',
  },
} as const satisfies FireuxEcosystemConfig
