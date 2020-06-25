/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {$} from '@core/dom'
import {Emitter} from '@core/Emitter'
import {Project} from '@/logicComponents/project/Project'

export class App {
    constructor(selector, options) {
        this.$el = $(selector)
        this.components = options.components || []

        this.emitter = new Emitter()
        this.unsubscribers = []
        this.project = new Project()
    }

    init() {

        // this.pEngine = init3D()


        this.project.init()

        this.project.loadModel().then(()=>{
            this.$emit('project:loadModel')
        })


        this.$on('toolbar:loadMesh', (e)=>{
            const loadMesh = async ()=>{
                await this.project.loadMeshUrl(e.file)
                this.$emit('project:loadMeshUrl')

                await this.project.loadMeshModel()
                this.$emit('project:loadMeshModel')
            }

            loadMesh().catch(e=>{
                console.error(e);
            })

        })

    }

    $on(event, fn) {
        const unsub = this.emitter.subscribe(event, fn)
        this.unsubscribers.push(unsub)
    }

    $emit(event, ...args) {
        this.emitter.emit(event, ...args)
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
        this.unsubscribers.forEach(unsub => unsub())
    }

    loadProject() {

    }
}
