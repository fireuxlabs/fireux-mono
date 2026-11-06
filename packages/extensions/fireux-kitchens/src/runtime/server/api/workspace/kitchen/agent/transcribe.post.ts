import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { readUploadedMultipartFile } from 'fireux-core/runtime/server/utils/uploads/multipart'
import { transcribeFireuxAudio } from 'fireux-ai/runtime/server/utils/audio-transcription.server'

export default defineEventHandler(async (event) => {
  await requireFirebaseBearerUser(
    event,
    'A Firebase identity is required for voice input.',
    { allowAnonymous: true }
  )
  const parts = await readMultipartFormData(event)
  const audio = readUploadedMultipartFile(parts, {
    label: 'Voice recording',
    defaultFileName: 'voice.webm',
    maxFileSizeMb: 5,
    allowedTypes: [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
    ],
    extensionTypes: {
      '.webm': 'audio/webm',
      '.m4a': 'audio/mp4',
      '.mp4': 'audio/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
    },
    invalidTypeMessage: 'Record a supported audio clip.',
  })
  if (audio.data.byteLength < 1_000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The voice recording was too short.',
    })
  }
  const result = await transcribeFireuxAudio(event, audio)
  return { ok: true as const, text: result.text }
})
