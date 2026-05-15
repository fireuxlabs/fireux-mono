// Repo-level demo payloads for Users.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

export const demoUserList = [
  {
    id: 'user_demo_001',
    email: 'ava@harbor-grid.demo',
    display_name: 'Ava Laurent',
    handle: 'ava-laurent',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    bio: 'Chef with alpine and coastal service experience.',
    profiles: [] as string[],
    userOf: [] as string[],
    adminOf: [] as string[],
    notifications: [] as unknown[],
    creator_id: undefined as string | undefined,
    created_at: { seconds: 1735689600, nanoseconds: 0 },
    updated_at: { seconds: 1735689600, nanoseconds: 0 },
  },
  {
    id: 'user_demo_002',
    email: 'luca@harbor-grid.demo',
    display_name: 'Luca Moretti',
    handle: 'luca-moretti',
    avatar:
      'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=240&q=80',
    bio: 'Pastry specialist focused on seasonal dessert menus.',
    profiles: [] as string[],
    userOf: [] as string[],
    adminOf: [] as string[],
    notifications: [] as unknown[],
    creator_id: undefined as string | undefined,
    created_at: { seconds: 1735689600, nanoseconds: 0 },
    updated_at: { seconds: 1735689600, nanoseconds: 0 },
  },
  {
    id: 'user_demo_003',
    email: 'noor@harbor-grid.demo',
    display_name: 'Noor Haddad',
    handle: 'noor-haddad',
    avatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80',
    bio: 'Line cook known for consistency under pressure.',
    profiles: [] as string[],
    userOf: [] as string[],
    adminOf: [] as string[],
    notifications: [] as unknown[],
    creator_id: undefined as string | undefined,
    created_at: { seconds: 1735689600, nanoseconds: 0 },
    updated_at: { seconds: 1735689600, nanoseconds: 0 },
  },
]

export const demoUser = demoUserList[0]
