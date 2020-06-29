/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {v4 as uuidv4} from 'uuid'
import {Model, OBB} from '@core/physicEngine/geometry/Geometry3D'
import {loadModel} from '@/logicComponents/project/project.functions'
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
                drawCenters:true,
                selectedColor:'#ff0000',
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

    loadMeshModel() {

        return loadModel(this.meshUrl)
            .then(object => {
                this.meshModel = new Model({
                    name: 'modelThreejs',
                    type: 'THREEJS_OBJ',
                    content: object
                })
            })


    }

    loadModel() {

        return new Promise((res, rej) => {
            this.model = new Model({
                name: 'Model1',
                // rotation: new Vector3(0, 0, 0),
                // content: new OBB(new Vector3(1000, 1000, 1000), new Vector3(1000, 1000, 1000))
                content: new OBB(null, new Vector3(1000, 1000, 1000))
            })

            this.model.graphicOptions.opacity = this.options.model.opacity
            this.model.graphicOptions.drawCenters = this.options.model.drawCenters
            this.model.graphicOptions.needUpdate = true

            this.selectModel(this.model.id)
            res(null)
        })


    }

    addChild(){
        if (!this.selectedModel) return

        const model = new Model({
            name: `${this.selectedModel.name}_${this.selectedModel.childs.length + 1}`,
            content: new OBB(new Vector3(), new Vector3(500, 500, 500))
        })

        // model.graphicOptions.opacity = this.options.model.opacity
        // model.graphicOptions.drawCenters = this.options.model.drawCenters
        model.graphicOptions.needUpdate = true

        this.selectedModel.addChild(model)
        this.selectModel(model.id)
        // this.selectedModel.setGraphicOption('opacity', this.options.model.opacity)

    }

    removeModel(){
        console.log('Not implemented now');
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
    moveXSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.setPositionX(val)
    }

    moveYSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.setPositionY(val)
    }

    moveZSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.setPositionZ(val)
    }

    rotateXSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.rotateX(val)
    }

    rotateYSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.rotateY(val)
    }

    rotateZSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.rotateZ(val)
    }

    // Content
    moveContentXSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.setContentPositionX(val)
    }

    moveContentYSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.setContentPositionY(val)
    }

    moveContentZSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.setContentPositionZ(val)
    }

    sizeContentXSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.sizeX(val)
    }

    sizeContentYSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.sizeY(val)
    }

    sizeContentZSelected(val){
        if (!this.selectedModel) return
        this.selectedModel.sizeZ(val)
    }

}
