var EventSource = require('eventsource')

const ORIGIN_HEADER = 'https://localhost:8993/'
const REQUEST_HEADER = 'XMLHttpRequest'
const HEADERS = {
  Origin: ORIGIN_HEADER,
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
        headers: HEADERS,
      })
      source.addEventListener(type, event => {
        onMessage(event)
      })
      sources.push(source)
    }
  },
}
