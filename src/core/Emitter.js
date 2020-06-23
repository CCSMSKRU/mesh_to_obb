export class Emitter {
    constructor() {
        this.listeners = {}

    }

    emit(event, ...args) {
        if (!Array.isArray(this.listeners[event])) return false

        this.listeners[event].forEach(listener => {
            listener(...args)
        })
        return true
    }

    subscribe(event, fn) {
        if (typeof fn !== 'function') throw new Error('fn should be function')
        if (!this.listeners[event]) this.listeners[event] = []
        this.listeners[event].push(fn)
        return () => {
            this.listeners[event] = this.listeners[event].filter(listener => listener !== fn)
        }
    }
}
