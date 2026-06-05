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
