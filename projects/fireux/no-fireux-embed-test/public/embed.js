function connectProviderIframe(options) {
  var frame = document.querySelector(options.selector)
  if (!frame) return

  window.addEventListener('message', function (event) {
    if (event.origin !== options.providerOrigin) return
    if (!event.data || event.data.source !== options.messageSource) return
    if (event.data.type !== 'tool-height') return

    var height = Number(event.data.height)
    if (!Number.isFinite(height) || height <= 0) return

    frame.style.height = Math.ceil(height) + 'px'
  })
}

function isLocalHarness() {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].indexOf(window.location.hostname) >= 0
}

function connectLocalProviderIframe(options) {
  var frame = document.querySelector(options.selector)
  var source = document.querySelector(options.sourceSelector)
  var status = document.querySelector(options.statusSelector)

  if (!frame) return

  if (!isLocalHarness()) {
    frame.hidden = true
    if (source) source.textContent = 'Local provider disabled on deployed harness'
    if (status) {
      status.textContent = 'Local provider tests only run from the local Plain Jane harness.'
      status.hidden = false
    }
    return
  }

  var src = options.localOrigin + options.path
  if (source) {
    source.textContent = readableProviderUrl(src)
    source.title = src
  }
  frame.hidden = true

  if (status) {
    status.textContent = 'Checking local provider...'
    status.hidden = false
  }

  probeLocalProvider(src).then(function (isAvailable) {
    if (!isAvailable) {
      if (status) {
        status.textContent = 'Local provider offline. Start it with: ' + options.startCommand
      }
      return
    }

    frame.src = src
    frame.hidden = false
    if (status) status.hidden = true

    connectProviderIframe({
      selector: options.selector,
      providerOrigin: options.localOrigin,
      messageSource: options.messageSource
    })
  })
}

function readableProviderUrl(value) {
  try {
    var url = new URL(value)
    return url.origin + url.pathname
  } catch {
    return value
  }
}

function probeLocalProvider(url) {
  if (!window.fetch || !window.AbortController) return Promise.resolve(true)

  var controller = new AbortController()
  var timer = window.setTimeout(function () {
    controller.abort()
  }, 1500)

  return window.fetch(url, {
    mode: 'no-cors',
    signal: controller.signal
  })
    .then(function () {
      return true
    })
    .catch(function () {
      return false
    })
    .then(function (result) {
      window.clearTimeout(timer)
      return result
    })
}

function loadSourcePreviews() {
  var previews = Array.prototype.slice.call(document.querySelectorAll('[data-source-preview]'))
  if (!previews.length) return

  previews.forEach(function (preview) {
    var key = preview.getAttribute('data-source-preview')
    var output = preview.querySelector('[data-source-preview-output]')
    if (!key || !output) return

    if (!isLocalHarness()) {
      output.textContent = 'Source preview is only available from the local harness server.'
      return
    }

    window.fetch('/__source/' + encodeURIComponent(key), {
      headers: {
        Accept: 'application/json'
      }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Source preview unavailable.')
        return response.json()
      })
      .then(function (payload) {
        output.textContent = formatSourcePreview(payload)
      })
      .catch(function (error) {
        output.textContent = error && error.message
          ? error.message
          : 'Source preview unavailable.'
      })
  })
}

function formatSourcePreview(payload) {
  if (!payload || !payload.ok || !payload.files) {
    return 'Source preview unavailable.'
  }

  return payload.files.map(function (file) {
    return [
      'FILE: ' + file.path,
      '',
      file.content
    ].join('\n')
  }).join('\n\n---\n\n')
}

loadSourcePreviews()
