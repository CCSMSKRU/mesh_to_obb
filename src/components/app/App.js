/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {$} from '@core/dom'
import {Emitter} from '@core/Emitter'
import {Project} from '@/logicComponents/project/Project'
import {Model} from '@core/physicEngine/geometry/Geometry3D'
import {download} from '@core/utils'

export class App {
    constructor(selector, options) {
        this.$el = $(selector)
        this.components = options.components || []

        this.emitter = new Emitter()
        this.unsubscribers = []
        this.project = new Project()
        // this.project = {}
    }

    init() {


        this.$on('toolbar:loadMesh', (e) => {
            const loadMesh = async () => {
                await this.project.loadMeshUrl(e.file)
                this.$emit('project:loadMeshUrl')

                await this.project.loadMeshModel()
                this.$emit('project:loadMeshModel')
            }

            loadMesh().catch(e => {
                console.error(e)
            })

        })

        this.$on('toolbar:loadProject', (e) => {
            let projects
            try {
                projects = JSON.parse(localStorage.getItem('projects'))
            } catch (e) {
                console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
            }
            console.log('projects', projects);
            if (projects.length){
                this.loadProject(projects[projects.length -1])
            }
        })

        this.$on('toolbar:saveProject', (e) => {
            this.saveProject()
        })

        this.$on('toolbar:downloadProject', (e) => {
            this.downloadProject()
        })

        this.$on('tree:selectModel', (e) => {
            this.project.selectModel(e.value)
            this.$emit('project:selectModel')
        })

        this.$on('options:changeName', (e) => {
            this.project.renameSelected(e.value)
            this.$emit('project:changeName')
        })

        this.$on('options:opacity', (e) => {
            if (this.project.model) {
                this.project.model.graphicOptions.opacity = e.value
                this.project.model.graphicOptions.needUpdate = true
            }
        })

        this.$on('options:applyDefaultSteps', (e) => {
            this.project.options.model.defaultSteps = e.value
            if (this.project.model) {
                this.$emit('project:updateModel')
            }
        })

        this.$on('options:addChild', (e) => {
            this.project.addChild()
            this.$emit('project:selectModel')
        })

        this.$on('options:removeModel', (e) => {
            this.project.removeModel()
        })


        // boxContainerPosition
        this.$on('options:boxContainerPosition_x', (e) => {
            this.project.moveXSelected(e.value)
        })
        this.$on('options:boxContainerPosition_y', (e) => {
            this.project.moveYSelected(e.value)
        })
        this.$on('options:boxContainerPosition_z', (e) => {
            this.project.moveZSelected(e.value)
        })

        // boxContainerRotation
        this.$on('options:boxContainerRotation_x', (e) => {
            this.project.rotateXSelected(e.value)
        })
        this.$on('options:boxContainerRotation_y', (e) => {
            this.project.rotateYSelected(e.value)
        })
        this.$on('options:boxContainerRotation_z', (e) => {
            this.project.rotateZSelected(e.value)
        })

        // boxPosition
        this.$on('options:boxPosition_x', (e) => {
            this.project.moveContentXSelected(e.value)
        })
        this.$on('options:boxPosition_y', (e) => {
            this.project.moveContentYSelected(e.value)
        })
        this.$on('options:boxPosition_z', (e) => {
            this.project.moveContentZSelected(e.value)
        })

        // boxSize
        this.$on('options:boxSize_x', (e) => {
            this.project.sizeContentXSelected(e.value)
        })
        this.$on('options:boxSize_y', (e) => {
            this.project.sizeContentYSelected(e.value)
        })
        this.$on('options:boxSize_z', (e) => {
            this.project.sizeContentZSelected(e.value)
        })

        this.$on('options:boxSize_autoY', (e) => {
            this.project.setSizeYByMash()
            this.$emit('project:updateModel')
        })

        this.$on('options:boxSize_autoZ', (e) => {
            this.project.setSizeZByMash()
            this.$emit('project:updateModel')
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
            app: this
        }

        this.components = this.components.map(Component => {
            const $el = $.create('div', Component.className)
            const component = new Component($el, componentOptions)
            $el.html(component.toHTML())
            const container = component.wrapperSelector ? $root.find(component.wrapperSelector) : $root
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

    projectInit() {
        this.project.init()
        this.$emit('project:loadProject')

        // this.project.loadModel().then(()=>{
        //     this.$emit('project:loadModel')
        // })
        this.project.loadModel()
        this.$emit('project:loadModel')
        this.$emit('project:selectModel')
        console.log('this.project', this.project)

        // setTimeout(()=>{
        //     let projects
        //     try {
        //         projects = JSON.parse(localStorage.getItem('projects'))
        //     } catch (e) {
        //         console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
        //     }
        //     console.log('projects', projects);
        //     if (projects.length){
        //         this.loadProject(projects[projects.length -1])
        //     }
        // }, 1000)
    }

    saveProject() {
        // let json = this.project.toJSON()
        // this.loadProject(json)
        // const projects localStorage.setItem('myCat', 'Tom');
        let projects
        try {
            projects = JSON.parse(localStorage.getItem('projects'))
        } catch (e) {
            console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
        }
        if (!projects || !Array.isArray(projects)) projects = []

        let finded
        projects = projects.map(one => {
            if (one.id === this.project.id) {
                finded = true
                return this.project.getForStore()
            }
            return one
        })
        if (!finded) {
            projects.push(this.project.getForStore())
        }
        localStorage.setItem('projects', JSON.stringify(projects))
        // localStorage.setItem('projects', projects);
    }

    downloadProject(){
        download(JSON.stringify(this.project.getForStore()), `${this.project.name}.json`, 'application/json')
    }

    loadProject(projObj) {
        if (!projObj) return

        console.log('projObj', projObj);

        const project = new Project(projObj)
        project.init()
        this.project.destroy()
        this.project = project
        this.$emit('project:loadProject')

        if (projObj.model) {
            const model = Model.fromOBJ(projObj.model)
            console.log('projObj.model', projObj.model)
            console.log('model', model)
            // return
            project.loadModel(Model.fromOBJ(projObj.model))
        }

        this.$emit('project:loadModel')
        this.$emit('project:selectModel')


    }
}
