import {DomListener} from '@core/DomListener'

export class Component extends DomListener {
    constructor($root, options = {}) {
        super($root, options.listeners)
        this.name = options.name || ''
        this.emitter = options.emitter
        this.project = options.project
        this.unsubscribers = []

        this.prepare()

    }


    prepare() {

    }

    // Возвращает шаблон компонента
    toHTML() {
        return ''
    }

    render(...args) {
        this.$root.html(this.toHTML(...args))
    }

    $emit(event, ...args) {
        this.emitter.emit(event, ...args)
    }

    $on(event, fn) {
        const unsub = this.emitter.subscribe(event, fn)
        this.unsubscribers.push(unsub)
    }

    init() {
        this.initDOMListeners()
    }

    destroy() {
        this.removeDOMListeners()
        this.unsubscribers.forEach(unsub => unsub())
    }
}
