/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {v4 as uuidv4} from 'uuid'
import {Model, OBB, AABB} from '@core/physicEngine/geometry/Geometry3D'
import {loadThreeJSModel} from '@/logicComponents/project/project.functions'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'

export class Project {
    constructor(obj = {}) {
        this.id = obj.id || uuidv4()
        this.name = obj.name || 'Empty'
        this.meshFile = obj.meshFile
        this.meshUrl = obj.meshUrl

        this.options = {
            model: {
                opacity: 0.8,
                drawCenters: true,
                drawWheelAxles: true,
                selectedColor: '#ff0000',
                defaultSteps: {
                    size: 100,
                    position: 100,
                    rotation: 1
                }
            }
        }

        // const rotateMatrix = new Matrix3().rotation(1, 91, 181)
        // const obb = new OBB(new Vector3(), new Vector3(10, 10, 10), rotateMatrix)
        // console.log(obb, obb.rotation);

    }

    init() {

    }

    destroy() {
        if (this.model && typeof this.model.destroy === 'function') this.model.destroy()
        if (this.meshModel && typeof this.meshModel.destroy === 'function') this.meshModel.destroy()
        delete this.model
        delete this.meshFile
        delete this.meshModel
    }

    loadMeshUrl(file) {
        return new Promise((res, rej) => {
            this.meshFile = file

            var reader = new FileReader()
            reader.onload = () => {
                this.meshUrl = reader.result
                res(this.meshUrl)
            }
            reader.onerror = (error) => {
                console.error('error while reading file', error)
                rej(error)
            }
            reader.readAsDataURL(file)
        })
    }

    // loadJSONProject(file) {
    //     return new Promise((res, rej) => {
    //         this.meshFile = file
    //
    //         var reader = new FileReader()
    //         reader.onload = () => {
    //             this.meshUrl = reader.result
    //             res(this.meshUrl)
    //         }
    //         reader.onerror = (error) => {
    //             console.error('error while reading file', error)
    //             rej(error)
    //         }
    //         reader.readAsDataURL(file)
    //     })
    // }

    loadMeshModel() {

        return loadThreeJSModel(this.meshUrl)
            .then(object => {
                this.meshModel = new Model({
                    name: 'modelThreejs',
                    type: 'THREEJS_OBJ',
                    content: object
                })
            })


    }

    loadModel(modelOrObj = {}) {
        if (modelOrObj instanceof Model){
            this.model = modelOrObj
            this.selectModel(this.model.id)
        } else {
            this.model = new Model({
                name: typeof modelOrObj.name !== 'undefined' ? modelOrObj.name : 'Model1',
                // rotation: new Vector3(0, 0, 0),
                // content: new OBB(new Vector3(1000, 1000, 1000), new Vector3(1000, 1000, 1000))
                content: new OBB(null, new Vector3(100, 100, 100))
            })

            if (modelOrObj.graphicOptions){
                this.model.graphicOptions = modelOrObj.graphicOptions
            } else {
                this.model.graphicOptions.opacity = this.options.model.opacity
                this.model.graphicOptions.drawCenters = this.options.model.drawCenters
                this.model.graphicOptions.needUpdate = true
            }

            this.selectModel(this.model.id)
        }

        // return new Promise((res, rej) => {
        //     this.model = new Model({
        //         name: typeof modelOrObj.name !== 'undefined' ? modelOrObj.name : 'Model1',
        //         // rotation: new Vector3(0, 0, 0),
        //         // content: new OBB(new Vector3(1000, 1000, 1000), new Vector3(1000, 1000, 1000))
        //         content: new OBB(null, new Vector3(100, 100, 100))
        //     })
        //
        //     if (modelOrObj.graphicOptions){
        //         this.model.graphicOptions = modelOrObj.graphicOptions
        //     } else {
        //         this.model.graphicOptions.opacity = this.options.model.opacity
        //         this.model.graphicOptions.drawCenters = this.options.model.drawCenters
        //         this.model.graphicOptions.needUpdate = true
        //     }
        //
        //     this.selectModel(this.model.id)
        //     res(null)
        // })


    }

    getForStore() {
        const res = {
            id:this.id,
            name:this.name,
            options:this.options,
            model: this.model? this.model.getForStore() : null
        }

        return res
    }

    saveToJSON(){
        const json = this.toJSON()
        // console.log(json);
        // var o = JSON.parse(json)
        // console.log('o', o);

        return this.toJSON()
    }

    loadFromJson(json) {
        let proj
        try {
            proj = JSON.parse(json)
        } catch (e) {
            console.error('Error while loading project from JSON', e)
        }
        if (proj) return



    }

    addChild() {
        if (!this.selectedModel) return

        const model = new Model({
            name: `${this.selectedModel.name}_${this.selectedModel.childs.length + 1}`,
            content: new OBB(new Vector3(), new Vector3(100, 100, 100))
        })

        // model.graphicOptions.opacity = this.options.model.opacity
        // model.graphicOptions.drawCenters = this.options.model.drawCenters
        model.graphicOptions.needUpdate = true

        this.selectedModel.addChild(model)
        this.selectModel(model.id)
        // this.selectedModel.setGraphicOption('opacity', this.options.model.opacity)

    }

    removeModel(id) {
        const model = id? this.model.getById(id) : this.selectedModel
        if (!model) return new Error('Model not found')
        if (!model.parent) return new Error('Top model can`t be deleted')
        const parentId = model.parent.id
        model.parent.removeChild(model)
        this.selectModel(parentId)
        return false
    }

