function connectProviderIframe(options) {
  var frame = document.querySelector(options.selector)
  if (!frame) return
  var receivedHeight = false

  function requestProviderHeight() {
    if (receivedHeight) return
    if (!frame.contentWindow) return

    frame.contentWindow.postMessage({
      source: 'fireux-tool-iframe',
      type: 'tool-height-request'
    }, options.providerOrigin)
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== options.providerOrigin) return
    if (!event.data || event.data.source !== options.messageSource) return
    if (options.tool && event.data.tool !== options.tool) return
    if (event.data.type !== 'tool-height') return

    var height = Number(event.data.height)
    if (!Number.isFinite(height) || height <= 0) return

    receivedHeight = true
    frame.style.height = Math.ceil(height) + 'px'
  })

  frame.addEventListener('load', requestProviderHeight)
  requestProviderHeight()
  setTimeout(requestProviderHeight, 100)
  setTimeout(requestProviderHeight, 500)
  setTimeout(requestProviderHeight, 1500)
}

function isLocalHarness() {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].indexOf(window.location.hostname) >= 0
}

function localProviderOrigin(port) {
  return window.location.protocol + '//' + window.location.hostname + ':' + String(port || '').trim()
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

    connectProviderIframe({
      selector: options.selector,
      providerOrigin: options.localOrigin,
      messageSource: options.messageSource,
      tool: options.tool
    })

    frame.src = src
    frame.hidden = false
    if (status) status.hidden = true
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

function connectMiseboxMenuPopup(options) {
  var button = document.querySelector(options.buttonSelector)
  var mount = document.querySelector(options.mountSelector)
  var status = document.querySelector(options.statusSelector)

  if (!button || !mount) return

  injectMiseboxMenuPopupStyles()

  var state = {
    loaded: false,
    loading: false,
    menu: null,
    apiUrl: ''
  }

  function apiUrl() {
    return typeof options.apiUrl === 'function'
      ? text(options.apiUrl())
      : text(options.apiUrl)
  }

  function setStatus(message) {
    if (!status) return
    status.textContent = message || ''
    status.hidden = !message
  }

  function openPopup() {
    mount.hidden = false
    mount.setAttribute('aria-hidden', 'false')
    document.documentElement.classList.add('misebox-menu-popup-open')
  }

  function closePopup() {
    mount.hidden = true
    mount.setAttribute('aria-hidden', 'true')
    document.documentElement.classList.remove('misebox-menu-popup-open')
  }

  function renderLoading() {
    mount.innerHTML = [
      '<div class="misebox-menu-popup" role="dialog" aria-modal="true">',
      '  <div class="misebox-menu-popup__panel">',
      '    <button class="misebox-menu-popup__close" type="button" aria-label="Close menu">Close</button>',
      '    <p class="misebox-menu-popup__state">Loading menu...</p>',
      '  </div>',
      '</div>'
    ].join('')
    bindClose(mount, closePopup)
  }

  function renderError(message) {
    mount.innerHTML = [
      '<div class="misebox-menu-popup" role="dialog" aria-modal="true">',
      '  <div class="misebox-menu-popup__panel">',
      '    <button class="misebox-menu-popup__close" type="button" aria-label="Close menu">Close</button>',
      '    <h2>Menu unavailable</h2>',
      '    <p class="misebox-menu-popup__state">' + escapeHtml(message || 'The menu could not be loaded.') + '</p>',
      '  </div>',
      '</div>'
    ].join('')
    bindClose(mount, closePopup)
  }

  function renderMenu(menu) {
    var sections = Array.isArray(menu.sections) ? menu.sections : []
    var title = text(menu.name) || 'Menu'
    var kitchenName = text(read(menu, 'source.kitchen_name'))

    mount.innerHTML = [
      '<div class="misebox-menu-popup" role="dialog" aria-modal="true">',
      '  <div class="misebox-menu-popup__panel">',
      '    <button class="misebox-menu-popup__close" type="button" aria-label="Close menu">Close</button>',
      '    <header class="misebox-menu-popup__header">',
      kitchenName ? '      <p>' + escapeHtml(kitchenName) + '</p>' : '',
      '      <h2>' + escapeHtml(title) + '</h2>',
      menu.description ? '      <p>' + escapeHtml(menu.description) + '</p>' : '',
      '    </header>',
      sections.length
        ? sections.map(renderSection).join('')
        : '    <p class="misebox-menu-popup__state">This menu has no public sections yet.</p>',
      '  </div>',
      '</div>'
    ].join('')
    bindClose(mount, closePopup)
  }

  function loadMenu() {
    var url = apiUrl()

    if (!url) {
      setStatus('Menu API URL is missing.')
      return
    }

    if (state.loaded && state.apiUrl === url) {
      renderMenu(state.menu)
      openPopup()
      return
    }

    if (state.loading) return
    state.loading = true
    state.apiUrl = url
    button.disabled = true
    setStatus('Loading menu from Misebox...')
    renderLoading()
    openPopup()

    window.fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Menu API returned ' + response.status + '.')
        return response.json()
      })
      .then(function (menu) {
        state.menu = menu
        state.loaded = true
        renderMenu(menu)
        setStatus('')
      })
      .catch(function (error) {
        var message = error && error.message
          ? error.message
          : 'Menu could not be loaded.'
        renderError(message)
        setStatus(message)
      })
      .then(function () {
        state.loading = false
        button.disabled = false
      })
  }

  button.addEventListener('click', loadMenu)
  mount.addEventListener('click', function (event) {
    if (event.target === mount.firstElementChild) closePopup()
  })
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !mount.hidden) closePopup()
  })
}

