// Package-owned demo payloads for Professionals.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.
// Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: move Professional fixtures to their domain owner.

import { demoUserList } from 'fireux-core/runtime/demo/user'

const demoUsersById = new Map(demoUserList.map((user) => [user.id, user]))

type ProfessionalBase = {
  id: string
  userId: string
  to: string
  image: string
  title: string
  summary: string
}

export const demoProfessionalBaseList = [
  {
    id: 'professional_demo_001',
    userId: 'demo-user-chef-ava',
    to: '',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=480&q=80',
    title: 'Senior Sous Chef',
    summary: 'Seasoned fine-dining chef with alpine and coastal experience.',
  },
  {
    id: 'professional_demo_002',
    userId: 'demo-user-chef-luca',
    to: '',
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=480&q=80',
    title: 'Pastry Chef',
    summary: 'Specializes in laminated doughs, plated desserts, and seasonal menus.',
  },
  {
    id: 'professional_demo_003',
    userId: 'demo-user-chef-noor',
    to: '',
    image: 'https://images.unsplash.com/photo-1529692236671-f1de46e43e74?auto=format&fit=crop&w=480&q=80',
    title: 'Line Cook',
    summary: 'Fast, consistent, and thrives on busy service.',
  },
] satisfies ProfessionalBase[]

const hydrateFromUser = (base: ProfessionalBase) => {
  const user = demoUsersById.get(base.userId)
  return {
    to: base.to,
    avatarUrl: user?.avatar ?? '',
    image: base.image,
    displayName: user?.display_name ?? '',
    title: base.title,
    summary: base.summary,
  }
}

const buildProfessionalPill = (base: ProfessionalBase) => {
  const hydrated = hydrateFromUser(base)
  return {
    to: hydrated.to,
    avatarUrl: hydrated.avatarUrl,
    image: hydrated.image,
    displayName: hydrated.displayName,
    title: hydrated.title,
  }
}

const buildProfessionalCell = (base: ProfessionalBase) => {
  const hydrated = hydrateFromUser(base)
  return {
    to: hydrated.to,
    avatarUrl: hydrated.avatarUrl,
    image: hydrated.image,
    displayName: hydrated.displayName,
    title: hydrated.title,
    summary: hydrated.summary,
  }
}

const buildProfessionalPreview = (base: ProfessionalBase) => {
  const hydrated = hydrateFromUser(base)
  return {
    to: hydrated.to,
    avatarUrl: hydrated.avatarUrl,
    image: hydrated.image,
    displayName: hydrated.displayName,
    title: hydrated.title,
    summary: hydrated.summary,
  }
}

export const demoProfessionalPillList = demoProfessionalBaseList.map(buildProfessionalPill)
export const demoProfessionalCellList = demoProfessionalBaseList.map(buildProfessionalCell)
export const demoProfessionalPreviewList = demoProfessionalBaseList.map(buildProfessionalPreview)

export const demoProfessionalBase = demoProfessionalBaseList[0]
export const demoProfessionalPill = demoProfessionalPillList[0]
export const demoProfessionalCell = demoProfessionalCellList[0]
export const demoProfessionalPreview = demoProfessionalPreviewList[0]
