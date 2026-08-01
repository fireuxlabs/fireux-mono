import { computed, ref } from 'vue'

export type CommunityTopic = {
  id: string
  category: string
  title: string
  body: string
  author: string
  replies: number
  updated: string
}

const topics = ref<CommunityTopic[]>([
  { id: 'handover-notes', category: 'Daily practice', title: 'How do you keep handovers useful on busy days?', body: 'Share approaches without naming people, locations, incidents, or employers.', author: 'Community member', replies: 4, updated: 'Demo fixture' },
  { id: 'team-routines', category: 'Team routines', title: 'What helps a new seasonal team agree on routines?', body: 'Discuss routines and communication patterns, not emergency instructions.', author: 'Community member', replies: 2, updated: 'Demo fixture' },
])

const programmes = [
  { id: 'peer-practice', title: 'Peer practice circle', duration: '3 community sessions', summary: 'A facilitated reflection and peer-practice programme.', completion: 'Attend all three recorded community sessions.' },
  { id: 'communication', title: 'Communication lab', duration: '2 community sessions', summary: 'A discussion-based programme about professional communication.', completion: 'Attend both recorded community sessions.' },
]

const enrolments = ref<Record<string, { progress: number, completed: boolean }>>({})

export function useCommunityDemo() {
  const eligibleForCap = computed(() =>
    Object.values(enrolments.value).some(enrolment => enrolment.completed)
  )

  function enrol(programmeId: string) {
    enrolments.value[programmeId] ||= { progress: 0, completed: false }
  }

  function complete(programmeId: string) {
    enrol(programmeId)
    enrolments.value[programmeId] = { progress: 100, completed: true }
  }

  function addTopic(input: Pick<CommunityTopic, 'category' | 'title' | 'body'>, author: string) {
    topics.value.unshift({
      id: `demo-${Date.now()}`,
      ...input,
      author,
      replies: 0,
      updated: 'This browser session',
    })
  }

  return { topics, programmes, enrolments, eligibleForCap, enrol, complete, addTopic }
}
