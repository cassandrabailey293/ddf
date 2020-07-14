var EventSource = require('eventsource')
const Common = require('./Common.js')

const REQUEST_HEADER = 'XMLHttpRequest'
const HEADERS = {
  'X-Requested-With': REQUEST_HEADER,
}

var source

var id = Common.generateUUID()

module.exports = {
  createEventListener(type, handlers) {
    const { onMessage } = handlers
    if (source) {
      console.log('IF on message')
      console.log('id: ', id)
      source.addEventListener(type, event => {
        onMessage(event)
      })
    } else {
      id = Common.generateUUID()
      source = new EventSource('./internal/events/' + id, {
        withCredentials: true,
        credentials: 'same-origin',
        headers: HEADERS,
      })
      source.addEventListener(type, event => {
        console.log('ELSE on message')
        console.log('id: ', id)
        onMessage(event)
      })
      source.onerror = event => {
        console.log('on error')
        console.log(event)
        console.log('id: ', id)
        source.close()
        source = null
      }
      source.addEventListener('close', event => {
        console.log('on close')
        console.log(event)
        console.log('id: ', id)
        source.close()
        source = null
      })
    }
  },
}
