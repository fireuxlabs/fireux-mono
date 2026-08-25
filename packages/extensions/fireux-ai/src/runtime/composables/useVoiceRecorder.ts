import { computed, onBeforeUnmount, ref } from 'vue'

export type VoiceRecording = {
  audio: Blob
  fileName: string
}

const preferredTypes = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
] as const

function recordingType() {
  if (!import.meta.client || typeof MediaRecorder === 'undefined') return ''
  return (
    preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || ''
  )
}

function extensionFor(type: string) {
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('webm')) return 'webm'
  return 'audio'
}

export function useVoiceRecorder() {
  const recording = ref(false)
  const error = ref('')
  let recorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunks: Blob[] = []

  const supported = computed(
    () =>
      import.meta.client &&
      typeof MediaRecorder !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia)
  )

  async function start() {
    if (!supported.value || recording.value) return false
    error.value = ''
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = recordingType()
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      chunks = []
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size) chunks.push(event.data)
      })
      recorder.start()
      recording.value = true
      return true
    } catch (cause) {
      cleanup()
      error.value =
        cause instanceof DOMException && cause.name === 'NotAllowedError'
          ? 'Microphone access was not allowed.'
          : 'The microphone could not be started.'
      return false
    }
  }

  async function stop(): Promise<VoiceRecording | null> {
    if (!recorder || recorder.state === 'inactive') return null
    const activeRecorder = recorder
    const audio = await new Promise<Blob>((resolve) => {
      activeRecorder.addEventListener(
        'stop',
        () =>
          resolve(
            new Blob(chunks, {
              type: activeRecorder.mimeType || chunks[0]?.type || 'audio/webm',
            })
          ),
        { once: true }
      )
      activeRecorder.stop()
    })
    cleanup()
    if (!audio.size) {
      error.value = 'No speech was recorded.'
      return null
    }
    return {
      audio,
      fileName: `voice.${extensionFor(audio.type)}`,
    }
  }

  function cleanup() {
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    recorder = null
    chunks = []
    recording.value = false
  }

  onBeforeUnmount(cleanup)

  return { supported, recording, error, start, stop }
}