    selectModel(id) {
        if (!this.model) return
        this.model.setGraphicOption('materialColor', '#00FF00', true)
        this.selectedModel = this.model.getById(id)
        this.selectedModel.setGraphicOption('materialColor', '#ff8100', true)
        this.selectedModel.setGraphicOption('materialColor', '#ff2000')
    }

    renameSelected(val) {
        if (!this.selectedModel) return
        this.selectedModel.name = val
    }

    // Container
    moveXSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.setPositionX(+val)
    }

    moveYSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.setPositionY(+val)
    }

    moveZSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.setPositionZ(+val)
    }

    rotateXSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.rotateToX(+val)
    }

    rotateYSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.rotateToY(+val)
    }

    rotateZSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.rotateToZ(+val)
    }

    // Content
    moveContentXSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.setContentPositionX(+val)
    }

    moveContentYSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.setContentPositionY(+val)
    }

    moveContentZSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.setContentPositionZ(+val)
    }

    sizeContentXSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.sizeX(+val)
    }

    sizeContentYSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.sizeY(+val)
    }

    sizeContentZSelected(val) {
        if (!this.selectedModel) return
        if (isNaN(+val)) return
        this.selectedModel.sizeZ(+val)
    }

    getSizeYByMash() {
        if (!this.selectedModel || !this.meshModel) return null
        const vertices = this.meshModel.verticesAll
        const boundsFull = this.selectedModel.boundsFull
        const minX = boundsFull.getMin().x
        const maxX = boundsFull.getMax().x
        const filtred = vertices.filter(one => {
            return one.x >= minX && one.x <= maxX
        })
        let min, max
        filtred.forEach(one => {
            if (!min) min = new Vector3(one.x, one.y, one.z)
            if (!max) max = new Vector3(one.x, one.y, one.z)
            min.x = Math.min(one.x, min.x)
            min.y = Math.min(one.y, min.y)
            min.z = Math.min(one.z, min.z)

            max.x = Math.max(one.x, max.x)
            max.y = Math.max(one.y, max.y)
            max.z = Math.max(one.z, max.z)
        })
        if (!min) min = new Vector3()
        if (!max) max = new Vector3()
        return AABB.fromMinMax(min, max)
    }

    getSizeZByMash() {
        if (!this.selectedModel || !this.meshModel) return null
        const vertices = this.meshModel.verticesAll
        const minX = this.selectedModel.boundsFull.getMin().x
        const maxX = this.selectedModel.boundsFull.getMax().x
        const minY = this.selectedModel.boundsFull.getMin().y
        const maxY = this.selectedModel.boundsFull.getMax().y
        const filtred = vertices.filter(one => {
            return one.x >= minX && one.x <= maxX && one.y >= minY && one.y <= maxY
        })
        let min, max
        filtred.forEach(one => {
            if (!min) min = new Vector3(one.x, one.y, one.z)
            if (!max) max = new Vector3(one.x, one.y, one.z)
            min.x = Math.min(one.x, min.x)
            min.y = Math.min(one.y, min.y)
            min.z = Math.min(one.z, min.z)

            max.x = Math.max(one.x, max.x)
            max.y = Math.max(one.y, max.y)
            max.z = Math.max(one.z, max.z)
        })
        return AABB.fromMinMax(min, max)
    }


    setSizeYByMash() {
        if (!this.selectedModel || !this.meshModel) return null
        const aabb = this.getSizeYByMash()
        this.sizeContentYSelected(aabb.size.y)
    }

    setSizeZByMash() {
        if (!this.selectedModel || !this.meshModel) return null
        const aabb = this.getSizeZByMash()
        this.sizeContentZSelected(aabb.size.z)
    }

    // wheel axles
    addWheelAxle() {
        if (!this.selectedModel) return

        const topModel = this.selectedModel.getTopModel()
        const axle = {
            id: uuidv4(),
            x:0,
            y:0,
            width:topModel.content.size.z,
            radius:300,
        }
        // if (!topModel._wheelAxles) topModel._wheelAxles = []
        topModel._wheelAxles.push(axle)
        topModel.initSupportGroups()
    }

    wheelAxleX(id, val) {
        if (!this.selectedModel) return

        const topModel = this.selectedModel.getTopModel()

        const axle = topModel._wheelAxles.filter(one=>one.id === id)[0]
        if (!axle) {
            console.warn('Axle not found', id)
            return
        }
        axle.x = +val
        topModel.initSupportGroups()
    }


    wheelAxleY(id, val) {
        if (!this.selectedModel) return

        const topModel = this.selectedModel.getTopModel()

        const axle = topModel._wheelAxles.filter(one=>one.id === id)[0]
        if (!axle) {
            console.warn('Axle not found', id)
            return
        }
        axle.y = +val
        topModel.initSupportGroups()
    }

    wheelAxleWidth(id, val) {
        if (!this.selectedModel) return

        const topModel = this.selectedModel.getTopModel()

        const axle = topModel._wheelAxles.filter(one=>one.id === id)[0]
        if (!axle) {
            console.warn('Axle not found', id)
            return
        }
        axle.width = +val
        topModel.initSupportGroups()
    }

    wheelAxleRadius(id, val) {
        if (!this.selectedModel) return

        const topModel = this.selectedModel.getTopModel()

        const axle = topModel._wheelAxles.filter(one=>one.id === id)[0]
        if (!axle) {
            console.warn('Axle not found', id)
            return
        }
        axle.radius = +val
        axle.needUpdate = true
        topModel.initSupportGroups()
    }

}
