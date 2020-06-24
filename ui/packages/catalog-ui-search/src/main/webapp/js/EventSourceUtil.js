var EventSource = require('eventsource')

const REQUEST_HEADER = 'XMLHttpRequest'
const HEADERS = {
  'X-Requested-With': REQUEST_HEADER,
}

var sources = []

module.exports = {
  createEventListener(type, handlers) {
    const { onMessage } = handlers
    if (sources.length != 0) {
      sources[0].addEventListener(type, event => {
        onMessage(event)
      })
    } else {
      var source = new EventSource('./internal/events', {
        withCredentials: true,
        credentials: 'same-origin',
        headers: HEADERS,
      })
      source.addEventListener(type, event => {
        onMessage(event)
      })
      sources.push(source)
    }
  },
}
