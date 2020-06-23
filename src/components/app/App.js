import {$} from '@core/dom'
import {Emitter} from '@core/Emitter'

export class App {
    constructor(selector, options) {
        this.$el = $(selector)
        this.components = options.components || []

        this.emitter = new Emitter()
        this.project = {}
    }

    getRoot() {
        const $root = $.create('div', 'app')

        const componentOptions = {
            emitter: this.emitter,
            project: this.project
        }

        this.components = this.components.map(Component => {
            const $el = $.create('div', Component.className)
            const component = new Component($el, componentOptions)
            $el.html(component.toHTML())
            const container = component.wrapperSelector? $root.find(component.wrapperSelector) : $root
            container.append($el)
            return component
        })

        return $root
    }

    render() {
        // const node = document.createElement('h1')
        // node.textContent = 'TEST'
        this.$el.append(this.getRoot())

        this.components.forEach(component => component.init())
    }

    destroy() {
        this.components.forEach(component => component.destroy())
    }
}