function bindClose(root, closePopup) {
  var closeButton = root.querySelector('.misebox-menu-popup__close')
  if (closeButton) closeButton.addEventListener('click', closePopup)
}

function renderSection(section) {
  var items = Array.isArray(section.items) ? section.items : []
  var label = text(section.label) || 'Menu'

  return [
    '<section class="misebox-menu-popup__section">',
    '  <h3>' + escapeHtml(label) + '</h3>',
    items.length
      ? items.map(renderItem).join('')
      : '  <p class="misebox-menu-popup__state">No items in this section.</p>',
    '</section>'
  ].join('')
}

function renderItem(item) {
  var name = text(item.name || read(item, 'dish.name') || read(item, 'item.name'))
  var description = text(item.description || read(item, 'dish.description'))
  var price = priceLabel(item)
  var options = priceOptions(item)

  return [
    '<article class="misebox-menu-popup__item">',
    '  <div>',
    '    <h4>' + escapeHtml(name || 'Menu item') + '</h4>',
    description ? '    <p>' + escapeHtml(description) + '</p>' : '',
    options.length ? renderPriceOptions(options) : '',
    '  </div>',
    price ? '  <strong>' + escapeHtml(price) + '</strong>' : '',
    '</article>'
  ].join('')
}

function renderPriceOptions(options) {
  return [
    '<ul class="misebox-menu-popup__options">',
    options.map(function (option) {
      return '<li>' + escapeHtml(option.label) + ' <span>' + escapeHtml(option.price) + '</span></li>'
    }).join(''),
    '</ul>'
  ].join('')
}

function priceOptions(item) {
  var rows = Array.isArray(item.priceOptions)
    ? item.priceOptions
    : Array.isArray(item.price_options)
      ? item.price_options
      : []

  return rows.map(function (option) {
    var label = text(option.label) ||
      [text(option.quantity), text(option.unit)].filter(Boolean).join(' ')
    var price = priceLabel(option)
    return {
      label: label,
      price: price
    }
  }).filter(function (option) {
    return option.label && option.price
  })
}

function priceLabel(item) {
  var label = text(item.priceLabel || item.price_label)
  if (label) return label

  var price = Number(item.price)
  return Number.isFinite(price) && price > 0
    ? 'CHF ' + formatPrice(price)
    : ''
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace(/\.00$/, '.-')
}

function text(value) {
  return String(value == null ? '' : value).trim()
}

function read(source, path) {
  return path.split('.').reduce(function (value, key) {
    if (!value || typeof value !== 'object') return ''
    return value[key]
  }, source)
}

function escapeHtml(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function injectMiseboxMenuPopupStyles() {
  if (document.getElementById('misebox-menu-popup-styles')) return

  var style = document.createElement('style')
  style.id = 'misebox-menu-popup-styles'
  style.textContent = [
    '.misebox-menu-popup-open { overflow: hidden; }',
    '.misebox-menu-popup { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; background: rgba(18, 16, 12, 0.72); padding: 1rem; }',
    '.misebox-menu-popup__panel { box-sizing: border-box; width: min(52rem, 100%); max-height: min(46rem, 92svh); overflow: auto; border-radius: calc(var(--ui-radius, 0.25rem) * 6); background: #fffaf0; color: #1d1d1f; padding: clamp(1.25rem, 4vw, 2.5rem); box-shadow: 0 2rem 5rem rgba(0, 0, 0, 0.34); }',
    '.misebox-menu-popup__close { float: right; border: 1px solid #d6c39d; border-radius: 9999px; background: #f4ead8; color: #1d1d1f; padding: 0.55rem 0.85rem; cursor: pointer; }',
    '.misebox-menu-popup__header { margin-bottom: 2rem; text-align: center; }',
    '.misebox-menu-popup__header p { margin: 0.35rem auto; max-width: 36rem; color: #625847; }',
    '.misebox-menu-popup__header h2 { margin: 0; font-size: clamp(2.25rem, 7vw, 4.75rem); letter-spacing: -0.07em; line-height: 0.9; }',
    '.misebox-menu-popup__section { clear: both; margin-top: 1.75rem; }',
    '.misebox-menu-popup__section h3 { display: grid; grid-template-columns: auto minmax(2rem, 1fr); gap: 0.75rem; align-items: center; margin: 0 0 0.85rem; color: #1d1d1f; font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 900; letter-spacing: 0.16em; line-height: 1.2; text-transform: uppercase; }',
    '.misebox-menu-popup__section h3::after { content: ""; display: block; height: 2px; background: rgba(29, 29, 31, 0.28); }',
    '.misebox-menu-popup__item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(29, 29, 31, 0.14); }',
    '.misebox-menu-popup__item h4, .misebox-menu-popup__item p { margin: 0; }',
    '.misebox-menu-popup__item h4 { font-size: 1rem; letter-spacing: -0.02em; }',
    '.misebox-menu-popup__item p { margin-top: 0.25rem; color: #625847; line-height: 1.45; }',
    '.misebox-menu-popup__item strong { white-space: nowrap; }',
    '.misebox-menu-popup__options { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.55rem 0 0; padding: 0; list-style: none; }',
    '.misebox-menu-popup__options li { border-radius: 9999px; background: #f4ead8; padding: 0.25rem 0.5rem; color: #625847; font-size: 0.88rem; }',
    '.misebox-menu-popup__options span { color: #1d1d1f; font-weight: 700; }',
    '.misebox-menu-popup__state { color: #625847; }'
  ].join('\n')
  document.head.appendChild(style)
}

loadSourcePreviews()
