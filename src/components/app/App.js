/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {$} from '@core/jquery.extends'
import moment from 'moment'
import {Emitter} from '@core/Emitter'
import {Project} from '@/logicComponents/project/Project'
import {Model} from '@core/physicEngine/geometry/Geometry3D'
import {copyToClipboard, download} from '@core/utils'
import * as bootbox from 'bootbox'
import * as toastr from 'toastr'
import {populateProjects, populateStates, readFromJSONFile} from '@/components/app/app.functions'
import {manageStateInit} from '@/components/app/app.states'

export class App {
    constructor(selector, options) {
        this.$wrapper = $(selector)
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
        this.$on('toolbar:uploadJSONProject', async (e) => {
            // let project
            // const _t = this

            // If json passed :
            let jsonText = e.json
            // If file passed :
            const file = e.file
            let jsonObj


            if (jsonText) {
                try {
                    jsonObj = JSON.parse(jsonText)
                } catch (e) {
                    toastr.error('Invalid JSON')
                    console.error('Invalid JSON', e, jsonText)
                }

            } else if (file) {


                try {
                    jsonObj = await readFromJSONFile(file)
                } catch (e) {
                    console.error(e)
                    return
                }
            }
            if (!jsonObj) return

            if (Array.isArray(jsonObj)) {
                jsonObj.forEach(one => {
                    this.loadProjectFromObj(one, true)
                })
            } else {
                this.loadProjectFromObj(jsonObj, true)
            }

        })

        this.$on('toolbar:removeMesh', (e) => {
            toastr.info('Method not implemented')
        })

        this.$on('toolbar:newProject', (e) => {
            this.loadProject()
        })

        this.$on('toolbar:loadProject', (e) => {

            let projects
            try {
                projects = JSON.parse(localStorage.getItem('projects'))
            } catch (e) {
                toastr.error('Error while parsing localStorage "projects". You can clear LocalStorage manually')
                console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
                return
            }

            if (!projects.length) return toastr.info('No saved projects')


            //
            // if (projects.length){
            //     this.loadProject(projects[projects.length -1])
            // }


            const html = `
                    <div class="attention">All unsaved data will be lost. Save current project before!</div>
                    <div class="load-project-modal-container">
                        <h5>Projects:</h5>
                        ${populateProjects(projects)}
                    </div>
                `

            const b1 = bootbox.alert({
                title: "Open Project",
                message: html
            })
            const _t = this
            b1.find('[data-type="project-row-select"]').off('click').on('click', function(e) {
                const $this = $(this)
                const id = $this.data('id')
                const project = projects.filter(one => one.id === id)[0]
                if (project) {
                    b1.modal('hide')
                    _t.loadProject(project)

                }
            })

            b1.find('button[data-type="project-row-remove-btn"]').off('click').on('click', function(e) {
                e.stopPropagation()
                const $this = $(this)
                const id = $this.data('id')
                bootbox.confirm({
                    title: `Remove Project "${$this.data('name')} (${id})"`,
                    message: '<div class="attention">Are you sure?</div>',
                    callback: (res) => {
                        if (!res) return
                        const err = _t.removeProject(id)
                        if (!err) $this.parent('.one-project-row').remove()
                        toastr.success('Project successful deleted')
                    }
                })
            })

        })

        this.$on('toolbar:saveProject', (e) => {
            this.saveProject()
        })

        this.$on('toolbar:uploadProject', (e) => {
            toastr.info('Method not implemented')
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
            this.$emit('model:selectState')
        })

        this.$on('toolbar:copyProject', (e) => {
            this.copyProject()
        })

        this.$on('toolbar:downloadProject', (e) => {
            this.downloadProject()
        })

        this.$on('toolbar:downloadAllProjects', (e) => {
            bootbox.confirm({
                title: `Download ALL Projects`,
                message: '<div class="attention">Only saved projects will be download</div>',
                callback: (res) => {
                    if (!res) return
                    this.downloadProjects()
                }
            })
        })


        manageStateInit.call(this)


        this.$on('header:changeProjectName', (e) => {
            this.project.name = e.value
            this.$emit('project:changeProjectName')
        })

        this.$on('tree:selectModel', (e) => {
            this.project.selectModel(e.value)
            this.$emit('project:selectModel')
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        this.$on('options:changeName', (e) => {
            this.project.renameSelected(e.value)
            this.$emit('project:changeName')
        })

        this.$on('options:changeAlias', (e) => {
            if (this.project.model) {
                this.project.model.alias = e.value
            }
        })

        this.$on('options:opacity', (e) => {
            if (this.project.model) {
                this.project.model.graphicOptions.opacity = e.value
                this.project.model.graphicOptions.needUpdate = true
            }
        })

        this.$on('options:supportPlatformRamp_isSupport', (e) => {
            if (this.project.selectedModel) {
                this.project.selectedModel.isSupport = e.value
            }
        })
        this.$on('options:supportPlatformRamp_isPlatform', (e) => {
            if (this.project.selectedModel) {
                this.project.selectedModel.isPlatform = e.value
            }
        })
        this.$on('options:supportPlatformRamp_isRamp', (e) => {
            if (this.project.selectedModel) {
                this.project.selectedModel.isRamp = e.value
            }
        })
        this.$on('options:supportPlatformRamp_isSteepRamp', (e) => {
            if (this.project.selectedModel) {
                this.project.selectedModel.isSteepRamp = e.value
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
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        this.$on('options:removeModel', (e) => {

            bootbox.confirm({
                title: `Remove model`,
                message: '<div class="attention">All child models will be deleted. Are you sure?</div>',
                callback: (res) => {
                    if (!res) return
                    const err = this.project.removeModel()
                    if (err) toastr.error(err.message)
                    this.$emit('project:selectModel')
                }
            })
        })


        // boxContainerPosition
        this.$on('options:boxContainerPosition_x', (e) => {
            this.project.moveXSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxContainerPosition_y', (e) => {
            this.project.moveYSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxContainerPosition_z', (e) => {
            this.project.moveZSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        // boxContainerRotation
        this.$on('options:boxContainerRotation_x', (e) => {
            this.project.rotateXSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxContainerRotation_y', (e) => {
            this.project.rotateYSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxContainerRotation_z', (e) => {
            this.project.rotateZSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        // boxPosition
        this.$on('options:boxPosition_x', (e) => {
            this.project.moveContentXSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxPosition_y', (e) => {
            this.project.moveContentYSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxPosition_z', (e) => {
            this.project.moveContentZSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        // boxSize
        this.$on('options:boxSize_x', (e) => {
            this.project.sizeContentXSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxSize_y', (e) => {
            this.project.sizeContentYSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })
        this.$on('options:boxSize_z', (e) => {
            this.project.sizeContentZSelected(e.value)
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        this.$on('options:boxSize_autoY', (e) => {
            this.project.setSizeYByMash()
            this.$emit('project:updateModel')
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })

        this.$on('options:boxSize_autoZ', (e) => {
            this.project.setSizeZByMash()
            this.$emit('project:updateModel')
            this.$emit('model:boundsChange', {model: this.project.selectedModel})
        })


        // wheelAxles
        this.$on('options:wheelAxleAdd_add', (e) => {
            this.project.addWheelAxle()
            if (this.project.model) {
                this.$emit('project:updateModel')
            }
        })

        this.$on('options:wheelAxleRemove_remove', (e) => {
            this.project.removeWheelAxle(e.id)
            this.$emit('project:updateModel')
        })

        this.$on('options:wheelAxle_x', (e) => {
            this.project.wheelAxleX(e.id, e.value)
        })
        this.$on('options:wheelAxle_y', (e) => {
            this.project.wheelAxleY(e.id, e.value)
        })
        this.$on('options:wheelAxle_width', (e) => {
            this.project.wheelAxleWidth(e.id, e.value)
        })
        this.$on('options:wheelAxle_radius', (e) => {
            this.project.wheelAxleRadius(e.id, e.value)
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
            const container = component.wrapperSelector ? $($root.find(component.wrapperSelector)[0]) : $root
            container.append($el)
            return component
        })

        return $root
    }

    render() {
        // const node = document.createElement('h1')
        // node.textContent = 'TEST'
        this.$wrapper.append(this.getRoot())

        this.components.forEach(component => component.init())
    }

    destroy() {
        this.components.forEach(component => component.destroy())
        this.unsubscribers.forEach(unsub => unsub())
    }

    projectInit() {
        this.project.init()
        this.$emit('project:loadProject')
        this.project.loadModel()
        this.$emit('project:loadModel')
        this.$emit('project:selectModel')
    }

    // newProject() {
    //     const project = new Project()
    //     project.init()
    //     this.project.destroy()
    //     this.project = project
    //     this.$emit('project:loadProject')
    //     this.$emit('project:loadModel')
    //     this.$emit('project:selectModel')
    // }

    removeProject(id) {
        // let json = this.project.toJSON()
        // this.loadProject(json)
        // const projects localStorage.setItem('myCat', 'Tom');
        let projects
        try {
            projects = JSON.parse(localStorage.getItem('projects'))
        } catch (e) {
            toastr.error('Error while parsing localStorage "projects". You can clear LocalStorage manually')
            console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
            return e
        }
        if (!projects || !Array.isArray(projects)) projects = []

        projects = projects.filter(one => one.id !== id)
        localStorage.setItem('projects', JSON.stringify(projects))
        return false
    }

    saveProject() {
        // let json = this.project.toJSON()
        // this.loadProject(json)
        // const projects localStorage.setItem('myCat', 'Tom');
        let projects
        try {
            projects = JSON.parse(localStorage.getItem('projects'))
        } catch (e) {
            toastr.error('Error while parsing localStorage "projects". You can clear LocalStorage manually')
            console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
            return
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

    copyProject() {
        copyToClipboard(JSON.stringify(this.project.getForStore()))
        toastr.info('Copied to clipboard')
    }

    downloadProject() {
        download(JSON.stringify(this.project.getForStore()), `${this.project.name}.json`, 'application/json')
    }

    downloadProjects() {
        download(localStorage.getItem('projects'), `projects_${moment().format('YYYY_MM_DD_HHmm')}.json`, 'application/json')
    }

    loadProjectFromObj(obj, save) {
        let project
        if (!obj.model) {
            // This json is not a project - it is a Model
            project = {
                name: obj.name,
                model: {...obj}
            }
        } else {
            project = {...obj}
        }
        this.loadProject(project)
        if (save) this.saveProject()
    }

    loadProject(projObj = {}) {
        if (!projObj) return

        const project = new Project(projObj)
        project.init()
        this.project.destroy()
        this.project = project
        this.$emit('project:loadProject')
        this.$emit('model:selectState')

        let model
        if (projObj.model) {
            model = Model.fromOBJ(projObj.model)
        }
        project.loadModel(model)

        // if (projObj.model) {
        //     const model = Model.fromOBJ(projObj.model)
        //     console.log('projObj.model', projObj.model)
        //     console.log('model', model)
        //     // return
        //     project.loadModel(Model.fromOBJ(projObj.model))
        // }

        this.$emit('project:loadModel')
        this.$emit('project:selectModel')


    }
}
