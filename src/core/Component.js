import {DomListener} from '@core/DomListener'

export class Component extends DomListener {
    constructor($root, options = {}) {
        super($root, options.listeners)
        this.name = options.name || ''
        this.emitter = options.emitter
        this.app = options.app || {}
        this.unsubscribers = []

        this.prepare()

    }

    get project(){
        return this.app.project || {}
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
