// COMMENT: app/composables/effects/useDataStream.ts
export function useDataStream() {
  const initializeStreams = () => {
    const streams = document.querySelectorAll('.data-stream')

    streams.forEach((stream) => {
      const streamElement = stream as HTMLElement

      // ✅ Random horizontal position
      streamElement.style.left = `${Math.random() * 100}%`

      // ✅ Random height for variety
      const height = Math.random() * 300 + 100
      streamElement.style.height = `${height}px`

      // ✅ Random width (1-3px for thin lines)
      const width = Math.random() * 2 + 1
      streamElement.style.width = `${width}px`

      // ✅ Random opacity
      const opacity = Math.random() * 0.8 + 0.2
      streamElement.style.opacity = opacity.toString()

      // ✅ Random animation speed
      const duration = Math.random() * 8 + 4 // 4-12 seconds
      streamElement.style.animationDuration = `${duration}s`

      // ✅ Random delay
      const delay = Math.random() * 5
      streamElement.style.animationDelay = `${delay}s`

      // ✅ Add data characters
      const dataChars = [
        '0',
        '1',
        '/',
        '\\',
        '|',
        '-',
        '+',
        '*',
        '#',
        '@',
        '%',
        '&',
      ]
      const randomChar = dataChars[Math.floor(Math.random() * dataChars.length)]

      // Create text content
      const textContent = Array(Math.floor(height / 20))
        .fill(randomChar)
        .join(' ')
      streamElement.textContent = textContent
    })
  }

  return {
    initializeStreams,
  }
}
