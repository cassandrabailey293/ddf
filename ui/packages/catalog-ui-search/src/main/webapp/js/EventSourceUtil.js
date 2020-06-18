import eventTarget from './EventTarget'

module.exports = {
  createEventListener(type, handlers) {
    const { onMessage } = handlers

    eventTarget.addEventListener(type, event => {
      onMessage(event)
    })
  },
}
